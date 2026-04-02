import { Router, type IRouter } from "express";
import { SummarizeCommitsBody, SummarizeCommitsResponse } from "@workspace/api-zod";
import OpenAI from "openai";
import { getTokenPayload } from "./auth";

const router: IRouter = Router();

function getOpenAIClient(): OpenAI | null {
  const baseURL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  if (!baseURL || !apiKey) return null;
  return new OpenAI({ baseURL, apiKey });
}

type CommitPayload = {
  message: string;
  files: Array<{ filename: string; status: string; additions: number; deletions: number }>;
  stats?: { additions: number; deletions: number };
};

type DepContextItem = {
  name: string;
  current_version: string;
  latest_version: string;
  severity: "major" | "minor" | "patch";
  ecosystem: string;
};

function buildDepContextSection(depContext: DepContextItem[]): string {
  if (!depContext.length) return "";
  const lines = depContext
    .map((d) => {
      const badge = d.severity === "major" ? "MAJOR" : d.severity === "minor" ? "minor" : "patch";
      return `  - ${d.name} (${d.ecosystem}): ${d.current_version} → ${d.latest_version} [${badge}]`;
    })
    .join("\n");
  return `\nDEPENDENCY CONTEXT (stale packages in this repo):\n${lines}\n\nWhen suggesting next steps, consider whether any of these outdated dependencies are relevant to the active work and whether upgrading them is worth prioritizing.\n`;
}

function generateMockSummary(repoName: string, commits: CommitPayload[], mode: string) {
  const allFiles = [...new Set(commits.flatMap((c) => c.files.map(f => f.filename)))];
  const fileExtensions = allFiles
    .map((f) => f.split(".").pop())
    .filter(Boolean)
    .filter((ext) => ["ts", "tsx", "js", "jsx", "py", "go", "rs", "css"].includes(ext as string));

  const uniqueExts = [...new Set(fileExtensions)];
  const commitMessages = commits.map((c) => c.message).join(", ");

  const totalAdditions = commits.reduce((sum, c) => sum + (c.stats?.additions ?? 0), 0);
  const totalDeletions = commits.reduce((sum, c) => sum + (c.stats?.deletions ?? 0), 0);
  const statsLabel = totalAdditions + totalDeletions > 0
    ? ` (+${totalAdditions}/-${totalDeletions} lines across all commits)`
    : "";

  const standupUpdate = mode === "standup"
    ? `Yesterday: Worked on ${repoName}, modifying ${allFiles.slice(0, 3).join(", ")}${statsLabel}. Commits: ${commitMessages.substring(0, 150)}.\nToday: Continue work on ${allFiles[0] ?? "the modified files"} and run the test suite.\nBlockers: None.`
    : undefined;

  return {
    what_you_were_doing: `You were working on ${repoName}, primarily modifying ${allFiles.slice(0, 3).join(", ")}${allFiles.length > 3 ? ` and ${allFiles.length - 3} more files` : ""}${statsLabel}. Recent commits: ${commitMessages.substring(0, 200)}.`,
    key_changes: [
      `Modified ${allFiles.length} file(s) across ${commits.length} commit(s)${statsLabel}`,
      uniqueExts.length > 0
        ? `Working with ${uniqueExts.join(", ")} files`
        : "Making configuration and documentation changes",
      commits[0]
        ? `Most recent: "${commits[0].message}"`
        : "Recent commits staged",
      allFiles.some((f) => f.includes("test") || f.includes("spec"))
        ? "Added or updated tests"
        : "Feature implementation in progress",
    ],
    suggested_next_steps: [
      `Open ${allFiles[0] ?? "the modified files"} to pick up where you left off`,
      "Run the test suite to make sure everything is passing",
      "Check for any TODO comments left in the recent commits",
      `Review the git diff for ${repoName} to see the full scope of changes`,
      "Consider writing a summary comment or updating the documentation",
    ],
    standup_update: standupUpdate ?? null,
    generated_at: new Date().toISOString(),
  };
}

