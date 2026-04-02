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
  Repository,
  Commit,
  Branch
} from "@workspace/api-client-react"
import { useGenerateSummary } from "@/hooks/use-devcontext"
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

// ─── CommitCard ─────────────────────────────────────────────────────────────
function CommitCard({ commit, owner, repo, idx }: { commit: Commit; owner: string; repo: string; idx: number }) {
  const [expanded, setExpanded] = useState(false)

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
          onClick={() => setExpanded(e => !e)}
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
              <div className="p-3 bg-black/20 max-h-48 overflow-y-auto scrollbar-hide">
                {isDetailLoading ? (
                  <div className="space-y-2 py-1">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                  </div>
                ) : detail?.files.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-1">No file changes.</p>
                ) : (
                  <div className="space-y-1">
                    {detail?.files.map(f => (
                      <div key={f.filename} className="flex items-center gap-2 text-[11px] font-mono py-0.5">
                        <span className={`shrink-0 ${statusColor(f.status)}`}>
                          {f.status === "added" ? <Plus className="w-3 h-3" /> : f.status === "removed" ? <Minus className="w-3 h-3" /> : <FileCode className="w-3 h-3" />}
                        </span>
                        <span className="text-muted-foreground truncate flex-1">{f.filename}</span>
                        <span className="shrink-0 text-emerald-400">+{f.additions}</span>
                        <span className="shrink-0 text-red-400">-{f.deletions}</span>
                      </div>
                    ))}
                    {detail && (
                      <div className="pt-2 border-t border-white/5 text-[11px] text-muted-foreground flex gap-3">
                        <span>{detail.files.length} files</span>
                        <span className="text-emerald-400">+{detail.stats.additions}</span>
                        <span className="text-red-400">-{detail.stats.deletions}</span>
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
  const [commitLimit, setCommitLimit] = useState<15 | 30 | 50>(() => {
    const saved = localStorage.getItem('dc_commit_limit')
    return (saved === '30' ? 30 : saved === '50' ? 50 : 15) as 15 | 30 | 50
  })

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

  const { generate, isGenerating, progress, result } = useGenerateSummary()

  const commitStats = useMemo(() => {
    if (!commits || commits.length === 0) return null
    return computeCommitStats(commits)
  }, [commits])

  useEffect(() => {
    if (isError) setLocation("/")
  }, [isError, setLocation])

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
      generate(owner, selectedRepo.name, commits, summaryMode)
    }
  }

  const buildMarkdown = () => {
    if (!result) return ""
    if (result.standup_update) {
      return `## Standup – ${selectedRepo?.name ?? "Repo"}\n\n${result.standup_update}`
    }
    return [
      `## Code Brain Analysis – ${selectedRepo?.name ?? "Repo"}`,
      "",
      `### What I was doing`,
      result.what_you_were_doing,
      "",
      `### Key Changes`,
      result.key_changes.map(c => `- ${c}`).join("\n"),
      "",
      `### Suggested Next Steps`,
      result.suggested_next_steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    ].join("\n")
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildMarkdown())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 overflow-hidden h-[calc(100vh-4rem)]">
        
        {/* Left Column: Repository, Branch & Commits */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5 overflow-hidden border-r border-white/5 pr-4">
          
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
                {isBranchesLoading ? (
                  <Skeleton className="h-9 w-full rounded-xl" />
                ) : (
                  <select
                    value={activeBranch ?? ""}
                    onChange={(e) => {
                      setSelectedBranch(e.target.value)
                      localStorage.setItem('dc_last_branch', e.target.value)
                    }}
                    className="w-full bg-secondary/30 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    {branches?.map(b => (
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
                <span className="text-[10px] text-muted-foreground/40 self-center ml-auto pl-1">last {commitLimit}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Commit List */}
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Commits</h2>
              <div className="flex items-center gap-0.5 bg-secondary/40 rounded-lg border border-white/8 p-0.5">
                {([15, 30, 50] as const).map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setCommitLimit(n)
                      localStorage.setItem('dc_commit_limit', String(n))
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      commitLimit === n ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 pb-8">
              {!selectedRepo ? (
                <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-secondary/20 p-8 text-center">
                  <p className="text-sm text-muted-foreground">Select a repository to view recent commits.</p>
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
        <div className="w-full lg:w-2/3 flex flex-col bg-card border border-white/5 rounded-2xl shadow-xl overflow-hidden relative">
          
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

              <Button 
                onClick={handleGenerateSummary} 
                disabled={!selectedRepo || !commits?.length || isGenerating}
                size="sm"
                className="gap-2"
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
            ) : result ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl space-y-8"
              >
                {/* Copy Button */}
                <div className="flex justify-end">
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
                {result.standup_update ? (
                  <section>
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Standup Update
                    </h3>
                    <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-white leading-relaxed whitespace-pre-wrap font-mono text-sm">
                      {result.standup_update}
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
                    {result.what_you_were_doing}
                  </div>
                </section>

                {/* Key Changes */}
                <section>
                  <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                    <GitMerge className="w-4 h-4" />
                    Key Changes
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.key_changes.map((change, i) => (
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
                    {result.suggested_next_steps.map((step, i) => (
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
                <p className="text-muted-foreground max-w-md">
                  Click the button above to generate a{summaryMode === "standup" ? " standup update" : " fresh summary of your recent work"} in <b>{selectedRepo.name}</b>.
                </p>
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
      </main>
    </div>
  )
}
