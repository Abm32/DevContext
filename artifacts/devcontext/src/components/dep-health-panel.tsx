import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  PackageSearch,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  ArrowUpCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DepsReport, DepStaleness, DepStalenessSeverity } from "@workspace/api-client-react"

// ─── Severity config ─────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<DepStalenessSeverity, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ReactNode
}> = {
  major: {
    label: "Major",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  minor: {
    label: "Minor",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  patch: {
    label: "Patch",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: <ArrowUpCircle className="w-3 h-3" />,
  },
  ok: {
    label: "Up to date",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
}

const ECOSYSTEM_LABELS: Record<string, string> = {
  npm: "npm",
  pypi: "PyPI",
  cargo: "Cargo",
  rubygems: "RubyGems",
  go: "Go modules",
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: DepStalenessSeverity }) {
  const cfg = SEVERITY_CONFIG[severity]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${cfg.color} ${cfg.bgColor} ${cfg.borderColor}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

function DepRow({ dep }: { dep: DepStaleness }) {
  const cfg = SEVERITY_CONFIG[dep.severity]
  const isStale = dep.severity !== "ok"
  return (
    <div className={`flex items-center gap-2 py-2 px-3 rounded-lg ${isStale ? cfg.bgColor : ""} border ${isStale ? cfg.borderColor : "border-transparent"}`}>
      <span className="font-mono text-[11px] font-semibold text-white/90 shrink-0 min-w-0 truncate flex-1">
        {dep.name}
      </span>

      {/* Version diff */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-muted-foreground font-mono">{dep.current_version}</span>
        {dep.latest_version && dep.severity !== "ok" && (
          <>
            <span className="text-[10px] text-muted-foreground">→</span>
            <span className={`text-[10px] font-mono font-semibold ${cfg.color}`}>{dep.latest_version}</span>
          </>
        )}
      </div>

      {/* Context markers (from API fields) */}
      <div className="flex items-center gap-1 shrink-0">
        {dep.in_work_area && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded bg-violet-500/15 border border-violet-500/25 text-violet-300" title="This ecosystem matches the repo's primary language">
            <Wrench className="w-2.5 h-2.5" />
            work area
          </span>
        )}
        {dep.teammate_changed && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-300" title="A teammate recently changed the dependency manifest">
            <Users className="w-2.5 h-2.5" />
            changed
          </span>
        )}
      </div>

      <SeverityBadge severity={dep.severity} />

      <a
        href={dep.registry_url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-muted-foreground hover:text-white transition-colors"
        title={`Open ${dep.name} on registry`}
      >
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}

function SummaryBar({ summary, total }: { summary: DepsReport["summary"]; total: number }) {
  if (total === 0) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">All dependencies up to date</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {summary.major > 0 && (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-1.5 py-0.5">
          <AlertTriangle className="w-3 h-3" />
          {summary.major} major
        </span>
      )}
      {summary.minor > 0 && (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5">
          <AlertCircle className="w-3 h-3" />
          {summary.minor} minor
        </span>
      )}
      {summary.patch > 0 && (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md px-1.5 py-0.5">
          <ArrowUpCircle className="w-3 h-3" />
          {summary.patch} patch
        </span>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DepHealthPanelProps {
  report: DepsReport | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function DepHealthPanel({ report, isLoading, isError, refetch }: DepHealthPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [showOk, setShowOk] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    )
  }

  if (isError) {
    return null
  }

  if (!report) {
    return null
  }

  // No-manifest state: show graceful message
  if (!report.ecosystem) {
    return (
      <div className="bg-card border border-white/5 rounded-2xl p-3 flex items-center gap-3">
        <div className="p-1.5 bg-secondary/60 rounded-lg shrink-0">
          <PackageSearch className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">No dependency manifest detected</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            Supported: package.json, requirements.txt, Cargo.toml, go.mod, Gemfile
          </p>
        </div>
      </div>
    )
  }

  const staleDeps = report.deps.filter((d) => d.severity !== "ok")
  const okDeps = report.deps.filter((d) => d.severity === "ok")
  const ecosystemLabel = ECOSYSTEM_LABELS[report.ecosystem] ?? report.ecosystem

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-white/5 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="p-1.5 bg-violet-500/15 text-violet-400 rounded-lg shrink-0">
          <PackageSearch className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-white">Dependency Health</span>
            <span className="text-[10px] text-muted-foreground bg-secondary/60 border border-white/8 rounded px-1.5 py-0.5">
              {ecosystemLabel}
            </span>
            {report.manifest_file && (
              <span className="text-[10px] text-muted-foreground font-mono">
                {report.manifest_file}
              </span>
            )}
            {report.manifest_changed && (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5" title="The dependency manifest was recently modified in a commit">
                <Users className="w-3 h-3" />
                manifest changed
              </span>
            )}
          </div>
          <SummaryBar summary={report.summary} total={report.total_stale} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); refetch() }}
            className="p-1 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5"
            title="Refresh dependency data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Dep List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-3 space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
              {staleDeps.length === 0 && okDeps.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  No dependencies detected in {report.manifest_file ?? "manifest"}.
                </p>
              ) : staleDeps.length === 0 ? (
                <div className="flex items-center gap-2 py-3 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">All {okDeps.length} dependencies are up to date!</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {staleDeps.map((dep) => (
                    <DepRow key={dep.name} dep={dep} />
                  ))}
                </div>
              )}

              {okDeps.length > 0 && staleDeps.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowOk((v) => !v)}
                    className="text-[11px] text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                  >
                    {showOk ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {showOk ? "Hide" : "Show"} {okDeps.length} up-to-date
                  </button>
                  <AnimatePresence>
                    {showOk && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-1 space-y-1 overflow-hidden"
                      >
                        {okDeps.map((dep) => (
                          <DepRow key={dep.name} dep={dep} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {staleDeps.length > 0 && (
              <div className="px-4 pb-3 pt-1 border-t border-white/5">
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-white/60">{staleDeps.length}</span> of {report.deps.length} packages checked are outdated.
                  {report.total_stale > 0 && " Stale deps may appear in AI next-step suggestions."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