router.post("/summarize", async (req, res) => {
  if (!getTokenPayload(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = SummarizeCommitsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { repo_name, commits, mode = "next_steps" } = parsed.data;

  // Read optional dep_context from the raw body (not in generated schema)
  const rawBody = req.body as Record<string, unknown>;
  const rawDepCtx = Array.isArray(rawBody["dep_context"]) ? (rawBody["dep_context"] as unknown[]) : [];
  const depContext: DepContextItem[] = rawDepCtx.filter(
    (item): item is DepContextItem =>
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      "current_version" in item &&
      "latest_version" in item &&
      "severity" in item
  );

  const openai = getOpenAIClient();

  if (!openai) {
    req.log.warn("OpenAI not configured, using mock response");
    const mockData = generateMockSummary(repo_name, commits, mode);
    const data = SummarizeCommitsResponse.parse(mockData);
    res.json(data);
    return;
  }

  try {
    const commitSummary = commits
      .map(
        (c: { sha: string; message: string; author_date: string; files: Array<{ filename: string; status: string; additions: number; deletions: number }>; stats: { additions: number; deletions: number } }, i: number) => {
          const fileLines = c.files.slice(0, 20).map(f => {
            const displayStatus = f.status === "removed" ? "deleted" : f.status;
            const changeLabel = f.status === "removed"
              ? "deleted"
              : `${displayStatus}, +${f.additions}/-${f.deletions}`;
            return `  - ${f.filename} (${changeLabel})`;
          }).join("\n");
          const moreFiles = c.files.length > 20 ? `\n  ... and ${c.files.length - 20} more files` : "";
          return `Commit ${i + 1}: "${c.message}" (${new Date(c.author_date).toLocaleDateString()}) [+${c.stats.additions}/-${c.stats.deletions} total]\nFiles:\n${fileLines}${moreFiles}`;
        }
      )
      .join("\n\n");

    const depSection = buildDepContextSection(depContext);
    const isStandup = mode === "standup";

    const prompt = isStandup
      ? `You are a developer assistant. Analyze the following recent Git commits from the repository "${repo_name}" and generate a standup update a developer could paste into Slack or their daily standup.

Each commit includes the files changed with their status (added/modified/removed/renamed) and line counts (+additions/-deletions).

Recent commits:
${commitSummary}
${depSection}
Respond with a JSON object with exactly these fields:
{
  "what_you_were_doing": "A concise 1-2 sentence paragraph describing the overall context",
  "key_changes": ["brief change 1", "brief change 2", "brief change 3"],
  "suggested_next_steps": ["next step 1", "next step 2", "next step 3"],
  "standup_update": "Yesterday: [2-3 sentences describing what was worked on]. Today: [1-2 sentences on what to work on next]. Blockers: [any blockers, or 'None.']"
}

Be specific: name actual files and distinguish between small fixes (few lines) and large refactors (hundreds of lines). Keep it professional and brief enough to paste into a standup.`
      : `You are a developer assistant helping a developer resume their coding work. Analyze the following recent Git commits from the repository "${repo_name}" and generate a clear, actionable summary.

Each commit includes the files changed with their status (added/modified/removed/renamed) and line counts (+additions/-deletions). Use this to distinguish a 3-line bug fix from a 400-line feature and to identify which areas of the codebase are actively evolving.

Recent commits:
${commitSummary}
${depSection}
Respond with a JSON object with exactly these fields:
{
  "what_you_were_doing": "A concise 2-3 sentence paragraph describing what the developer was working on — reference specific file names and note whether changes were small tweaks or large rewrites",
  "key_changes": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "suggested_next_steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "standup_update": null
}

Be specific: reference actual filenames, mention change magnitudes where they matter, and focus on helping the developer immediately understand their context and resume work. Avoid generic platitudes.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const aiResponse = JSON.parse(content) as {
      what_you_were_doing: string;
      key_changes: string[];
      suggested_next_steps: string[];
      standup_update?: string | null;
    };

    const data = SummarizeCommitsResponse.parse({
      what_you_were_doing: aiResponse.what_you_were_doing,
      key_changes: aiResponse.key_changes,
      suggested_next_steps: aiResponse.suggested_next_steps,
      standup_update: aiResponse.standup_update ?? null,
      generated_at: new Date().toISOString(),
    });

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error generating AI summary, falling back to mock");
    const mockData = generateMockSummary(repo_name, commits, mode);
    const data = SummarizeCommitsResponse.parse(mockData);
    res.json(data);
  }
});

export default router;
