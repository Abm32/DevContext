import { useState, useEffect, useMemo, useRef } from "react"
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
  Branch,
  DepContextItem,
} from "@workspace/api-client-react"
import { useGenerateSummary } from "@/hooks/use-devcontext"
import { DepHealthPanel } from "@/components/dep-health-panel"
import { track } from "@/hooks/use-track"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
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
  FileCode,
  ClipboardList,
  Plus,
  Minus,
  Heart,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────
type SummaryResult = {
  what_you_were_doing: string
  key_changes: string[]
  suggested_next_steps: string[]
  standup_update: string | null
  generated_at: string
}
type CachedSummary = { result: SummaryResult; generatedAt: string; mode: "next_steps" | "standup" }

function loadCachedSummary(repoFullName: string, branch: string): CachedSummary | null {
  try {
    const raw = localStorage.getItem(`dc_summary_${repoFullName}_${branch}`)
    if (!raw) return null
    return JSON.parse(raw) as CachedSummary
  } catch { return null }
}

function saveCachedSummary(repoFullName: string, branch: string, data: CachedSummary) {
  try {
    localStorage.setItem(`dc_summary_${repoFullName}_${branch}`, JSON.stringify(data))
  } catch { /* quota exceeded – ignore */ }
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
        return (
          <span key={i} className={`block px-2 ${bg}`}>{line || " "}</span>
        )
      })}
    </pre>
  )
}

