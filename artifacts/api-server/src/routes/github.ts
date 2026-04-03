import { Router, type IRouter, type Request, type Response } from "express";
import {
  ListReposResponse,
  ListBranchesResponse,
  ListCommitsResponse,
  GetCommitDetailResponse,
} from "@workspace/api-zod";
import { getTokenPayload } from "./auth";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): string | null {
  const payload = getTokenPayload(req);
  if (!payload) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return payload.githubToken;
}

async function githubFetch(
  url: string,
  token: string
): Promise<Response | null> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  return res as unknown as Response;
}

type GHRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  updated_at: string | null;
  language: string | null;
  stargazers_count: number;
  default_branch: string;
};

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

router.get("/repos", async (req, res) => {
  const token = requireAuth(req, res as unknown as Response);
  if (!token) return;

  try {
    // Fetch personal repos and org list in parallel
    const [personalRepos, orgs] = await Promise.all([
      ghFetch<GHRepo[]>(
        "https://api.github.com/user/repos?sort=updated&per_page=100&type=owner",
        token
      ),
      ghFetch<Array<{ login: string }>>(
        "https://api.github.com/user/orgs?per_page=100",
        token
      ),
    ]);

    // Fetch repos from every org the user belongs to (parallel)
    const orgRepoArrays = await Promise.all(
      (orgs ?? []).map(org =>
        ghFetch<GHRepo[]>(
          `https://api.github.com/orgs/${org.login}/repos?sort=updated&per_page=100&type=member`,
          token
        )
      )
    );

    // Also fetch repos where the user is a collaborator (covers forks, team repos, etc.)
    const allUserRepos = await ghFetch<GHRepo[]>(
      "https://api.github.com/user/repos?sort=updated&per_page=100&type=all",
      token
    );

    // Merge and deduplicate by id, sort by updated_at descending
    const seen = new Set<number>();
    const merged: GHRepo[] = [];
    for (const repo of [
      ...(allUserRepos ?? []),
      ...(personalRepos ?? []),
      ...orgRepoArrays.flatMap(arr => arr ?? []),
    ]) {
      if (!seen.has(repo.id)) {
        seen.add(repo.id);
        merged.push(repo);
      }
    }
    merged.sort((a, b) =>
      new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
    );

    const data = ListReposResponse.parse(
      merged.map((r) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        private: r.private,
        html_url: r.html_url,
        updated_at: r.updated_at,
        language: r.language,
        stargazers_count: r.stargazers_count,
        default_branch: r.default_branch,
      }))
    );

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error fetching repos");
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

router.get("/repos/:owner/:repo/branches", async (req, res) => {
  const token = requireAuth(req, res as unknown as Response);
  if (!token) return;

  const { owner, repo } = req.params;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (response.status === 409) {
      res.json([]);
      return;
    }

    if (!response.ok) {
      res.status(response.status).json({ error: "GitHub API error" });
      return;
    }

    const branches = (await response.json()) as Array<{
      name: string;
      commit: { sha: string };
    }>;

    // We need to know the default branch - fetch from repo info
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    const defaultBranch = repoResponse.ok
      ? ((await repoResponse.json()) as { default_branch: string }).default_branch
      : "main";

    const data = ListBranchesResponse.parse(
      branches.map((b) => ({
        name: b.name,
        is_default: b.name === defaultBranch,
      }))
    );

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error fetching branches");
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

router.get("/repos/:owner/:repo/commits", async (req, res) => {
  const token = requireAuth(req, res as unknown as Response);
  if (!token) return;

  const { owner, repo } = req.params;
  const perPage = Number(req.query["per_page"] ?? 15);
  const branch = req.query["branch"] as string | undefined;

  try {
    const url = branch
      ? `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&sha=${encodeURIComponent(branch)}`
      : `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}`;

    const response = await fetch(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    // 409 = empty repo (no commits yet) — treat as empty list, not an error
    if (response.status === 409) {
      res.json([]);
      return;
    }

    if (!response.ok) {
      const ghError = await response.json().catch(() => ({})) as { message?: string };
      req.log.error(
        { status: response.status, owner, repo, ghMessage: ghError.message },
        "GitHub API error listing commits"
      );
      const isPrivateOrgRepo = response.status === 404 || response.status === 403;
      res.status(response.status).json({
        error: isPrivateOrgRepo
          ? "private_repo_access_denied"
          : "github_api_error",
        message: ghError.message ?? "GitHub API error",
      });
      return;
    }

    const commits = (await response.json()) as Array<{
      sha: string;
      commit: {
        message: string;
        author: {
          name: string;
          email: string;
          date: string;
        };
      };
      html_url: string;
    }>;

    const data = ListCommitsResponse.parse(
      commits.map((c) => ({
        sha: c.sha,
        message: c.commit.message.split("\n")[0] ?? c.commit.message,
        author_name: c.commit.author?.name ?? "Unknown",
        author_email: c.commit.author?.email ?? "",
        author_date: c.commit.author?.date ?? "",
        html_url: c.html_url,
      }))
    );

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error fetching commits");
    res.status(500).json({ error: "Failed to fetch commits" });
  }
});

// Returns the total commit count for a branch by reading GitHub's Link header
// (fetches only 1 commit so it is extremely cheap API-rate-wise)
router.get("/repos/:owner/:repo/commit-count", async (req, res) => {
  const token = requireAuth(req, res as unknown as Response);
  if (!token) return;

  const { owner, repo } = req.params;
  const branch = req.query["branch"] as string | undefined;

  try {
    const url = branch
      ? `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1&sha=${encodeURIComponent(branch)}`
      : `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (response.status === 409) {
      res.json({ total: 0 });
      return;
    }

    if (!response.ok) {
      res.status(response.status).json({ error: "GitHub API error" });
      return;
    }

    const linkHeader = response.headers.get("link") ?? "";
    const lastMatch = linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/);
    const total = lastMatch ? parseInt(lastMatch[1], 10) : 1;

    res.json({ total });
  } catch (err) {
    req.log.error({ err }, "Error fetching commit count");
    res.status(500).json({ error: "Failed to fetch commit count" });
  }
});

router.get("/repos/:owner/:repo/commits/:sha", async (req, res) => {
  const token = requireAuth(req, res as unknown as Response);
  if (!token) return;

  const { owner, repo, sha } = req.params;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      req.log.error(
        { status: response.status, owner, repo, sha },
        "GitHub API error getting commit detail"
      );
      res.status(response.status).json({ error: "GitHub API error" });
      return;
    }

    const commit = (await response.json()) as {
      sha: string;
      commit: {
        message: string;
        author: {
          name: string;
          date: string;
        };
      };
      html_url: string;
      files: Array<{
        filename: string;
        status: string;
        additions: number;
        deletions: number;
        changes: number;
        patch?: string;
      }>;
      stats: {
        additions: number;
        deletions: number;
        total: number;
      };
    };

    const data = GetCommitDetailResponse.parse({
      sha: commit.sha,
      message: commit.commit.message,
      author_name: commit.commit.author?.name ?? "Unknown",
      author_date: commit.commit.author?.date ?? "",
      html_url: commit.html_url,
      files: (commit.files ?? []).map((f) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
        patch: f.patch ?? null,
      })),
      stats: commit.stats ?? { additions: 0, deletions: 0, total: 0 },
    });

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error fetching commit detail");
    res.status(500).json({ error: "Failed to fetch commit detail" });
  }
});

export { githubFetch };
export default router;
