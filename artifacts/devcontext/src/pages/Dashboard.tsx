import { useState, useEffect, useMemo, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import { formatRelativeDate, getShortSha } from "@/lib/utils"
import { computeCommitStats } from "@/lib/commit-stats"
import {
  useGetMe,
  useListRepos,
  useListBranches,
  useListCommits,
  useGetCommitDetail,
  useGetRepoDeps,
  Repository,
  Commit,
  DepContextItem,
} from "@workspace/api-client-react"
import { useGenerateSummary } from "@/hooks/use-devcontext"
import { DepHealthPanel } from "@/components/dep-health-panel"
import { track } from "@/hooks/use-track"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  GitCommitHorizontal,
  ChevronRight,
  ChevronDown,
  FolderGit2,
  Sparkles,
  ArrowRight,
  Clock,
  BrainCircuit,
  GitMerge,
  GitBranch,
  Copy,
  Check,
  ClipboardList,
  Plus,
  Minus,
  Heart,
  X,
  Layers,
  BookmarkPlus,
  Bookmark,
  Trash2,
} from "lucide-react"
import {
  RepoEntry,
  Workspace,
  REPO_COLORS,
  RepoColor,
  loadWorkspaces,
  saveWorkspaces,
  addWorkspace,
  deleteWorkspace,
  saveActiveRepos,
  loadActiveRepoSlugs,
} from "@/lib/workspaces"

// ─── Types ───────────────────────────────────────────────────────────────────
type SummaryResult = {
  what_you_were_doing: string
  key_changes: string[]
  suggested_next_steps: string[]
  standup_update: string | null
  generated_at: string
}
type CachedSummary = { result: SummaryResult; generatedAt: string; mode: "next_steps" | "standup" }

function loadCachedSummary(key: string): CachedSummary | null {
  try {
    const raw = localStorage.getItem(`dc_summary_${key}`)
    if (!raw) return null
    return JSON.parse(raw) as CachedSummary
  } catch { return null }
}

function saveCachedSummary(key: string, data: CachedSummary) {
  try {
    localStorage.setItem(`dc_summary_${key}`, JSON.stringify(data))
  } catch { /* quota */ }
}

function buildCacheKey(entries: RepoEntry[]): string {
  return entries.map(e => `${e.repo.full_name}:${e.branch ?? e.repo.default_branch ?? "default"}`).join("|")
}

// ─── DiffView ────────────────────────────────────────────────────────────────
function DiffView({ patch }: { patch: string }) {
  const lines = patch.split("\n")
  return (
    <pre className="text-[10px] font-mono leading-5 overflow-x-auto whitespace-pre">
      {lines.map((line, i) => {
        const bg = line.startsWith("+") && !line.startsWith("+++")
          ? "bg-emerald-500/10 text-emerald-300"
          : line.startsWith("-") && !line.startsWith("---")
          ? "bg-red-500/10 text-red-300"
          : line.startsWith("@@")
          ? "text-blue-400/80"
          : "text-muted-foreground/70"
        return <span key={i} className={`block px-2 ${bg}`}>{line || " "}</span>
      })}
    </pre>
  )
}

// ─── CommitCard ───────────────────────────────────────────────────────────────
type TaggedCommit = Commit & { _repoIdx: number; _repoName: string }

