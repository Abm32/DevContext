import { useState, useEffect } from "react"
import { useLocation } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import { formatRelativeDate, getShortSha } from "@/lib/utils"
import { 
  useGetMe, 
  useListRepos, 
  useListCommits, 
  Repository,
  Commit
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
  FolderGit2, 
  Sparkles,
  ArrowRight,
  Clock,
  BrainCircuit,
  GitMerge
} from "lucide-react"

export default function Dashboard() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading: isAuthLoading, isError } = useGetMe({ query: { retry: false } })

  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [repoSearch, setRepoSearch] = useState("")

  const { data: repos, isLoading: isReposLoading } = useListRepos({
    query: { enabled: !!user }
  })

  // Extract owner from selected repo full_name
  const owner = selectedRepo?.full_name.split('/')[0] || ""
  
  const { data: commits, isLoading: isCommitsLoading, isError: isCommitsError } = useListCommits(
    owner,
    selectedRepo?.name || "",
    { per_page: 15 },
    { query: { enabled: !!selectedRepo, retry: 1 } }
  )

  const { generate, isGenerating, progress, result } = useGenerateSummary()

  useEffect(() => {
    if (isError) {
      setLocation("/")
    }
  }, [isError, setLocation])

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
      generate(owner, selectedRepo.name, commits)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 overflow-hidden h-[calc(100vh-4rem)]">
        
        {/* Left Column: Repository & Commits */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-hidden border-r border-white/5 pr-4">
          
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
            
            <div className="bg-card border border-white/5 rounded-xl flex-1 overflow-y-auto max-h-[30vh] scrollbar-hide">
              {isReposLoading ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : filteredRepos?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No repositories found.
                </div>
              ) : (
                <div className="p-2 flex flex-col gap-1">
                  {filteredRepos?.map(repo => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
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

          {/* Commit List */}
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Commits</h2>
            
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
                <div className="relative border-l border-white/10 ml-4 space-y-6">
                  {commits?.map((commit, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={commit.sha} 
                      className="relative pl-6"
                    >
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-background bg-primary" />
                      <div className="bg-card border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors shadow-sm group">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-white/10 group-hover:text-primary transition-colors">
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
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                            {commit.author_name.charAt(0)}
                          </div>
                          <span className="text-xs text-muted-foreground">{commit.author_name}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Summary Panel */}
        <div className="w-full lg:w-2/3 flex flex-col bg-card border border-white/5 rounded-2xl shadow-xl overflow-hidden relative">
          
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 text-primary rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Code Brain Analysis</h2>
                <p className="text-sm text-muted-foreground">AI-powered context recovery</p>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateSummary} 
              disabled={!selectedRepo || !commits?.length || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>Analyzing Context...</>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  What should I do next?
                </>
              )}
            </Button>
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
                  <h3 className="text-lg font-medium text-white mb-2">Engaging Code Brain...</h3>
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
                  Click the button above to generate a fresh summary of your recent work in <b>{selectedRepo.name}</b>.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
