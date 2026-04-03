import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { db } from "@workspace/db";
import { e2emGrants } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getTokenPayload } from "./auth";

const router: IRouter = Router();

function getOpenAIClient(): OpenAI | null {
  const baseURL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  if (!baseURL || !apiKey) return null;
  return new OpenAI({ baseURL, apiKey });
}

async function ghFetch<T>(url: string, token: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

type GHCommit = {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
  };
};

type GHCommitDetail = {
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
  }>;
  stats?: { additions: number; deletions: number };
};

function formatDateDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function buildGmailUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function buildMailtoUrl(to: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

router.get("/grant", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const grants = await db
      .select()
      .from(e2emGrants)
      .where(
        sql`lower(${e2emGrants.github_username}) = lower(${payload.githubUser.login}) AND ${e2emGrants.enabled} = true`
      )
      .limit(1);

    if (grants.length === 0) {
      res.json({ granted: false });
      return;
    }

    const grant = grants[0]!;
    res.json({
      granted: true,
      id: grant.id,
      repos: grant.repos,
      recipient_name: grant.recipient_name,
      recipient_email: grant.recipient_email,
      user_display_name: grant.user_display_name ?? payload.githubUser.login,
    });
  } catch (err) {
    req.log.error({ err }, "e2em grant check error");
    res.status(500).json({ error: "Failed to check grant" });
  }
});

router.post("/generate", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const body = req.body as {
    repos?: string[];
    date?: string;
    recipient_name?: string;
    recipient_email?: string;
    user_display_name?: string;
  };

  try {
    const grants = await db
      .select()
      .from(e2emGrants)
      .where(
        sql`lower(${e2emGrants.github_username}) = lower(${payload.githubUser.login}) AND ${e2emGrants.enabled} = true`
      )
      .limit(1);

    if (grants.length === 0) {
      res.status(403).json({ error: "e2em not enabled for your account" });
      return;
    }

    const grant = grants[0]!;
    const targetRepos: string[] = body.repos ?? grant.repos ?? [];
    const recipientName = body.recipient_name ?? grant.recipient_name ?? "Sir";
    const recipientEmail = body.recipient_email ?? grant.recipient_email ?? "";
    const userDisplayName = body.user_display_name ?? grant.user_display_name ?? payload.githubUser.login;

    const reportDate = body.date ? new Date(body.date) : new Date();
    const dateStr = formatDateDDMMYYYY(reportDate);

    // Fetch recent commits from each repo (last 7 days) in parallel
    const since = new Date(reportDate);
    since.setDate(since.getDate() - 1);
    const sinceISO = since.toISOString();

    const allCommits: Array<{ repo: string; sha: string; message: string; date: string }> = [];

    const githubToken: string = payload.githubToken;

    for (const repoFullName of targetRepos) {
      const [owner, repoName] = repoFullName.split("/");
      if (!owner || !repoName) continue;

      const commits = await ghFetch<GHCommit[]>(
        `https://api.github.com/repos/${owner}/${repoName}/commits?since=${sinceISO}&per_page=30&author=${payload.githubUser.login}`,
        githubToken
      );

      if (commits) {
        for (const c of commits) {
          allCommits.push({
            repo: repoFullName,
            sha: c.sha,
            message: c.commit.message.split("\n")[0]!.trim(),
            date: c.commit.author?.date ?? "",
          });
        }
      }
    }

    // Fetch file details for up to 10 commits
    const commitDetails: Array<{
      repo: string;
      message: string;
      files: string[];
    }> = [];

    const detailFetches = allCommits.slice(0, 10).map(async (c) => {
      const [owner, repoName] = c.repo.split("/");
      const detail = await ghFetch<GHCommitDetail>(
        `https://api.github.com/repos/${owner}/${repoName}/commits/${c.sha}`,
        githubToken
      );
      return {
        repo: c.repo,
        message: c.message,
        files: (detail?.files ?? []).map((f) => f.filename).slice(0, 8),
      };
    });

    const settled = await Promise.allSettled(detailFetches);
    for (const r of settled) {
      if (r.status === "fulfilled") commitDetails.push(r.value);
    }

    // Build prompt
    const commitSummary =
      commitDetails.length > 0
        ? commitDetails
            .map(
              (c) =>
                `[${c.repo}] ${c.message}${c.files.length ? `\n  Files: ${c.files.join(", ")}` : ""}`
            )
            .join("\n")
        : "No commits found for this date.";

    const subject = `YIP Daily Development Report (${dateStr})`;

    const openai = getOpenAIClient();
    let highlights: string[] = [];

    if (openai && commitDetails.length > 0) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a developer writing a concise daily work report email.
Generate exactly 3-5 short bullet points (key highlights) based on the commits provided.
Each bullet should be a complete, professional sentence describing what was done.
Do NOT include repo names in the bullets. Do NOT add headers, intros, or sign-offs.
Return ONLY the bullet points, one per line, each starting with "• ".`,
          },
          {
            role: "user",
            content: `Commits from ${dateStr}:\n\n${commitSummary}\n\nGenerate the key highlights.`,
          },
        ],
        max_tokens: 400,
        temperature: 0.4,
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      highlights = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("•"));
    }

    if (highlights.length === 0) {
      highlights = commitDetails
        .slice(0, 5)
        .map((c) => `• ${c.message}`);
    }

    if (highlights.length === 0) {
      highlights = ["• No commits recorded for this date"];
    }

    const emailBody = `Dear ${recipientName} Sir,

Here's a brief summary of work progress on ${dateStr}:

Key Highlights:

${highlights.join("\n")}

Best regards,
${userDisplayName}`;

    const gmailUrl = buildGmailUrl(recipientEmail, subject, emailBody);
    const mailtoUrl = buildMailtoUrl(recipientEmail, subject, emailBody);

    res.json({ subject, body: emailBody, gmail_url: gmailUrl, mailto_url: mailtoUrl, commit_count: allCommits.length });
  } catch (err) {
    req.log.error({ err }, "e2em generate error");
    res.status(500).json({ error: "Failed to generate standup" });
  }
});

export default router;