function CommitCard({
  commit, owner, repo, idx, repoColor,
}: {
  commit: TaggedCommit; owner: string; repo: string; idx: number; repoColor?: RepoColor
}) {
  const [expanded, setExpanded] = useState(false)
  const [expandedFile, setExpandedFile] = useState<string | null>(null)

  const { data: detail, isLoading: isDetailLoading } = useGetCommitDetail(
    owner, repo, commit.sha,
    { query: { enabled: expanded } }
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.25 }}
      className="group rounded-xl border border-white/5 bg-secondary/10 hover:bg-secondary/20 transition-all overflow-hidden"
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => { setExpanded(e => !e); setExpandedFile(null) }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <GitCommitHorizontal className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-white font-medium leading-snug line-clamp-2">{commit.message}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-muted-foreground/70">{getShortSha(commit.sha)}</span>
                <span className="text-[11px] text-muted-foreground">{commit.author_name}</span>
                <span className="text-[11px] text-muted-foreground/50">{formatRelativeDate(commit.author_date)}</span>
                {repoColor && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${repoColor.bg} ${repoColor.text} border ${repoColor.border}`}>
                    {commit._repoName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-0.5">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5 overflow-hidden"
          >
            <div className="p-4 pt-3 space-y-2">
              {isDetailLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-5 w-full" />)}
                </div>
              ) : detail ? (
                <>
                  <div className="space-y-1">
                    {detail.files.map(f => (
                      <div key={f.filename}>
                        <button
                          onClick={() => setExpandedFile(prev => prev === f.filename ? null : f.filename)}
                          className={`w-full flex items-center gap-2 text-[11px] font-mono py-1 px-2 rounded hover:bg-white/5 text-left transition-colors ${expandedFile === f.filename ? "bg-white/5" : ""}`}
                        >
                          <span className={
                            f.status === "added" ? "text-emerald-400" :
                            f.status === "removed" ? "text-red-400" :
                            f.status === "renamed" ? "text-blue-400" : "text-amber-400"
                          }>
                            {f.status === "added" ? "+" : f.status === "removed" ? "−" : f.status === "renamed" ? "→" : "~"}
                          </span>
                          <span className="truncate text-muted-foreground/80 flex-1">{f.filename}</span>
                          <span className="text-muted-foreground/40 shrink-0">
                            {f.status !== "removed" && f.additions > 0 && <span className="text-emerald-400/60">+{f.additions}</span>}
                            {f.status !== "added" && f.deletions > 0 && <span className="text-red-400/60 ml-1">-{f.deletions}</span>}
                          </span>
                          {f.patch && (
                            <ChevronDown className={`w-3 h-3 text-muted-foreground/40 shrink-0 transition-transform ${expandedFile === f.filename ? "rotate-180" : ""}`} />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFile === f.filename && f.patch && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden rounded-lg mt-1 border border-white/5 max-h-64 overflow-y-auto"
                            >
                              <DiffView patch={f.patch} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 mt-1 border-t border-white/5 text-[11px] text-muted-foreground flex gap-3 flex-wrap">
                    <span className="font-semibold text-white/60">{detail.files.length} files changed</span>
                    <span className="text-emerald-400">+{detail.stats.additions} additions</span>
                    <span className="text-red-400">−{detail.stats.deletions} deletions</span>
                    {detail.files.some(f => f.patch) && (
                      <span className="text-muted-foreground/40">click file for diff</span>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading: isAuthLoading, isError } = useGetMe({ query: { retry: false } })

  // ─── Multi-repo state ────────────────────────────────────────────────────
  const [selectedRepos, setSelectedRepos] = useState<RepoEntry[]>([])
  const [repoSearch, setRepoSearch] = useState("")
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces())
  const [showSaveWorkspace, setShowSaveWorkspace] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")

  const [summaryMode, setSummaryMode] = useState<"next_steps" | "standup">("next_steps")
  const [copied, setCopied] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<"commits" | "ai">("commits")
  const [cachedSummary, setCachedSummary] = useState<CachedSummary | null>(null)
  const commitLimit = 30

  const reposRestored = useRef(false)

  // ─── Slot accessors ──────────────────────────────────────────────────────
  const entry0 = selectedRepos[0] ?? null
  const entry1 = selectedRepos[1] ?? null
  const entry2 = selectedRepos[2] ?? null

  const owner0 = entry0?.repo.full_name.split("/")[0] ?? ""
  const owner1 = entry1?.repo.full_name.split("/")[0] ?? ""
  const owner2 = entry2?.repo.full_name.split("/")[0] ?? ""

  const name0 = entry0?.repo.name ?? ""
  const name1 = entry1?.repo.name ?? ""
  const name2 = entry2?.repo.name ?? ""

  const branch0 = entry0?.branch ?? entry0?.repo.default_branch ?? undefined
  const branch1 = entry1?.branch ?? entry1?.repo.default_branch ?? undefined
  const branch2 = entry2?.branch ?? entry2?.repo.default_branch ?? undefined

  // Primary accessor for backward-compat with right column logic
  const selectedRepo = entry0?.repo ?? null
  const activeBranch = branch0

  // ─── Repo list ───────────────────────────────────────────────────────────
  const { data: repos, isLoading: isReposLoading } = useListRepos({ query: { enabled: !!user } })

  // ─── Branch queries (3 fixed slots) ─────────────────────────────────────
  const { data: branches0, isLoading: isBranchesLoading0 } = useListBranches(owner0, name0, { query: { enabled: !!entry0 } })
  const { data: branches1, isLoading: isBranchesLoading1 } = useListBranches(owner1, name1, { query: { enabled: !!entry1 } })
  const { data: branches2, isLoading: isBranchesLoading2 } = useListBranches(owner2, name2, { query: { enabled: !!entry2 } })

  // ─── Commit queries (3 fixed slots) ─────────────────────────────────────
  const { data: commits0, isLoading: isCommitsLoading0, isError: isCommitsError0 } = useListCommits(
    owner0, name0, { per_page: commitLimit, branch: branch0 }, { query: { enabled: !!entry0, retry: 1 } }
  )
  const { data: commits1 } = useListCommits(
    owner1, name1, { per_page: commitLimit, branch: branch1 }, { query: { enabled: !!entry1, retry: 1 } }
  )
  const { data: commits2 } = useListCommits(
    owner2, name2, { per_page: commitLimit, branch: branch2 }, { query: { enabled: !!entry2, retry: 1 } }
  )

  // ─── Commit count (slot 0 only, for stats strip) ─────────────────────────
  const { data: commitCountData } = useQuery({
    queryKey: ["commitCount", owner0, name0, branch0],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (branch0) params.set("branch", branch0)
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/github/repos/${owner0}/${name0}/commit-count?${params}`,
        { credentials: "include" }
      )
      if (!res.ok) return null
      const data = await res.json() as { total: number }
      return data.total
    },
    enabled: !!entry0,
    staleTime: 5 * 60 * 1000,
  })

  // ─── Merged commit list ──────────────────────────────────────────────────
  const mergedCommits = useMemo((): TaggedCommit[] => {
    const all: TaggedCommit[] = [
      ...(commits0 ?? []).map(c => ({ ...c, _repoIdx: 0, _repoName: name0 })),
      ...(commits1 ?? []).map(c => ({ ...c, _repoIdx: 1, _repoName: name1 })),
      ...(commits2 ?? []).map(c => ({ ...c, _repoIdx: 2, _repoName: name2 })),
    ]
    return all.sort((a, b) => new Date(b.author_date).getTime() - new Date(a.author_date).getTime())
  }, [commits0, commits1, commits2, name0, name1, name2])

  const isMultiRepo = selectedRepos.length > 1
  const isCommitsLoading = isCommitsLoading0
  const isCommitsError = isCommitsError0

  // ─── Dep health queries (3 slots) ────────────────────────────────────────
  // Gather changed filenames for dep detection
  const recentShas0 = useMemo(() => commits0?.slice(0, 3).map(c => c.sha) ?? [], [commits0])
  const { data: d0a } = useGetCommitDetail(owner0, name0, recentShas0[0] ?? "", { query: { enabled: !!entry0 && !!recentShas0[0] } })
  const { data: d0b } = useGetCommitDetail(owner0, name0, recentShas0[1] ?? "", { query: { enabled: !!entry0 && !!recentShas0[1] } })
  const { data: d0c } = useGetCommitDetail(owner0, name0, recentShas0[2] ?? "", { query: { enabled: !!entry0 && !!recentShas0[2] } })
  const changedFiles0 = useMemo(() => {
    const all = [...(d0a?.files ?? []), ...(d0b?.files ?? []), ...(d0c?.files ?? [])]
    return [...new Set(all.map(f => f.filename))]
  }, [d0a, d0b, d0c])

  const recentShas1 = useMemo(() => commits1?.slice(0, 3).map(c => c.sha) ?? [], [commits1])
  const { data: d1a } = useGetCommitDetail(owner1, name1, recentShas1[0] ?? "", { query: { enabled: !!entry1 && !!recentShas1[0] } })
  const { data: d1b } = useGetCommitDetail(owner1, name1, recentShas1[1] ?? "", { query: { enabled: !!entry1 && !!recentShas1[1] } })
  const { data: d1c } = useGetCommitDetail(owner1, name1, recentShas1[2] ?? "", { query: { enabled: !!entry1 && !!recentShas1[2] } })
  const changedFiles1 = useMemo(() => {
    const all = [...(d1a?.files ?? []), ...(d1b?.files ?? []), ...(d1c?.files ?? [])]
    return [...new Set(all.map(f => f.filename))]
  }, [d1a, d1b, d1c])

  const recentShas2 = useMemo(() => commits2?.slice(0, 3).map(c => c.sha) ?? [], [commits2])
  const { data: d2a } = useGetCommitDetail(owner2, name2, recentShas2[0] ?? "", { query: { enabled: !!entry2 && !!recentShas2[0] } })
  const { data: d2b } = useGetCommitDetail(owner2, name2, recentShas2[1] ?? "", { query: { enabled: !!entry2 && !!recentShas2[1] } })
  const { data: d2c } = useGetCommitDetail(owner2, name2, recentShas2[2] ?? "", { query: { enabled: !!entry2 && !!recentShas2[2] } })
  const changedFiles2 = useMemo(() => {
    const all = [...(d2a?.files ?? []), ...(d2b?.files ?? []), ...(d2c?.files ?? [])]
    return [...new Set(all.map(f => f.filename))]
  }, [d2a, d2b, d2c])

  const { data: depsReport0, isLoading: isDepsLoading0, isError: isDepsError0, refetch: refetchDeps0 } = useGetRepoDeps(
    owner0, name0, { files: changedFiles0.join(",") }, { query: { enabled: !!entry0 && changedFiles0.length > 0 } }
  )
  const { data: depsReport1, isLoading: isDepsLoading1, isError: isDepsError1, refetch: refetchDeps1 } = useGetRepoDeps(
    owner1, name1, { files: changedFiles1.join(",") }, { query: { enabled: !!entry1 && changedFiles1.length > 0 } }
  )
  const { data: depsReport2, isLoading: isDepsLoading2, isError: isDepsError2, refetch: refetchDeps2 } = useGetRepoDeps(
    owner2, name2, { files: changedFiles2.join(",") }, { query: { enabled: !!entry2 && changedFiles2.length > 0 } }
  )

  // ─── Dep context (aggregate major deps from all repos for AI) ─────────────
  const depContext = useMemo((): DepContextItem[] => {
    const all = [
      ...(depsReport0?.deps ?? []),
      ...(depsReport1?.deps ?? []),
      ...(depsReport2?.deps ?? []),
    ]
    return all
      .filter((d): d is typeof d & { latest_version: string } =>
        d.severity === "major" && d.latest_version != null
      )
      .slice(0, 8)
      .map(d => ({
        name: d.name,
        current_version: d.current_version,
        latest_version: d.latest_version,
        severity: "major" as const,
        ecosystem: d.ecosystem,
      }))
  }, [depsReport0, depsReport1, depsReport2])

  const { generate, isGenerating, progress, result } = useGenerateSummary()

  const commitStats = useMemo(() => {
    if (!mergedCommits.length) return null
    return computeCommitStats(mergedCommits)
  }, [mergedCommits])

  // ─── Auth / lifecycle effects ─────────────────────────────────────────────
  useEffect(() => { if (isError) setLocation("/") }, [isError, setLocation])

  useEffect(() => { if (user) void track("page_view", { page: "/dashboard" }) }, [user])

  // ─── Restore active repos from localStorage (one-time) ───────────────────
  useEffect(() => {
    if (reposRestored.current || !repos) return
    reposRestored.current = true
    const slugs = loadActiveRepoSlugs()
    if (!slugs.length) return
    const entries: RepoEntry[] = []
    for (const slug of slugs) {
      const match = repos.find(r => r.full_name === slug.fullName)
      if (match) entries.push({ id: crypto.randomUUID(), repo: match, branch: slug.branch })
    }
    if (entries.length) setSelectedRepos(entries)
  }, [repos])

  // ─── Restore cached summary when selection changes ────────────────────────
  useEffect(() => {
    if (!selectedRepos.length) { setCachedSummary(null); return }
    const key = buildCacheKey(selectedRepos)
    setCachedSummary(loadCachedSummary(key))
  }, [JSON.stringify(selectedRepos.map(e => ({ f: e.repo.full_name, b: e.branch })))])

  // ─── Save summary to cache after generation ───────────────────────────────
  useEffect(() => {
    if (!result || !selectedRepos.length) return
    const key = buildCacheKey(selectedRepos)
    const data: CachedSummary = {
      result: result as SummaryResult,
      generatedAt: result.generated_at ?? new Date().toISOString(),
      mode: summaryMode,
    }
    setCachedSummary(data)
    saveCachedSummary(key, data)
  }, [result])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const filteredRepos = repos?.filter(r =>
    r.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  ).slice(0, 50)

  // ─── Repo toggle (add/remove from selectedRepos) ─────────────────────────
  const handleToggleRepo = (repo: Repository) => {
    const idx = selectedRepos.findIndex(e => e.repo.id === repo.id)
    let updated: RepoEntry[]
    if (idx >= 0) {
      updated = selectedRepos.filter((_, i) => i !== idx)
    } else if (selectedRepos.length < 3) {
      updated = [...selectedRepos, { id: crypto.randomUUID(), repo, branch: null }]
    } else {
      return // max 3
    }
    setSelectedRepos(updated)
    saveActiveRepos(updated)
    setCachedSummary(null)
    setGenerateError(null)
  }

  const handleBranchChange = (entryId: string, branch: string) => {
    const updated = selectedRepos.map(e =>
      e.id === entryId ? { ...e, branch } : e
    )
    setSelectedRepos(updated)
    saveActiveRepos(updated)
    setCachedSummary(null)
  }

  const handleRemoveRepo = (entryId: string) => {
    const updated = selectedRepos.filter(e => e.id !== entryId)
    setSelectedRepos(updated)
    saveActiveRepos(updated)
    setCachedSummary(null)
    setGenerateError(null)
  }

  // ─── Workspace actions ────────────────────────────────────────────────────
  const handleSaveWorkspace = () => {
    if (!workspaceName.trim() || !selectedRepos.length) return
    const updated = addWorkspace(workspaceName, selectedRepos)
    setWorkspaces(updated)
    setWorkspaceName("")
    setShowSaveWorkspace(false)
  }

  const handleLoadWorkspace = (ws: Workspace) => {
    if (!repos) return
    const entries: RepoEntry[] = []
    for (const wr of ws.repos) {
      const match = repos.find(r => r.full_name === wr.fullName)
      if (match) entries.push({ id: crypto.randomUUID(), repo: match, branch: wr.branch })
    }
    setSelectedRepos(entries)
    saveActiveRepos(entries)
    setCachedSummary(null)
    setGenerateError(null)
  }

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaces(deleteWorkspace(id))
  }

  // ─── Generate handler ─────────────────────────────────────────────────────
  const handleGenerateSummary = () => {
    if (!selectedRepos.length || !mergedCommits.length) return
    const eventType = summaryMode === "standup" ? "click:generate_standup" : "click:generate_summary"
    void track(eventType, {
      page: "/dashboard",
      element: "generate_button",
      metadata: {
        repos: selectedRepos.map(e => e.repo.full_name),
        commits: mergedCommits.length,
        mode: summaryMode,
      },
    })
    setGenerateError(null)
    const repoGroups = selectedRepos.map((entry, i) => ({
      owner: entry.repo.full_name.split("/")[0],
      repoName: entry.repo.name,
      commits: (i === 0 ? commits0 : i === 1 ? commits1 : commits2) ?? [],
    }))
    generate(repoGroups, summaryMode, depContext).catch(() => {
      setGenerateError("Something went wrong generating your summary. Please try again.")
    })
  }

  const buildMarkdown = () => {
    if (!displayResult) return ""
    const repoLabel = selectedRepos.map(e => e.repo.name).join(" + ")
    if (displayResult.standup_update) {
      const dateRange = mergedCommits.length > 0
        ? ` (${new Date(mergedCommits[mergedCommits.length - 1].author_date).toLocaleDateString()} – ${new Date(mergedCommits[0].author_date).toLocaleDateString()})`
        : ""
      return `## Standup – ${repoLabel}${dateRange}\n\n${displayResult.standup_update}`
    }
    return [
      `## Code Brain Analysis – ${repoLabel}`,
      "",
      `### What I was doing`,
      displayResult.what_you_were_doing,
      "",
      `### Key Changes`,
      displayResult.key_changes.map(c => `- ${c}`).join("\n"),
      "",
      `### Suggested Next Steps`,
      displayResult.suggested_next_steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    ].join("\n")
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildMarkdown())
    void track("click:copy", { page: "/dashboard", element: "copy_markdown", metadata: { mode: summaryMode } })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayResult = cachedSummary?.result ?? null
  const isFromCache = !!cachedSummary && !result

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      {/* Mobile tab switcher */}
      <div className="md:hidden flex border-b border-white/5 bg-card/30">
        <button
          onClick={() => setMobileTab("commits")}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${mobileTab === "commits" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          <GitCommitHorizontal className="w-3.5 h-3.5" />
          Commits
        </button>
        <button
          onClick={() => setMobileTab("ai")}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${mobileTab === "ai" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Analysis
          {displayResult && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>
      </div>

      <main className="flex-1 container mx-auto px-4 py-4 md:py-8 flex flex-col md:flex-row gap-8 overflow-hidden h-[calc(100vh-4rem)]">

        {/* ── Left Column ────────────────────────────────────────────────── */}
        <div className={`w-full md:w-1/3 flex flex-col gap-4 overflow-hidden border-r border-white/5 pr-0 md:pr-4 ${mobileTab === "ai" ? "hidden md:flex" : "flex"}`}>

          {/* Workspaces strip */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3 h-3" />
                Workspaces
              </h2>
              {selectedRepos.length > 0 && (
                <button
                  onClick={() => setShowSaveWorkspace(s => !s)}
                  className="text-[11px] text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
                >
                  <BookmarkPlus className="w-3 h-3" />
                  Save
                </button>
              )}
            </div>

            <AnimatePresence>
              {showSaveWorkspace && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 overflow-hidden"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Workspace name..."
                    value={workspaceName}
                    onChange={e => setWorkspaceName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSaveWorkspace(); if (e.key === "Escape") setShowSaveWorkspace(false) }}
                    className="flex-1 bg-secondary/30 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <button
                    onClick={handleSaveWorkspace}
                    disabled={!workspaceName.trim()}
                    className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 disabled:opacity-40 transition-colors"
                  >
                    Save
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {workspaces.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {workspaces.map(ws => (
                  <div key={ws.id} className="group flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-secondary/30 border border-white/8 text-[11px] text-muted-foreground hover:border-white/15 transition-colors">
                    <button
                      onClick={() => handleLoadWorkspace(ws)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                      title={ws.repos.map(r => r.fullName).join(", ")}
                    >
                      <Layers className="w-3 h-3 text-primary/60" />
                      {ws.name}
                    </button>
                    <button
                      onClick={() => handleDeleteWorkspace(ws.id)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/40">No saved workspaces yet. Select repos and save a workspace.</p>
            )}
          </div>

          {/* Selected repos */}
          <AnimatePresence>
            {selectedRepos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2 overflow-hidden"
              >
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Repos</h2>
                {selectedRepos.map((entry, i) => {
                  const color = REPO_COLORS[i]!
                  const branches = i === 0 ? branches0 : i === 1 ? branches1 : branches2
                  const isBranchLoading = i === 0 ? isBranchesLoading0 : i === 1 ? isBranchesLoading1 : isBranchesLoading2
                  const activeBr = entry.branch ?? entry.repo.default_branch ?? ""
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className={`rounded-xl border ${color.border} ${color.bg} p-3 flex flex-col gap-2`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full ${color.dot} shrink-0`} />
                          <span className={`text-xs font-semibold truncate ${color.text}`}>{entry.repo.full_name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveRepo(entry.id)}
                          className="text-muted-foreground/40 hover:text-red-400 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GitBranch className={`w-3 h-3 shrink-0 ${color.text} opacity-60`} />
                        {isBranchLoading || !branches ? (
                          <Skeleton className="h-6 flex-1 rounded-lg" />
                        ) : (
                          <select
                            value={activeBr}
                            onChange={e => handleBranchChange(entry.id, e.target.value)}
                            className={`flex-1 bg-transparent border border-white/10 rounded-lg py-1 px-2 text-xs ${color.text} focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none cursor-pointer`}
                          >
                            {branches.map(b => (
                              <option key={b.name} value={b.name} className="bg-background text-white">
                                {b.name}{b.is_default ? " (default)" : ""}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Repo selector */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {selectedRepos.length === 0 ? "Select Repository" : selectedRepos.length < 3 ? "Add Another Repo" : "Repositories (max 3)"}
              </h2>
              {selectedRepos.length > 0 && selectedRepos.length < 3 && (
                <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  click to add
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={repoSearch}
                onChange={e => setRepoSearch(e.target.value)}
                className="w-full bg-secondary/30 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="bg-card border border-white/5 rounded-xl overflow-y-auto max-h-[22vh] scrollbar-hide">
              {isReposLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : filteredRepos?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No repositories found.</div>
              ) : (
                <div className="p-2 flex flex-col gap-1">
                  {filteredRepos?.map(repo => {
                    const slotIdx = selectedRepos.findIndex(e => e.repo.id === repo.id)
                    const isSelected = slotIdx >= 0
                    const slotColor = isSelected ? REPO_COLORS[slotIdx] : null
                    const isFull = selectedRepos.length >= 3 && !isSelected
                    return (
                      <button
                        key={repo.id}
                        onClick={() => !isFull && handleToggleRepo(repo)}
                        disabled={isFull}
                        className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-all ${
                          isSelected
                            ? `${slotColor?.bg} border ${slotColor?.border}`
                            : isFull
                            ? "opacity-30 cursor-not-allowed text-muted-foreground border border-transparent"
                            : "hover:bg-white/5 text-muted-foreground hover:text-white border border-transparent"
                        }`}
                      >
                        {isSelected && slotColor ? (
                          <span className={`w-2 h-2 rounded-full ${slotColor.dot} shrink-0`} />
                        ) : (
                          <FolderGit2 className="w-4 h-4 shrink-0" />
                        )}
                        <span className={`truncate text-sm font-medium ${isSelected ? slotColor?.text : ""}`}>{repo.full_name}</span>
                        {isSelected ? (
                          <Check className={`w-4 h-4 ml-auto shrink-0 ${slotColor?.text}`} />
                        ) : !isFull && (
                          <Plus className="w-3.5 h-3.5 ml-auto shrink-0 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Stats Strip */}
          <AnimatePresence>
            {commitStats && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-2"
              >
                {[
                  { label: "commits", value: commitCountData != null && !isMultiRepo ? String(commitCountData) : String(commitStats.totalCommits), icon: "⎇" },
                  { label: "active days", value: String(commitStats.activeDays), icon: "📅" },
                  ...(commitStats.dateSpan ? [{ label: "span", value: commitStats.dateSpan, icon: "🗓️" }] : []),
                  ...(commitStats.streak >= 1 ? [{ label: "streak", value: `🔥 ${commitStats.streak}d`, icon: "" }] : []),
                  ...(isMultiRepo ? [{ label: "repos", value: String(selectedRepos.length), icon: "🗂" }] : []),
                ].map(s => (
                  <div
                    key={s.label}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/40 border border-white/8 text-[11px] text-muted-foreground"
                  >
                    {s.icon && <span className="text-[11px]">{s.icon}</span>}
                    <span className="font-semibold text-white">{s.value}</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Commit List */}
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Recent Commits</h2>
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 pb-4">
              {!selectedRepo ? (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-primary/20 rounded-xl bg-primary/[0.03] p-8 text-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FolderGit2 className="w-6 h-6 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">Pick a repository to get started</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Search or scroll above to find your project</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-primary/50 animate-pulse">
                    <ArrowRight className="w-3.5 h-3.5 -rotate-90" />
                    <span>select one above</span>
                  </div>
                </div>
              ) : isCommitsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-secondary/20 space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="w-20 h-4" />
                        <Skeleton className="w-16 h-4" />
                      </div>
                      <Skeleton className="w-full h-4" />
                    </div>
                  ))}
                </div>
              ) : isCommitsError ? (
                <div className="h-full flex items-center justify-center border border-dashed border-red-500/20 rounded-xl bg-red-500/5 p-6 text-center">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-red-400">Cannot access commits</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                      This is likely a private org repo. Reconnect GitHub and approve access for your organization.
                    </p>
                  </div>
                </div>
              ) : mergedCommits.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <GitCommitHorizontal className="w-8 h-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No commits found on this branch.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mergedCommits.map((commit, idx) => {
                    const owner = selectedRepos[commit._repoIdx]?.repo.full_name.split("/")[0] ?? owner0
                    const repoName = commit._repoName
                    const color = isMultiRepo ? REPO_COLORS[commit._repoIdx] : undefined
                    return (
                      <CommitCard
                        key={`${commit._repoIdx}-${commit.sha}`}
                        commit={commit}
                        owner={owner}
                        repo={repoName}
                        idx={idx}
                        repoColor={color}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column ───────────────────────────────────────────────── */}
        <div className={`w-full md:w-2/3 flex flex-col gap-4 overflow-hidden ${mobileTab === "commits" ? "hidden md:flex" : "flex"}`}>

          {/* Dependency Health Panels (one per selected repo) */}
          <AnimatePresence>
            {selectedRepos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`grid gap-3 ${selectedRepos.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
              >
                {selectedRepos.map((entry, i) => {
                  const report = i === 0 ? depsReport0 : i === 1 ? depsReport1 : depsReport2
                  const loading = i === 0 ? isDepsLoading0 : i === 1 ? isDepsLoading1 : isDepsLoading2
                  const error = i === 0 ? isDepsError0 : i === 1 ? isDepsError1 : isDepsError2
                  const refetch = i === 0 ? refetchDeps0 : i === 1 ? refetchDeps1 : refetchDeps2
                  const color = REPO_COLORS[i]!
                  return (
                    <div key={entry.id}>
                      {isMultiRepo && (
                        <div className={`flex items-center gap-1.5 mb-1.5 text-[11px] font-medium ${color.text}`}>
                          <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                          {entry.repo.name}
                        </div>
                      )}
                      <DepHealthPanel report={report} isLoading={loading} isError={error} refetch={refetch} />
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Summary Panel */}
          <div className="flex-1 flex flex-col bg-card border border-white/5 rounded-2xl shadow-xl overflow-hidden relative min-h-0">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 text-primary rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Code Brain Analysis</h2>
                  <p className="text-sm text-muted-foreground">
                    {isMultiRepo
                      ? `${selectedRepos.length} repos · AI-powered context recovery`
                      : "AI-powered context recovery"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Mode Toggle */}
                <div className="flex items-center bg-secondary/40 rounded-xl border border-white/10 p-1 gap-1">
                  <button
                    onClick={() => setSummaryMode("next_steps")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${summaryMode === "next_steps" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-white"}`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    Next Steps
                  </button>
                  <button
                    onClick={() => setSummaryMode("standup")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${summaryMode === "standup" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:text-white"}`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Standup
                  </button>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={!selectedRepo || !mergedCommits.length || isGenerating || isCommitsLoading}
                    size="sm"
                    className="gap-2"
                    title={
                      !selectedRepo ? "Select a repository first" :
                      isCommitsLoading ? "Loading commits…" :
                      !mergedCommits.length ? "No commits found" :
                      isGenerating ? "Generating…" : undefined
                    }
                  >
                    {isGenerating ? <>Analyzing...</> : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        {summaryMode === "standup" ? "Generate Standup" : "What's next?"}
                      </>
                    )}
                  </Button>
                  {!selectedRepo && (
                    <span className="text-[10px] text-muted-foreground/60">← select a repo first</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative">
              {!selectedRepo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                    <FolderGit2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Select a repository</h3>
                  <p className="text-muted-foreground max-w-md">
                    Choose a project from the left panel to analyze your recent work and rebuild your context.
                  </p>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {summaryMode === "standup" ? "Writing Standup..." : "Engaging Code Brain..."}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isMultiRepo
                        ? `Fetching commit details across ${selectedRepos.length} repos and synthesizing cross-repo context.`
                        : "Fetching commit details, reading diffs, and synthesizing your recent work momentum."}
                    </p>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : generateError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                    <Sparkles className="w-7 h-7 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Generation Failed</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-6">{generateError}</p>
                  <button
                    onClick={handleGenerateSummary}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              ) : displayResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl space-y-8"
                >
                  {/* Metadata row */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                      <Clock className="w-3 h-3" />
                      {isFromCache ? (
                        <span>Cached · {formatRelativeDate(cachedSummary!.generatedAt)}</span>
                      ) : (
                        <span>Generated {formatRelativeDate(displayResult.generated_at)}</span>
                      )}
                      {isFromCache && (
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-medium border border-amber-500/20">from cache</span>
                      )}
                      {isMultiRepo && (
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-medium border border-violet-500/20">
                          {selectedRepos.length} repos
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all"
                    >
                      {copied ? (
                        <><Check className="w-3.5 h-3.5 text-emerald-400" />Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" />Copy as Markdown</>
                      )}
                    </button>
                  </div>

                  {/* Standup */}
                  {displayResult.standup_update ? (
                    <section>
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" />
                          Standup Update
                        </h3>
                        {mergedCommits.length > 0 && (
                          <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(mergedCommits[mergedCommits.length - 1].author_date).toLocaleDateString()} – {new Date(mergedCommits[0].author_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-white leading-relaxed whitespace-pre-wrap font-mono text-sm">
                        {displayResult.standup_update}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">Paste this directly into Slack, Notion, or your standup tool.</p>
                    </section>
                  ) : null}

                  {/* What you were doing */}
                  <section>
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                      <GitCommitHorizontal className="w-4 h-4" />
                      What you were doing
                    </h3>
                    <div className="p-5 rounded-xl bg-secondary/30 border border-white/5 text-white leading-relaxed">
                      {displayResult.what_you_were_doing}
                    </div>
                  </section>

                  {/* Key Changes */}
                  <section>
                    <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                      <GitMerge className="w-4 h-4" />
                      Key Changes
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {displayResult.key_changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          <span className="text-sm text-muted-foreground">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Next Steps */}
                  <section>
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Suggested Next Steps
                    </h3>
                    <div className="space-y-3">
                      {displayResult.suggested_next_steps.map((step, i) => (
                        <div key={i} className="group flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors cursor-default">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                            {i + 1}
                          </div>
                          <span className="text-white font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                    <BrainCircuit className="w-8 h-8 text-primary opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to Resume</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Click <span className="text-primary font-medium">{summaryMode === "standup" ? "Generate Standup" : "What's next?"}</span> above to analyze your recent work{isMultiRepo ? ` across ${selectedRepos.length} repos` : ` in ${selectedRepo.name}`}.
                  </p>
                  <div className="flex flex-col items-center gap-2 text-[11px] text-muted-foreground/50">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <GitCommitHorizontal className="w-3.5 h-3.5" />
                        {mergedCommits.length} commits ready to analyze
                      </span>
                      {!isMultiRepo && activeBranch && (
                        <span className="flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5" />{activeBranch}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dev Health Card */}
            <AnimatePresence>
              {commitStats && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-t border-white/5 px-5 py-4 bg-white/[0.015] flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dev Health</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {commitStats.flags.map(flag => (
                      <div key={flag.type} className="flex items-start gap-3">
                        <span className="text-base leading-none mt-0.5">{flag.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white/80">{flag.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{flag.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
