import { useQuery } from "@tanstack/react-query";

export type DepSeverity = "major" | "minor" | "patch" | "ok";
export type Ecosystem = "npm" | "pypi" | "cargo" | "rubygems" | "go";

export interface DepStaleness {
  name: string;
  ecosystem: Ecosystem;
  current_version: string;
  latest_version: string | null;
  severity: DepSeverity;
  dep_type: "prod" | "dev";
  registry_url: string;
  in_work_area: boolean;
  teammate_changed: boolean;
}

export interface DepsReport {
  ecosystem: Ecosystem | null;
  manifest_file: string | null;
  deps: DepStaleness[];
  manifest_changed: boolean;
  total_stale: number;
  summary: { major: number; minor: number; patch: number };
}

interface UseGetRepoDepsOptions {
  owner: string;
  repo: string;
  branch?: string;
  language?: string | null;
  enabled?: boolean;
}

async function fetchRepoDeps(
  owner: string,
  repo: string,
  branch?: string,
  language?: string | null
): Promise<DepsReport> {
  const params = new URLSearchParams();
  if (branch) params.set("branch", branch);
  if (language) params.set("language", language);

  const url = `/api/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/deps?${params.toString()}`;
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<DepsReport>;
}

export function useGetRepoDeps({ owner, repo, branch, language, enabled = true }: UseGetRepoDepsOptions) {
  return useQuery<DepsReport, Error>({
    queryKey: ["repo-deps", owner, repo, branch, language] as const,
    queryFn: () => fetchRepoDeps(owner, repo, branch, language),
    enabled: enabled && !!owner && !!repo,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
