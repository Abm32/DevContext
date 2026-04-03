import type { Repository } from "@workspace/api-client-react"

// ─── Repo slot colors (up to 3 repos) ────────────────────────────────────────
export const REPO_COLORS = [
  { bg: "bg-blue-500/15", border: "border-blue-500/30", text: "text-blue-300", dot: "bg-blue-400", label: "blue" },
  { bg: "bg-violet-500/15", border: "border-violet-500/30", text: "text-violet-300", dot: "bg-violet-400", label: "violet" },
  { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300", dot: "bg-emerald-400", label: "emerald" },
] as const

export type RepoColor = (typeof REPO_COLORS)[number]

// ─── Types ────────────────────────────────────────────────────────────────────
export type RepoEntry = {
  id: string
  repo: Repository
  branch: string | null
}

export type WorkspaceRepo = {
  fullName: string
  branch: string | null
  defaultBranch: string | null
}

export type Workspace = {
  id: string
  name: string
  repos: WorkspaceRepo[]
  createdAt: string
}

// ─── Workspace storage ────────────────────────────────────────────────────────
const WORKSPACES_KEY = "dc_workspaces"
const ACTIVE_REPOS_KEY = "dc_active_repos"

export function loadWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Workspace[]
  } catch { return [] }
}

export function saveWorkspaces(workspaces: Workspace[]): void {
  try {
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces))
  } catch { /* quota exceeded */ }
}

export function deleteWorkspace(id: string): Workspace[] {
  const updated = loadWorkspaces().filter(w => w.id !== id)
  saveWorkspaces(updated)
  return updated
}

export function addWorkspace(name: string, entries: RepoEntry[]): Workspace[] {
  const workspace: Workspace = {
    id: crypto.randomUUID(),
    name: name.trim(),
    repos: entries.map(e => ({
      fullName: e.repo.full_name,
      branch: e.branch,
      defaultBranch: e.repo.default_branch ?? null,
    })),
    createdAt: new Date().toISOString(),
  }
  const updated = [...loadWorkspaces(), workspace]
  saveWorkspaces(updated)
  return updated
}

// ─── Active repos persistence ─────────────────────────────────────────────────
type PersistedRepo = { fullName: string; branch: string | null }

export function saveActiveRepos(entries: RepoEntry[]): void {
  try {
    const data: PersistedRepo[] = entries.map(e => ({ fullName: e.repo.full_name, branch: e.branch }))
    localStorage.setItem(ACTIVE_REPOS_KEY, JSON.stringify(data))
    // Legacy single-repo keys (kept for backward compat)
    if (entries[0]) {
      localStorage.setItem("dc_last_repo", entries[0].repo.full_name)
      if (entries[0].branch) localStorage.setItem("dc_last_branch", entries[0].branch)
      else localStorage.removeItem("dc_last_branch")
    } else {
      localStorage.removeItem("dc_last_repo")
      localStorage.removeItem("dc_last_branch")
    }
  } catch { /* quota exceeded */ }
}

export function loadActiveRepoSlugs(): PersistedRepo[] {
  try {
    const raw = localStorage.getItem(ACTIVE_REPOS_KEY)
    if (raw) return JSON.parse(raw) as PersistedRepo[]
    // Fall back to legacy single-repo keys
    const legacy = localStorage.getItem("dc_last_repo")
    if (legacy) {
      const branch = localStorage.getItem("dc_last_branch") ?? null
      return [{ fullName: legacy, branch }]
    }
    return []
  } catch { return [] }
}
