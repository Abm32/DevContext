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

function generateMockSummary(repoName: string, commits: Array<{ message: string; files: string[] }>, mode: string) {
  const allFiles = [...new Set(commits.flatMap((c) => c.files))];
  const fileExtensions = allFiles
    .map((f) => f.split(".").pop())
    .filter(Boolean)
    .filter((ext) => ["ts", "tsx", "js", "jsx", "py", "go", "rs", "css"].includes(ext as string));

  const uniqueExts = [...new Set(fileExtensions)];
  const commitMessages = commits.map((c) => c.message).join(", ");

  const standupUpdate = mode === "standup"
    ? `Yesterday: Worked on ${repoName}, making changes to ${allFiles.slice(0, 3).join(", ")}. Commits focused on: ${commitMessages.substring(0, 150)}.\nToday: Continue work on ${allFiles[0] ?? "the modified files"} and run the test suite.\nBlockers: None.`
    : undefined;

  return {
    what_you_were_doing: `You were working on ${repoName}, primarily making changes to ${allFiles.slice(0, 3).join(", ")}${allFiles.length > 3 ? ` and ${allFiles.length - 3} more files` : ""}. Your recent commits focused on: ${commitMessages.substring(0, 200)}.`,
    key_changes: [
      `Modified ${allFiles.length} file(s) across ${commits.length} commit(s)`,
      uniqueExts.length > 0
        ? `Working with ${uniqueExts.join(", ")} files`
        : "Making configuration and documentation changes",
      commits[0]
        ? `Most recent change: ${commits[0].message}`
        : "Recent commits staged",
      allFiles.some((f) => f.includes("test") || f.includes("spec"))
        ? "Added or updated tests"
        : "Feature implementation in progress",
    ],
    suggested_next_steps: [
      `Review the changes in ${allFiles[0] ?? "the modified files"} to pick up where you left off`,
      "Run the test suite to make sure everything is passing",
      "Check for any TODO comments left in the recent commits",
      `Review the git diff for ${repoName} to see the full scope of recent changes`,
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
        (c: { sha: string; message: string; author_date: string; files: string[] }, i: number) =>
          `Commit ${i + 1}: "${c.message}" (${new Date(c.author_date).toLocaleDateString()})\nFiles changed: ${c.files.slice(0, 15).join(", ")}${c.files.length > 15 ? ` and ${c.files.length - 15} more` : ""}`
      )
      .join("\n\n");

    const isStandup = mode === "standup";

    const prompt = isStandup
      ? `You are a developer assistant. Analyze the following recent Git commits from the repository "${repo_name}" and generate a standup update a developer could paste into Slack or their daily standup.

Recent commits:
${commitSummary}

Respond with a JSON object with exactly these fields:
{
  "what_you_were_doing": "A concise 1-2 sentence paragraph describing the overall context",
  "key_changes": ["brief change 1", "brief change 2", "brief change 3"],
  "suggested_next_steps": ["next step 1", "next step 2", "next step 3"],
  "standup_update": "Yesterday: [2-3 sentences describing what was worked on]. Today: [1-2 sentences on what to work on next]. Blockers: [any blockers, or 'None.']"
}

Keep it professional, specific to the actual commits, and brief enough to paste into a standup.`
      : `You are a developer assistant helping a developer resume their coding work. Analyze the following recent Git commits from the repository "${repo_name}" and generate a clear, actionable summary.

Recent commits:
${commitSummary}

Respond with a JSON object with exactly these fields:
{
  "what_you_were_doing": "A concise 2-3 sentence paragraph describing what the developer was working on",
  "key_changes": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "suggested_next_steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "standup_update": null
}

Keep it practical and specific to the actual files and commit messages. Focus on helping the developer immediately understand their context and resume work.`;

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