// ─── CommitCard ─────────────────────────────────────────────────────────────
function CommitCard({ commit, owner, repo, idx }: { commit: Commit; owner: string; repo: string; idx: number }) {
  const [expanded, setExpanded] = useState(false)
  const [expandedFile, setExpandedFile] = useState<string | null>(null)

  const { data: detail, isLoading: isDetailLoading } = useGetCommitDetail(
    owner, repo, commit.sha,
    { query: { enabled: expanded } }
  )

  const statusColor = (s: string) => {
    if (s === "added") return "text-emerald-400"
    if (s === "removed") return "text-red-400"
    if (s === "renamed") return "text-amber-400"
    return "text-blue-400"
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="relative pl-6"
    >
      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-background bg-primary" />
      <div className="bg-card border border-white/5 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => { setExpanded(e => !e); setExpandedFile(null) }}
          className="w-full p-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-white/10">
              {getShortSha(commit.sha)}
            </Badge>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeDate(commit.author_date)}
            </span>
          </div>
          <p className="text-sm text-white font-medium leading-snug line-clamp-2">
            {commit.message.split('\n')[0]}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                {commit.author_name.charAt(0)}
              </div>
              <span className="text-xs text-muted-foreground">{commit.author_name}</span>
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              {expanded ? "Hide files" : "Show files"}
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="p-3 bg-black/20 max-h-72 overflow-y-auto scrollbar-hide">
                {isDetailLoading ? (
                  <div className="space-y-2 py-1">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                  </div>
                ) : detail?.files.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-1">No file changes.</p>
                ) : (
                  <div className="space-y-0.5">
                    {detail?.files.map(f => (
                      <div key={f.filename}>
                        <button
                          onClick={() => setExpandedFile(v => v === f.filename ? null : f.filename)}
                          className={`w-full flex items-center gap-2 text-[11px] font-mono py-1 px-1 rounded hover:bg-white/5 transition-colors ${expandedFile === f.filename ? "bg-white/5" : ""}`}
                        >
                          <span className={`shrink-0 ${statusColor(f.status)}`}>
                            {f.status === "added" ? <Plus className="w-3 h-3" /> : f.status === "removed" ? <Minus className="w-3 h-3" /> : <FileCode className="w-3 h-3" />}
                          </span>
                          <span className="text-muted-foreground truncate flex-1 text-left">{f.filename}</span>
                          <span className="shrink-0 text-emerald-400">+{f.additions}</span>
                          <span className="shrink-0 text-red-400">-{f.deletions}</span>
                          {f.patch && (
                            <ChevronRight className={`w-3 h-3 text-muted-foreground/40 shrink-0 transition-transform ${expandedFile === f.filename ? "rotate-90" : ""}`} />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFile === f.filename && f.patch && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-1 mb-1 rounded-lg border border-white/5 overflow-x-auto max-h-48 overflow-y-auto bg-black/30">
                                <DiffView patch={f.patch} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    {detail && (
                      <div className="pt-2 mt-1 border-t border-white/5 text-[11px] text-muted-foreground flex gap-3 flex-wrap">
                        <span className="font-semibold text-white/60">{detail.files.length} files changed</span>
                        <span className="text-emerald-400">+{detail.stats.additions} additions</span>
                        <span className="text-red-400">−{detail.stats.deletions} deletions</span>
                        {detail.files.some(f => f.patch) && (
                          <span className="text-muted-foreground/40">click file for diff</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading: isAuthLoading, isError } = useGetMe({ query: { retry: false } })

  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [repoSearch, setRepoSearch] = useState("")
  const [summaryMode, setSummaryMode] = useState<"next_steps" | "standup">("next_steps")
  const [copied, setCopied] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<"commits" | "ai">("commits")
  const commitLimit = 30
  const [cachedSummary, setCachedSummary] = useState<CachedSummary | null>(null)

  const initialRepo = useRef(localStorage.getItem('dc_last_repo'))
  const initialBranch = useRef(localStorage.getItem('dc_last_branch'))
  const repoRestored = useRef(false)
  const branchRestored = useRef(false)

  const { data: repos, isLoading: isReposLoading } = useListRepos({
    query: { enabled: !!user }
  })

  const owner = selectedRepo?.full_name.split('/')[0] || ""

  const { data: branches, isLoading: isBranchesLoading } = useListBranches(
    owner,
    selectedRepo?.name || "",
    { query: { enabled: !!selectedRepo } }
  )

  // Reset branch when repo changes, persist to localStorage
  const handleSelectRepo = (repo: Repository) => {
    setSelectedRepo(repo)
    setSelectedBranch(null)
    localStorage.setItem('dc_last_repo', repo.full_name)
    localStorage.removeItem('dc_last_branch')
  }

  const activeBranch = selectedBranch ?? selectedRepo?.default_branch ?? undefined

  const { data: commits, isLoading: isCommitsLoading, isError: isCommitsError } = useListCommits(
    owner,
    selectedRepo?.name || "",
    { per_page: commitLimit, branch: activeBranch },
    { query: { enabled: !!selectedRepo, retry: 1 } }
  )

  // Fetch recent commit details to collect changed filenames for dep manifest detection.
  // GitHub list-commits API does not include per-commit file lists; we fetch
  // the 3 most recent commit details in parallel and union all unique filenames.
  const recentShas = useMemo(() => commits?.slice(0, 3).map((c) => c.sha) ?? [], [commits])
  const { data: detail0 } = useGetCommitDetail(owner, selectedRepo?.name || "", recentShas[0] ?? "", {
    query: { enabled: !!selectedRepo && !!recentShas[0] },
  })
  const { data: detail1 } = useGetCommitDetail(owner, selectedRepo?.name || "", recentShas[1] ?? "", {
    query: { enabled: !!selectedRepo && !!recentShas[1] },
  })
  const { data: detail2 } = useGetCommitDetail(owner, selectedRepo?.name || "", recentShas[2] ?? "", {
    query: { enabled: !!selectedRepo && !!recentShas[2] },
  })
  // Union all unique filenames from the fetched commit details
  const recentFiles = useMemo(() => {
    const all = [detail0, detail1, detail2]
      .flatMap((d) => d?.files.map((f) => f.filename) ?? [])
    const unique = [...new Set(all)]
    return unique.length > 0 ? unique.join(",") : undefined
  }, [detail0, detail1, detail2])

  // Dependency health data (generated hook)
  const {
    data: depsReport,
    isLoading: isDepsLoading,
    isError: isDepsError,
    refetch: refetchDeps,
  } = useGetRepoDeps(
    owner,
    selectedRepo?.name || "",
    {
      branch: activeBranch,
      language: selectedRepo?.language ?? undefined,
      files: recentFiles,
    },
    { query: { enabled: !!selectedRepo && !!owner } }
  )

  // Build dep_context for AI: top 5 major-severity deps only (critical upgrade risk)
  const depContext = useMemo((): DepContextItem[] => {
    if (!depsReport?.deps) return []
    return depsReport.deps
      .filter((d): d is typeof d & { latest_version: string } =>
        d.severity === "major" && d.latest_version != null
      )
      .slice(0, 5)
      .map((d) => ({
        name: d.name,
        current_version: d.current_version,
        latest_version: d.latest_version,
        severity: "major" as const,
        ecosystem: d.ecosystem,
      }))
  }, [depsReport])

  const { generate, isGenerating, progress, result } = useGenerateSummary()

  const commitStats = useMemo(() => {
    if (!commits || commits.length === 0) return null
    return computeCommitStats(commits)
  }, [commits])


  useEffect(() => {
    if (isError) setLocation("/")
  }, [isError, setLocation])

  useEffect(() => {
    if (user) {
      void track("page_view", { page: "/dashboard" })
    }
  }, [user])

  // One-time repo restoration from localStorage
  useEffect(() => {
    if (repoRestored.current || !repos || !initialRepo.current) return
    repoRestored.current = true
    const match = repos.find(r => r.full_name === initialRepo.current)
    if (match) setSelectedRepo(match)
  }, [repos])

  // One-time branch restoration from localStorage
  useEffect(() => {
    if (branchRestored.current || !branches || !initialBranch.current) return
    branchRestored.current = true
    const match = branches.find(b => b.name === initialBranch.current)
    if (match) setSelectedBranch(match.name)
  }, [branches])

  // Persist the active branch whenever branches load and storage is empty.
  useEffect(() => {
    if (!branches || !activeBranch || !selectedRepo) return
    if (!localStorage.getItem('dc_last_branch')) {
      localStorage.setItem('dc_last_branch', activeBranch)
    }
  }, [branches, activeBranch, selectedRepo])

  // Restore cached summary when repo/branch changes
  useEffect(() => {
    if (!selectedRepo || !activeBranch) { setCachedSummary(null); return }
    const cached = loadCachedSummary(selectedRepo.full_name, activeBranch)
    setCachedSummary(cached)
  }, [selectedRepo?.full_name, activeBranch])

  // Save summary to localStorage after generation
  useEffect(() => {
    if (!result || !selectedRepo || !activeBranch) return
    const data: CachedSummary = { result: result as SummaryResult, generatedAt: result.generated_at ?? new Date().toISOString(), mode: summaryMode }
    setCachedSummary(data)
    saveCachedSummary(selectedRepo.full_name, activeBranch, data)
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

  const handleGenerateSummary = () => {
    if (selectedRepo && commits) {
      const eventType = summaryMode === "standup" ? "click:generate_standup" : "click:generate_summary"
      void track(eventType, {
        page: "/dashboard",
        element: "generate_button",
        metadata: { repo: selectedRepo.full_name, commits: commits.length, mode: summaryMode },
      })
      setGenerateError(null)
      generate(owner, selectedRepo.name, commits, summaryMode, depContext).catch(() => {
        setGenerateError("Something went wrong generating your summary. Please try again.")
      })
    }
  }

  const buildMarkdown = () => {
    if (!displayResult) return ""
    if (displayResult.standup_update) {
      const dateRange = commits && commits.length > 0
        ? ` (${new Date(commits[commits.length - 1].author_date).toLocaleDateString()} – ${new Date(commits[0].author_date).toLocaleDateString()})`
        : ""
      return `## Standup – ${selectedRepo?.name ?? "Repo"}${dateRange}\n\n${displayResult.standup_update}`
    }
    return [
      `## Code Brain Analysis – ${selectedRepo?.name ?? "Repo"}`,
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
        
        {/* Left Column: Repository, Branch & Commits */}
        <div className={`w-full md:w-1/3 flex flex-col gap-5 overflow-hidden border-r border-white/5 pr-0 md:pr-4 ${mobileTab === "ai" ? "hidden md:flex" : "flex"}`}>
          
          {/* Repo Selector */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Select Repository</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                className="w-full bg-secondary/30 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <div className="bg-card border border-white/5 rounded-xl overflow-y-auto max-h-[28vh] scrollbar-hide">
              {isReposLoading ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : filteredRepos?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No repositories found.</div>
              ) : (
                <div className="p-2 flex flex-col gap-1">
                  {filteredRepos?.map(repo => (
                    <button
                      key={repo.id}
                      onClick={() => handleSelectRepo(repo)}
                      className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-all ${
                        selectedRepo?.id === repo.id 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'hover:bg-white/5 text-muted-foreground hover:text-white border border-transparent'
                      }`}
                    >
                      <FolderGit2 className="w-4 h-4 shrink-0" />
                      <span className="truncate text-sm font-medium">{repo.full_name}</span>
                      {selectedRepo?.id === repo.id && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Branch Selector */}
          <AnimatePresence>
            {selectedRepo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2 overflow-hidden"
              >
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5" />
                  Branch
                </h2>
                {isBranchesLoading || !branches ? (
                  <Skeleton className="h-9 w-full rounded-xl" />
                ) : (
                  <select
                    key={selectedRepo?.id}
                    value={activeBranch ?? ""}
                    onChange={(e) => {
                      setSelectedBranch(e.target.value)
                      localStorage.setItem('dc_last_branch', e.target.value)
                    }}
                    className="w-full bg-secondary/30 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b.name} value={b.name} className="bg-background">
                        {b.name}{b.is_default ? " (default)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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
                  { label: "commits", value: String(commitStats.totalCommits), icon: "⎇" },
                  { label: "active days", value: String(commitStats.activeDays), icon: "📅" },
                  ...(commitStats.dateSpan ? [{ label: "span", value: commitStats.dateSpan, icon: "🗓️" }] : []),
                  ...(commitStats.streak >= 1 ? [{ label: "streak", value: `🔥 ${commitStats.streak}d`, icon: "" }] : []),
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/40 border border-white/8 text-[11px] text-muted-foreground"
                  >
                    {s.icon && <span className="text-[11px]">{s.icon}</span>}
                    <span className="font-semibold text-white">{s.value}</span>
                    <span>{s.label}</span>
                  </div>
                ))}
                <span className="text-[10px] text-muted-foreground/40 self-center ml-auto pl-1">last 30 commits</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Commit List */}
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Commits</h2>
            </div>
            
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
                  {[1,2,3,4].map(i => (
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
                    <button
                      onClick={() => { window.location.href = "/api/auth/github" }}
                      className="mt-1 text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                    >
                      Reconnect GitHub →
                    </button>
                  </div>
                </div>
              ) : !commits || commits.length === 0 ? (
                <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-secondary/20 p-8 text-center">
                  <p className="text-sm text-muted-foreground">No commits found in this repository.</p>
                </div>
              ) : (
                <div className="relative border-l border-white/10 ml-4 space-y-5">
                  {commits.map((commit, idx) => (
                    <CommitCard
                      key={commit.sha}
                      commit={commit}
                      owner={owner}
                      repo={selectedRepo.name}
                      idx={idx}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Column: AI Summary Panel */}
        <div className={`w-full md:w-2/3 flex flex-col gap-4 overflow-hidden ${mobileTab === "commits" ? "hidden md:flex" : "flex"}`}>

          {/* Dependency Health Panel — always visible at top of right column */}
          <AnimatePresence>
            {selectedRepo && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <DepHealthPanel
                  report={depsReport}
                  isLoading={isDepsLoading}
                  isError={isDepsError}
                  refetch={refetchDeps}
                />
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
                  <p className="text-sm text-muted-foreground">AI-powered context recovery</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* Mode Toggle */}
                <div className="flex items-center bg-secondary/40 rounded-xl border border-white/10 p-1 gap-1">
                  <button
                    onClick={() => setSummaryMode("next_steps")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      summaryMode === "next_steps"
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    Next Steps
                  </button>
                  <button
                    onClick={() => setSummaryMode("standup")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      summaryMode === "standup"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Standup
                  </button>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Button 
                    onClick={handleGenerateSummary} 
                    disabled={!selectedRepo || !commits?.length || isGenerating || isCommitsLoading}
                    size="sm"
                    className="gap-2"
                    title={
                      !selectedRepo ? "Select a repository first" :
                      isCommitsLoading ? "Loading commits…" :
                      !commits?.length ? "No commits found in this repository" :
                      isGenerating ? "Generating…" : undefined
                    }
                  >
                    {isGenerating ? (
                      <>Analyzing...</>
                    ) : (
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
                      Fetching commit details, reading diffs, and synthesizing your recent work momentum.
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

                  {/* Standup Mode Output */}
                  {displayResult.standup_update ? (
                    <section>
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" />
                          Standup Update
                        </h3>
                        {commits && commits.length > 0 && (
                          <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(commits[commits.length - 1].author_date).toLocaleDateString()} – {new Date(commits[0].author_date).toLocaleDateString()}
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
                    Click <span className="text-primary font-medium">{summaryMode === "standup" ? "Generate Standup" : "What's next?"}</span> above to analyze your recent commits in <b>{selectedRepo.name}</b>{activeBranch ? ` on ${activeBranch}` : ""}.
                  </p>
                  <div className="flex flex-col items-center gap-2 text-[11px] text-muted-foreground/50">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5"><GitCommitHorizontal className="w-3.5 h-3.5" />{commits?.length ?? 0} commits ready to analyze</span>
                      {activeBranch && <span className="flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5" />{activeBranch}</span>}
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
                    {commitStats.flags.map((flag) => (
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
