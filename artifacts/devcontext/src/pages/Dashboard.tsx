import { useState, useEffect, useMemo, useRef } from "react"
import { useQuery, useQueries } from "@tanstack/react-query"
import { useLocation } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import { formatRelativeDate, getShortSha } from "@/lib/utils"
import { computeCommitStats } from "@/lib/commit-stats"
import {
  useGetMe,
  useListRepos,
  useGetCommitDetail,
  listBranches,
  getListBranchesQueryKey,
  listCommits,
  getListCommitsQueryKey,
  getCommitDetail,
  getGetCommitDetailQueryKey,
  getRepoDeps,
  getGetRepoDepsQueryKey,
  Repository,
  Commit,
  DepContextItem,
} from "@workspace/api-client-react"
import { useGenerateSummary } from "@/hooks/use-devcontext"
import { usePlan } from "@/hooks/use-plan"
import { useRazorpay } from "@/hooks/use-razorpay"
import { DepHealthPanel } from "@/components/dep-health-panel"
import { UpgradePrompt, UsageChip, UpgradeButton } from "@/components/upgrade-prompt"
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
  Mail,
  Send,
  ExternalLink,
  Calendar,
  Zap,
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
        className="p-3 md:p-4 cursor-pointer"
        onClick={() => { setExpanded(e => !e); setExpandedFile(null) }}
      >
        <div className="flex items-start justify-between gap-2 md:gap-3">
          <div className="flex items-start gap-2 md:gap-2.5 min-w-0">
            <GitCommitHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground shrink-0 mt-0.5" />
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
            <div className="p-3 md:p-4 pt-2.5 md:pt-3 space-y-2">
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
  // retry: smart — don't retry a 401 (truly unauthenticated), but allow 1 retry
  // for transient network errors that can occur right after an OAuth redirect.
  const { data: user, isError } = useGetMe({
    query: {
      refetchOnMount: "always",
      staleTime: 0,
      retry: (failureCount, error) => {
        if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 401) return false
        return failureCount < 2
      },
      retryDelay: 500,
    },
  })

  // ─── Plan & feature gates ──────────────────────────────────────────────────
  const { plan, features, usage, isFreeTier, refetch: refetchPlan } = usePlan()
  // max_repos: 1 (free) / 3 (plus) / 10 (pro) / 9999 sentinel (team = unlimited).
  // useQueries pipeline supports dynamic repo counts; no fixed slot ceiling.
  // REPO_COLORS cycles via i % REPO_COLORS.length for repos beyond index 10.
  const maxRepos = features.max_repos
  const { openCheckout } = useRazorpay()
  const [showCompareUpgrade, setShowCompareUpgrade] = useState(false)
  const [showWorkspaceUpgrade, setShowWorkspaceUpgrade] = useState(false)

  // ─── Pending plan from landing page CTA (auth-then-checkout flow) ─────────
  useEffect(() => {
    if (!user) return
    const pending = localStorage.getItem("devcontext_pending_plan") as "plus" | "pro" | "team" | null
    if (!pending) return
    localStorage.removeItem("devcontext_pending_plan")
    // Only open checkout if pending plan is strictly above the user's current plan
    const RANK: Record<string, number> = { free: 0, plus: 1, pro: 2, team: 3 }
    const currentRank = RANK[plan] ?? 0
    const pendingRank = RANK[pending] ?? 0
    if (pendingRank <= currentRank) return // already on this plan or higher — skip
    void openCheckout({ plan: pending })
  }, [user, plan, openCheckout])

  // ─── Repo selection state ─────────────────────────────────────────────────
  const [selectedRepos, setSelectedRepos] = useState<RepoEntry[]>([])
  const [multiRepoMode, setMultiRepoMode] = useState(false)
  const [repoSearch, setRepoSearch] = useState("")
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces())
  const [showSaveWorkspace, setShowSaveWorkspace] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")

  const [summaryMode, setSummaryMode] = useState<"next_steps" | "standup">("next_steps")
  const [copied, setCopied] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // ─── e2em state ──────────────────────────────────────────────────────────
  type E2emGrant = {
    granted: boolean
    id?: number
    repos?: string[]
    recipient_name?: string
    recipient_email?: string
    user_display_name?: string
  }
  type E2emResult = { subject: string; body: string; gmail_url: string; mailto_url: string; commit_count: number }
  const [e2emGrant, setE2emGrant] = useState<E2emGrant | null>(null)
  const [e2emDate, setE2emDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [e2emRecipient, setE2emRecipient] = useState("")
  const [e2emEmail, setE2emEmail] = useState("")
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [e2emResult, setE2emResult] = useState<E2emResult | null>(null)
  const [e2emError, setE2emError] = useState<string | null>(null)
  const [e2emEmailCopied, setE2emEmailCopied] = useState(false)
  const [mobileTab, setMobileTab] = useState<"commits" | "ai">("commits")
  const [depHealthExpanded, setDepHealthExpanded] = useState(false)
  const [e2emExpanded, setE2emExpanded] = useState(false)
  const [cachedSummary, setCachedSummary] = useState<CachedSummary | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem("dc_onboarded") !== "true")
  const commitLimit = 30

  const dismissOnboarding = () => {
    localStorage.setItem("dc_onboarded", "true")
    setShowOnboarding(false)
  }

  const reposRestored = useRef(false)

  // Primary accessor for backward-compat with right column logic
  const selectedRepo = selectedRepos[0]?.repo ?? null
  const activeBranch = selectedRepos[0]?.branch ?? selectedRepos[0]?.repo.default_branch ?? undefined

  // ─── Repo list ───────────────────────────────────────────────────────────
  const { data: repos, isLoading: isReposLoading } = useListRepos({ query: { enabled: !!user } })

  // ─── Dynamic query pipeline (useQueries — supports unlimited repos) ───────
  // useQueries handles dynamic-length arrays between renders; no fixed slot cap.

  const branchQueriesResult = useQueries({
    queries: selectedRepos.map(entry => ({
      queryKey: getListBranchesQueryKey(entry.repo.full_name.split("/")[0], entry.repo.name),
      queryFn: () => listBranches(entry.repo.full_name.split("/")[0], entry.repo.name),
      enabled: true,
    })),
  })
  const branchesArr = branchQueriesResult.map(q => q.data)
  const isBranchesLoadingArr = branchQueriesResult.map(q => q.isLoading)

  const commitQueriesResult = useQueries({
    queries: selectedRepos.map(entry => {
      const owner = entry.repo.full_name.split("/")[0]
      const branch = entry.branch ?? entry.repo.default_branch
      return {
        queryKey: getListCommitsQueryKey(owner, entry.repo.name, { per_page: commitLimit, branch }),
        queryFn: () => listCommits(owner, entry.repo.name, { per_page: commitLimit, branch }),
        enabled: true,
        retry: 1 as const,
      }
    }),
  })
  const commitsArr = commitQueriesResult.map(q => q.data)

  // Commit detail queries — 2 per repo, flat (index i*2 = sha0, i*2+1 = sha1)
  const commitDetailQueriesResult = useQueries({
    queries: selectedRepos.flatMap((entry, i) => {
      const owner = entry.repo.full_name.split("/")[0]
      const recentShas = (commitQueriesResult[i]?.data ?? []).slice(0, 2).map(c => c.sha)
      return [recentShas[0] ?? "", recentShas[1] ?? ""].map(sha => ({
        queryKey: getGetCommitDetailQueryKey(owner, entry.repo.name, sha),
        queryFn: () => getCommitDetail(owner, entry.repo.name, sha),
        enabled: !!sha,
      }))
    }),
  })

  // Dep health queries — one per repo, using changed files from commit details
  const depsQueriesResult = useQueries({
    queries: selectedRepos.map((entry, i) => {
      const owner = entry.repo.full_name.split("/")[0]
      const d1 = commitDetailQueriesResult[i * 2]?.data
      const d2 = commitDetailQueriesResult[i * 2 + 1]?.data
      const changedFiles = [...new Set([...(d1?.files ?? []), ...(d2?.files ?? [])].map(f => f.filename))]
      const filesParam = changedFiles.join(",")
      return {
        queryKey: getGetRepoDepsQueryKey(owner, entry.repo.name, { files: filesParam }),
        queryFn: () => getRepoDeps(owner, entry.repo.name, { files: filesParam }),
        enabled: changedFiles.length > 0,
      }
    }),
  })
  const depsReportArr = depsQueriesResult.map(q => q.data)
  const isDepsLoadingArr = depsQueriesResult.map(q => q.isLoading)
  const isDepsErrorArr = depsQueriesResult.map(q => q.isError)
  const refetchDepsArr = depsQueriesResult.map(q => q.refetch)

  // ─── Commit count (primary repo, for stats strip) ─────────────────────────
  const primaryOwner = selectedRepos[0]?.repo.full_name.split("/")[0] ?? ""
  const primaryName = selectedRepos[0]?.repo.name ?? ""
  const primaryBranch = selectedRepos[0]?.branch ?? selectedRepos[0]?.repo.default_branch
  const { data: commitCountData } = useQuery({
    queryKey: ["commitCount", primaryOwner, primaryName, primaryBranch],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (primaryBranch) params.set("branch", primaryBranch)
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/github/repos/${primaryOwner}/${primaryName}/commit-count?${params}`,
        { credentials: "include" }
      )
      if (!res.ok) return null
      const data = await res.json() as { total: number }
      return data.total
    },
    enabled: !!selectedRepos[0],
    staleTime: 5 * 60 * 1000,
  })

  // ─── Merged commit list (all active repos) ────────────────────────────────
  const mergedCommits = useMemo((): TaggedCommit[] => {
    const all: TaggedCommit[] = commitsArr.flatMap((commits, i) =>
      (commits ?? []).map(c => ({ ...c, _repoIdx: i, _repoName: selectedRepos[i]?.repo.name ?? "" }))
    )
    return all.sort((a, b) => new Date(b.author_date).getTime() - new Date(a.author_date).getTime())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(commitsArr), JSON.stringify(selectedRepos.map(e => e.repo.name))])

  const isMultiRepo = selectedRepos.length > 1
  const isCommitsLoading = commitQueriesResult[0]?.isLoading ?? false
  const isCommitsError = commitQueriesResult[0]?.isError ?? false

  // ─── Dep context (aggregate major deps from all repos for AI) ─────────────
  const depContext = useMemo((): DepContextItem[] => {
    const all = depsReportArr.flatMap(r => r?.deps ?? [])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(depsReportArr)])

  const { generate, isGenerating, progress, result } = useGenerateSummary()

  const commitStats = useMemo(() => {
    if (!mergedCommits.length) return null
    return computeCommitStats(mergedCommits)
  }, [mergedCommits])

  // ─── Auth / lifecycle effects ─────────────────────────────────────────────
  useEffect(() => { if (isError) setLocation("/") }, [isError, setLocation])

  useEffect(() => { if (user) void track("page_view", { page: "/dashboard" }) }, [user])

  // ─── Fetch e2em grant ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    fetch("/api/e2em/grant")
      .then(r => r.ok ? r.json() : null)
      .then((data: E2emGrant | null) => {
        if (data?.granted) {
          setE2emGrant(data)
          setE2emRecipient(data.recipient_name ?? "Sir")
          setE2emEmail(data.recipient_email ?? "")
        }
      })
      .catch(() => undefined)
  }, [user])

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
    if (entries.length) {
      setSelectedRepos(entries)
      if (entries.length > 1) setMultiRepoMode(true)
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </div>
    )
  }

  const filteredRepos = repos?.filter(r =>
    r.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  ).slice(0, 50)

  // ─── Repo toggle (single-select by default; multi-repo when mode is on) ──
  const handleToggleRepo = (repo: Repository) => {
    const idx = selectedRepos.findIndex(e => e.repo.id === repo.id)
    let updated: RepoEntry[]

    if (!multiRepoMode) {
      // Single-select: clicking the already-selected repo deselects; otherwise replace
      if (idx >= 0) {
        updated = []
      } else {
        updated = [{ id: crypto.randomUUID(), repo, branch: null }]
      }
    } else {
      // Multi-select: toggle in/out, capped at plan's max_repos
      if (idx >= 0) {
        updated = selectedRepos.filter((_, i) => i !== idx)
      } else if (selectedRepos.length < maxRepos) {
        updated = [...selectedRepos, { id: crypto.randomUUID(), repo, branch: null }]
      } else {
        return // at plan repo limit
      }
    }

    setSelectedRepos(updated)
    saveActiveRepos(updated)
    setCachedSummary(null)
    setGenerateError(null)
  }

  // Toggle multi-repo mode; when turning off, trim to first repo only
  const handleToggleMultiRepoMode = () => {
    if (multiRepoMode) {
      const trimmed = selectedRepos.slice(0, 1)
      setSelectedRepos(trimmed)
      saveActiveRepos(trimmed)
      setCachedSummary(null)
    }
    setMultiRepoMode(m => !m)
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
    // Auto-enable compare mode if workspace has multiple repos
    if (entries.length > 1) setMultiRepoMode(true)
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
      commits: commitsArr[i] ?? [],
    }))
    generate(repoGroups, summaryMode, depContext).then(() => {
      // Refresh plan usage count after a successful generation
      void refetchPlan()
    }).catch((err: unknown) => {
      const status = (err as { status?: number })?.status
      if (status === 402) {
        void refetchPlan()
        // exhausted state is shown via usage chip + button swap; no need for extra error
      } else {
        setGenerateError("Something went wrong generating your summary. Please try again.")
      }
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

  // ─── Dep health aggregate summary ────────────────────────────────────────
  const depHealthSummary = useMemo(() => {
    const reports = depsReportArr.filter(Boolean)
    const loading = isDepsLoadingArr.some(Boolean)
    const total = reports.reduce((acc, r) => ({
      major: acc.major + (r?.summary.major ?? 0),
      minor: acc.minor + (r?.summary.minor ?? 0),
      patch: acc.patch + (r?.summary.patch ?? 0),
    }), { major: 0, minor: 0, patch: 0 })
    return { ...total, loading, anyLoaded: reports.length > 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(depsReportArr), JSON.stringify(isDepsLoadingArr)])

  // ─── e2em — repos visible to the user that match the grant ───────────────
  const e2emMatchedRepos = e2emGrant?.granted
    ? selectedRepos
        .map(entry => entry.repo.full_name)
        .filter(name => (e2emGrant.repos ?? []).includes(name))
    : []
  const showE2emPanel = e2emMatchedRepos.length > 0

  // ─── e2em generate ───────────────────────────────────────────────────────
  const handleGenerateEmail = async () => {
    if (!e2emGrant || e2emMatchedRepos.length === 0) return
    setIsGeneratingEmail(true)
    setE2emError(null)
    setE2emResult(null)
    try {
      const res = await fetch("/api/e2em/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repos: e2emMatchedRepos,
          date: e2emDate,
          recipient_name: e2emRecipient,
          recipient_email: e2emEmail,
          user_display_name: e2emGrant.user_display_name,
        }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        setE2emError(err.error ?? "Generation failed")
        return
      }
      const data = await res.json() as E2emResult
      setE2emResult(data)
    } catch {
      setE2emError("Network error — please try again")
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  const handleCopyEmail = async () => {
    if (!e2emResult) return
    await navigator.clipboard.writeText(`${e2emResult.subject}\n\n${e2emResult.body}`)
    setE2emEmailCopied(true)
    setTimeout(() => setE2emEmailCopied(false), 2000)
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      {/* ── Onboarding banner (first-time users only) ──────────────────────── */}
      <AnimatePresence>
        {showOnboarding && selectedRepos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative z-10 px-4 pt-3 pb-0 md:px-8"
          >
            <div
              className="rounded-xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
              style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <div className="flex items-center gap-2 shrink-0">
                <BrainCircuit className="w-4 h-4 shrink-0" style={{ color: "#3b82f6" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3b82f6" }}>
                  Get started in 3 steps
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { n: "1", label: "Pick a repository" },
                  { n: "2", label: "Select a branch" },
                  { n: "3", label: 'Hit "What\'s next?"' },
                ].map((step, i) => (
                  <div key={step.n} className="flex items-center gap-1.5">
                    {i > 0 && <ArrowRight className="w-3 h-3 shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: "rgba(59,130,246,0.3)", color: "#93c5fd" }}
                      >
                        {step.n}
                      </span>
                      <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{step.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={dismissOnboarding}
                className="ml-auto shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile tab switcher */}
      <div className="md:hidden flex" style={{ background: "#0e0e10", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {([
          { id: "commits", label: "Commits", icon: <GitCommitHorizontal className="w-4 h-4" /> },
          { id: "ai",      label: "AI Analysis", icon: <Sparkles className="w-4 h-4" />, dot: !!displayResult },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
          >
            <div
              className="flex items-center justify-center w-10 h-7 rounded-full transition-all"
              style={mobileTab === tab.id ? { background: "rgba(59,130,246,0.15)" } : {}}
            >
              <span style={{ color: mobileTab === tab.id ? "#3b82f6" : "#475569" }}>{tab.icon}</span>
            </div>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: mobileTab === tab.id ? "#3b82f6" : "#475569" }}
            >
              {tab.label}
            </span>
            {"dot" in tab && tab.dot && (
              <span className="absolute top-2.5 right-[calc(50%-12px)] w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 container mx-auto px-3 md:px-4 py-3 md:py-8 flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden h-[calc(100dvh-6.5rem)] md:h-[calc(100vh-3.5rem)]">

        {/* ── Left Column ────────────────────────────────────────────────── */}
        <div className={`w-full md:w-1/3 flex flex-col gap-3 md:gap-4 overflow-hidden md:border-r border-white/5 pr-0 md:pr-4 ${mobileTab === "ai" ? "hidden md:flex" : "flex"}`}>

          {/* Workspaces strip */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                <Bookmark className="w-3 h-3" />
                Workspaces
              </h2>
              {selectedRepos.length > 0 && (
                <button
                  onClick={() => features.workspaces ? setShowSaveWorkspace(s => !s) : setShowWorkspaceUpgrade(v => !v)}
                  className="text-[11px] flex items-center gap-1 transition-colors"
                  style={{ color: features.workspaces ? undefined : "#a78bfa" }}
                  title={features.workspaces ? "Save as workspace" : "Upgrade to Pro to save workspaces"}
                >
                  <BookmarkPlus className="w-3 h-3" />
                  Save
                  {!features.workspaces && <span style={{ fontSize: "8px", color: "#a78bfa", fontWeight: 800 }}>PRO</span>}
                </button>
              )}
            </div>

            {/* Workspace upgrade nudge */}
            <AnimatePresence>
              {showWorkspaceUpgrade && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <UpgradePrompt
                    inline
                    currentPlan={plan}
                    feature="Saved Workspaces"
                    description="Save and restore your repo + branch combinations instantly."
                    onDismiss={() => setShowWorkspaceUpgrade(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
                <h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Active Repos</h2>
                {selectedRepos.map((entry, i) => {
                  const color = REPO_COLORS[i % REPO_COLORS.length]!
                  const branches = branchesArr[i]
                  const isBranchLoading = isBranchesLoadingArr[i]
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
              <h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                {!multiRepoMode
                  ? "Repository"
                  : selectedRepos.length < maxRepos
                    ? "Compare Repos"
                    : `Repositories (max ${maxRepos})`}
              </h2>
              {/* Compare mode toggle — Pro feature */}
              <button
                onClick={() => features.compare_mode ? handleToggleMultiRepoMode() : setShowCompareUpgrade(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all"
                style={multiRepoMode
                  ? { background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }
                  : { background: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid rgba(255,255,255,0.08)" }}
                title={features.compare_mode
                  ? (multiRepoMode
                    ? "Exit compare mode (keeps first repo)"
                    : `Compare up to ${maxRepos} repos side by side`)
                  : "Upgrade to unlock compare mode"}
              >
                <Layers className="w-3 h-3" />
                {multiRepoMode ? "Exit Compare" : "Compare"}
                {!features.compare_mode && <span style={{ fontSize: "8px", color: "#a78bfa", fontWeight: 800 }}>PLUS+</span>}
              </button>
            </div>
            {/* Compare upgrade nudge */}
            <AnimatePresence>
              {showCompareUpgrade && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <UpgradePrompt
                    inline
                    currentPlan={plan}
                    feature="Compare Mode"
                    description="Unlock multi-repo AI analysis across your codebase."
                    onDismiss={() => setShowCompareUpgrade(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
                    // In single-select mode nothing is ever "full" — clicking always switches
                    const isFull = multiRepoMode && selectedRepos.length >= maxRepos && !isSelected
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
            {/* Org access note — shown once repos have loaded */}
            {!isReposLoading && repos && repos.length > 0 && (
              <div className="px-3 pb-2 flex items-start gap-1.5 text-[11px] text-muted-foreground/60 leading-snug">
                <span className="mt-0.5 shrink-0">ℹ️</span>
                <span>
                  Missing an org repo?{" "}
                  <a
                    href="https://github.com/settings/connections/applications"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    Grant org access on GitHub
                  </a>{" "}
                  or ask your org admin to approve this app.
                </span>
              </div>
            )}
          </div>

          {/* Stats Strip */}
          <AnimatePresence>
            {commitStats && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-1.5"
              >
                {[
                  {
                    label: "commits",
                    value: commitCountData != null && !isMultiRepo ? String(commitCountData) : String(commitStats.totalCommits),
                    icon: <GitCommitHorizontal className="w-3 h-3" />,
                    accent: "#3b82f6",
                  },
                  {
                    label: "active days",
                    value: String(commitStats.activeDays),
                    icon: <Clock className="w-3 h-3" />,
                    accent: "#8b5cf6",
                  },
                  ...(commitStats.dateSpan ? [{
                    label: commitStats.dateSpan,
                    value: "",
                    icon: <Calendar className="w-3 h-3" />,
                    accent: "#64748b",
                  }] : []),
                  ...(commitStats.streak >= 1 ? [{
                    label: `${commitStats.streak}d streak`,
                    value: "",
                    icon: <span className="text-[11px]">🔥</span>,
                    accent: "#f59e0b",
                  }] : []),
                  ...(isMultiRepo ? [{
                    label: `${selectedRepos.length} repos`,
                    value: "",
                    icon: <Layers className="w-3 h-3" />,
                    accent: "#10b981",
                  }] : []),
                ].map(s => (
                  <div
                    key={s.label}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <span style={{ color: s.accent }}>{s.icon}</span>
                    {s.value && <span className="font-semibold text-white">{s.value}</span>}
                    <span style={{ color: "#64748b" }}>{s.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Commit List */}
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <h2 className="text-[10px] font-bold uppercase tracking-widest shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>Recent Commits</h2>
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
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-red-500/20 rounded-xl bg-red-500/5 p-6 text-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-400" />
                  </div>
                  {(() => {
                    const status = (commitQueriesResult[0]?.error as { status?: number } | null)?.status
                    const isRateLimit = status === 403
                    return (
                      <>
                        <div className="space-y-1.5">
                          <p className="text-sm font-semibold text-red-400">
                            {isRateLimit ? "GitHub rate limit reached" : "Cannot access commits"}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-[230px]">
                            {isRateLimit
                              ? "GitHub's API limit has been hit. Wait a minute and try again."
                              : "This may be a private org repo. Grant org access on GitHub or ask your org admin to approve this app."}
                          </p>
                        </div>
                        <button
                          onClick={() => window.location.reload()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                        >
                          <ArrowRight className="w-3 h-3" />
                          {isRateLimit ? "Retry" : "Grant access on GitHub"}
                        </button>
                      </>
                    )
                  })()}
                </div>
              ) : mergedCommits.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
                  <GitCommitHorizontal className="w-8 h-8 text-muted-foreground/30" />
                  <div>
                    <p className="text-sm text-muted-foreground">No commits found on this branch.</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">Try switching branches using the selector above.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {mergedCommits.map((commit, idx) => {
                    const owner = selectedRepos[commit._repoIdx]?.repo.full_name.split("/")[0] ?? primaryOwner
                    const repoName = commit._repoName
                    const color = isMultiRepo ? REPO_COLORS[commit._repoIdx % REPO_COLORS.length] : undefined
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

            {/* Mobile: "Analyze commits" nudge */}
            {mergedCommits.length > 0 && !displayResult && (
              <button
                onClick={() => setMobileTab("ai")}
                className="md:hidden mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: "0 4px 16px rgba(59,130,246,0.25)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Analyze {mergedCommits.length} commits →
              </button>
            )}
          </div>
        </div>

        {/* ── Right Column ───────────────────────────────────────────────── */}
        <div className={`w-full md:w-2/3 flex flex-col gap-4 overflow-hidden min-w-0 ${mobileTab === "commits" ? "hidden md:flex" : "flex"}`}>

          {/* Dependency Health — collapsible strip */}
          <AnimatePresence>
            {selectedRepos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex flex-col rounded-xl overflow-hidden"
                style={{ background: "#131314", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {/* Compact header (always visible) */}
                <button
                  onClick={() => setDepHealthExpanded(e => !e)}
                  className="flex items-center justify-between px-3.5 py-2.5 w-full text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                      Dep Health
                    </span>
                    {depHealthSummary.loading ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#475569" }}>
                        Checking…
                      </span>
                    ) : depHealthSummary.major > 0 ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                        {depHealthSummary.major} major outdated
                      </span>
                    ) : depHealthSummary.minor > 0 ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
                        {depHealthSummary.minor} minor
                      </span>
                    ) : depHealthSummary.anyLoaded ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                        All current
                      </span>
                    ) : null}
                  </div>
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform"
                    style={{ color: "#475569", transform: depHealthExpanded ? "rotate(180deg)" : "none" }}
                  />
                </button>

                {/* Expanded panels */}
                <AnimatePresence>
                  {depHealthExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`p-3 pt-0 grid gap-3 ${selectedRepos.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
                      >
                        {selectedRepos.map((entry, i) => {
                          const report = depsReportArr[i]
                          const loading = isDepsLoadingArr[i]
                          const error = isDepsErrorArr[i]
                          const refetch = refetchDepsArr[i]!
                          const color = REPO_COLORS[i % REPO_COLORS.length]!
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Summary Panel */}
          <div className="flex-1 flex flex-col bg-card border border-white/5 rounded-2xl shadow-xl overflow-hidden relative min-h-0 min-w-0">
            {/* Header row 1: title + usage chip + copy button */}
            <div className="px-3 md:px-5 pt-3 md:pt-4 pb-0 flex items-start justify-between gap-2 md:gap-3">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="p-1.5 rounded-lg shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                  <Sparkles className="w-4 h-4" style={{ color: "#3b82f6" }} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm md:text-base font-bold text-white truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Code Brain Analysis</h2>
                  <p className="text-[11px] md:text-xs truncate" style={{ color: "#64748b" }}>
                    {isMultiRepo
                      ? `${selectedRepos.length} repos · AI-powered context recovery`
                      : "AI-powered context recovery"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                {usage.ai_analyses.limit < 9999 && (
                  <UsageChip
                    used={usage.ai_analyses.used}
                    limit={usage.ai_analyses.limit}
                    exhausted={usage.ai_analyses.exhausted}
                  />
                )}
                {displayResult && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 md:gap-1.5 text-[11px] md:text-xs border rounded-lg px-2 md:px-3 py-1 md:py-1.5 transition-all"
                    style={{ color: copied ? "#10b981" : "#64748b", borderColor: "rgba(255,255,255,0.08)", background: "transparent" }}
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                )}
              </div>
            </div>

            {/* Header row 2: mode toggle + generate */}
            <div className="px-3 md:px-5 pt-2 md:pt-3 pb-3 md:pb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 border-b border-white/5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <button
                    onClick={() => setSummaryMode("next_steps")}
                    className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium transition-all"
                    style={summaryMode === "next_steps"
                      ? { background: "rgba(59,130,246,0.2)", color: "#3b82f6" }
                      : { color: "#64748b" }}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    Next Steps
                  </button>
                  <button
                    onClick={() => setSummaryMode("standup")}
                    className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium transition-all"
                    style={summaryMode === "standup"
                      ? { background: "rgba(16,185,129,0.15)", color: "#10b981" }
                      : { color: "#64748b" }}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Standup
                  </button>
                </div>

                {!selectedRepo && !usage.ai_analyses.exhausted && (
                  <span className="text-[10px] md:hidden shrink-0" style={{ color: "rgba(255,255,255,0.2)" }}>Select a repo first</span>
                )}
              </div>

              {usage.ai_analyses.exhausted ? (
                <div className="md:ml-auto">
                  {plan === "team" ? (
                    <span className="text-xs px-3 py-1.5 rounded-xl" style={{ color: "#64748b", background: "rgba(255,255,255,0.04)" }}>
                      AI limit reached — contact support
                    </span>
                  ) : (
                    <UpgradeButton plan={plan === "free" ? "plus" : plan === "plus" ? "pro" : "team"} />
                  )}
                </div>
              ) : (
                <button
                  onClick={handleGenerateSummary}
                  disabled={!selectedRepo || !mergedCommits.length || isGenerating || isCommitsLoading}
                  className="md:ml-auto w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: isGenerating ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                    boxShadow: isGenerating ? "none" : "0 4px 16px rgba(59,130,246,0.25)",
                  }}
                  title={
                    !selectedRepo ? "Select a repository first" :
                    isCommitsLoading ? "Loading commits…" :
                    !mergedCommits.length ? "No commits found" :
                    isGenerating ? "Generating…" : undefined
                  }
                >
                  {isGenerating
                    ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing…</>
                    : <><Sparkles className="w-3.5 h-3.5" />{summaryMode === "standup" ? "Generate Standup" : "What's next?"}</>
                  }
                </button>
              )}
              {!selectedRepo && !usage.ai_analyses.exhausted && (
                <span className="text-[10px] hidden md:inline" style={{ color: "rgba(255,255,255,0.2)" }}>← select a repo first</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 relative min-w-0">
              {!selectedRepo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 md:mb-6">
                    <FolderGit2 className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-1.5 md:mb-2">Select a repository</h3>
                  <p className="text-sm md:text-base text-muted-foreground max-w-md">
                    Choose a project from the Commits tab to analyze your recent work and rebuild your context.
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
                  className="max-w-3xl space-y-6 md:space-y-8 min-w-0 break-words"
                >
                  {/* Metadata row */}
                  <div className="flex items-center gap-2 text-[11px] flex-wrap" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <Clock className="w-3 h-3" />
                    {isFromCache ? (
                      <span>Cached · {formatRelativeDate(cachedSummary!.generatedAt)}</span>
                    ) : (
                      <span>Generated {formatRelativeDate(displayResult.generated_at)}</span>
                    )}
                    {isFromCache && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>cache</span>
                    )}
                    {isMultiRepo && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                        {selectedRepos.length} repos
                      </span>
                    )}
                  </div>

                  {/* Standup */}
                  {displayResult.standup_update ? (
                    <section>
                      <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-1.5 md:gap-2">
                        <h3 className="text-xs md:text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 md:gap-2">
                          <ClipboardList className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Standup Update
                        </h3>
                        {mergedCommits.length > 0 && (
                          <span className="text-[10px] md:text-[11px] text-muted-foreground/60 flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span className="truncate">{new Date(mergedCommits[mergedCommits.length - 1].author_date).toLocaleDateString()} – {new Date(mergedCommits[0].author_date).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                      <div className="p-3 md:p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-white leading-relaxed whitespace-pre-wrap font-mono text-xs md:text-sm overflow-x-hidden break-words" style={{ overflowWrap: "break-word", wordBreak: "break-word" }}>
                        {displayResult.standup_update}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">Paste this directly into Slack, Notion, or your standup tool.</p>
                    </section>
                  ) : null}

                  {/* What you were doing */}
                  <section>
                    <h3 className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2">
                      <GitCommitHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                      What you were doing
                    </h3>
                    <div className="p-3 md:p-5 rounded-xl bg-secondary/30 border border-white/5 text-white text-sm md:text-base leading-relaxed break-words" style={{ overflowWrap: "break-word" }}>
                      {displayResult.what_you_were_doing}
                    </div>
                  </section>

                  {/* Key Changes */}
                  <section>
                    <h3 className="text-xs md:text-sm font-semibold text-accent uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2">
                      <GitMerge className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                      Key Changes
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {displayResult.key_changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-2.5 md:gap-3 p-3 md:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          <span className="text-xs md:text-sm text-muted-foreground min-w-0 break-words">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Next Steps */}
                  <section>
                    <h3 className="text-xs md:text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2">
                      <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                      Suggested Next Steps
                    </h3>
                    <div className="space-y-3">
                      {displayResult.suggested_next_steps.map((step, i) => (
                        <div key={i} className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors cursor-default">
                          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs md:text-sm">
                            {i + 1}
                          </div>
                          <span className="text-sm md:text-base text-white font-medium min-w-0 break-words">{step}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-5 md:p-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 md:mb-6">
                    <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-primary opacity-50" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-1.5 md:mb-2">Ready to Resume</h3>
                  <p className="text-sm md:text-base text-muted-foreground max-w-md mb-4 md:mb-6">
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
                  className="border-t border-white/5 px-3 md:px-5 py-3 md:py-4 bg-white/[0.015] flex flex-col gap-2.5 md:gap-3"
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

          {/* ── e2em Daily Standup ─────────────────────────────────────────── */}
          <AnimatePresence>
            {showE2emPanel && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col overflow-hidden flex-shrink-0 rounded-xl"
                style={{ background: "#131314", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {/* Header — clickable to expand/collapse */}
                <button
                  onClick={() => setE2emExpanded(e => !e)}
                  className="flex items-center gap-2.5 px-4 py-3 w-full text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
                    <Mail className="w-3 h-3" style={{ color: "#3b82f6" }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Daily Report (e2em)</span>
                  <span className="ml-auto mr-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: "#475569", border: "1px solid rgba(255,255,255,0.08)" }}>
                    YIP
                  </span>
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform shrink-0"
                    style={{ color: "#475569", transform: e2emExpanded ? "rotate(180deg)" : "none" }}
                  />
                </button>

                {/* Collapsible body */}
                <AnimatePresence>
                  {e2emExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >

                {/* Controls */}
                <div className="flex flex-wrap gap-3 p-4 border-b border-white/5">
                  <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date
                    </label>
                    <input
                      type="date"
                      value={e2emDate}
                      onChange={e => { setE2emDate(e.target.value); setE2emResult(null) }}
                      className="bg-secondary/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">To (name)</label>
                    <input
                      type="text"
                      value={e2emRecipient}
                      onChange={e => { setE2emRecipient(e.target.value); setE2emResult(null) }}
                      placeholder="Kumaresan"
                      className="bg-secondary/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">To (email)</label>
                    <input
                      type="email"
                      value={e2emEmail}
                      onChange={e => { setE2emEmail(e.target.value); setE2emResult(null) }}
                      placeholder="recipient@example.com"
                      className="bg-secondary/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* Generate button */}
                <div className="px-4 py-3 border-b border-white/5">
                  <button
                    onClick={() => void handleGenerateEmail()}
                    disabled={isGeneratingEmail}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                  >
                    {isGeneratingEmail ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Generate Daily Report
                      </>
                    )}
                  </button>
                  {e2emError && (
                    <p className="text-xs text-red-400 mt-2 text-center">{e2emError}</p>
                  )}
                </div>

                {/* Result */}
                <AnimatePresence>
                  {e2emResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col"
                    >
                      {/* Subject */}
                      <div className="px-4 pt-3 pb-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                        <p className="text-xs text-white font-medium">{e2emResult.subject}</p>
                      </div>
                      {/* Body */}
                      <div className="px-4 pt-2 pb-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Body</p>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans bg-secondary/20 rounded-lg p-3 border border-white/5 max-h-64 overflow-y-auto scrollbar-hide">
                          {e2emResult.body}
                        </pre>
                        {e2emResult.commit_count === 0 && (
                          <p className="text-[11px] text-amber-400/80 mt-1.5">No commits found for this date — email generated with placeholder content.</p>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="px-4 pb-4 flex gap-2">
                        <a
                          href={e2emResult.gmail_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open in Gmail
                        </a>
                        <button
                          onClick={() => void handleCopyEmail()}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-white text-xs font-medium transition-colors"
                        >
                          {e2emEmailCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {e2emEmailCopied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
