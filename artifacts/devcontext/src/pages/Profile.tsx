import { useEffect } from "react"
import { useLocation } from "wouter"
import { motion } from "framer-motion"
import { useGetMe } from "@workspace/api-client-react"
import { usePlan } from "@/hooks/use-plan"
import { UpgradeButton } from "@/components/upgrade-prompt"
import { Header } from "@/components/layout/Header"
import {
  Github, ExternalLink, Zap, CheckCircle2, XCircle,
  BrainCircuit, GitBranch, Layers, ClipboardList, Bookmark,
  ArrowLeft, Sparkles, Crown,
} from "lucide-react"

// ─── Circular progress ring ───────────────────────────────────────────────────
function RingProgress({ used, limit, exhausted }: { used: number; limit: number | null; exhausted: boolean }) {
  const isUnlimited = limit === null
  const pct = isUnlimited ? 0 : Math.min(100, (used / (limit ?? 1)) * 100)
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = isUnlimited ? 0 : circ * (1 - pct / 100)
  const color = exhausted ? "#ef4444" : pct > 70 ? "#f59e0b" : "#3b82f6"

  return (
    <div className="relative inline-flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="7" stroke="rgba(255,255,255,0.06)" />
        {!isUnlimited && (
          <circle
            cx="48" cy="48" r={r}
            fill="none" strokeWidth="7"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dash}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        {isUnlimited ? (
          <span className="text-lg font-bold" style={{ color: "#10b981" }}>∞</span>
        ) : (
          <>
            <span className="text-lg font-bold leading-none" style={{ color }}>{used}</span>
            <span className="text-[10px] leading-none mt-0.5" style={{ color: "#475569" }}>/ {limit}</span>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({ label, enabled, icon }: { label: string; enabled: boolean; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <span style={{ color: enabled ? "#3b82f6" : "#334155" }}>{icon}</span>
      <span className="flex-1 text-sm" style={{ color: enabled ? "#e2e8f0" : "#475569" }}>{label}</span>
      {enabled
        ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#10b981" }} />
        : <XCircle className="w-4 h-4 shrink-0" style={{ color: "#334155" }} />}
    </div>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────
function PlanCard({ tier }: { tier: string }) {
  const isPro = tier === "pro" || tier === "team"
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={isPro
        ? { background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }
        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={isPro
          ? { background: "rgba(139,92,246,0.2)" }
          : { background: "rgba(255,255,255,0.05)" }}
      >
        {isPro
          ? <Crown className="w-6 h-6" style={{ color: "#a78bfa" }} />
          : <Sparkles className="w-6 h-6" style={{ color: "#475569" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base font-bold text-white">
            {isPro ? "Pro Plan" : "Free Plan"}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={isPro
              ? { background: "rgba(139,92,246,0.2)", color: "#a78bfa" }
              : { background: "rgba(255,255,255,0.05)", color: "#64748b" }}
          >
            {tier.toUpperCase()}
          </span>
        </div>
        <p className="text-sm" style={{ color: "#64748b" }}>
          {isPro
            ? "Unlimited AI · 3 repos · All features unlocked"
            : "10 AI analyses/month · 1 repo · Core features"}
        </p>
      </div>
      {isPro && (
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-white">₹999</p>
          <p className="text-[11px]" style={{ color: "#475569" }}>/month</p>
        </div>
      )}
    </div>
  )
}

// ─── Profile page ─────────────────────────────────────────────────────────────
export default function Profile() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading: isUserLoading, isError } = useGetMe({ query: { retry: false } })
  const { plan, features, usage, isFreeTier, isLoading: isPlanLoading } = usePlan()

  useEffect(() => {
    if (isError) setLocation("/")
  }, [isError, setLocation])

  if (isUserLoading || isPlanLoading) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const aiUsage = usage.ai_analyses

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: "#475569" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#e2e8f0")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#475569")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          {/* ── User card ── */}
          <div
            className="rounded-2xl p-6 flex items-center gap-5"
            style={{ background: "#131314", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-20 h-20 rounded-2xl border-2 shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            />
            <div className="flex-1 min-w-0">
              {user.name && (
                <h1 className="text-2xl font-bold text-white truncate"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {user.name}
                </h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Github className="w-3.5 h-3.5 shrink-0" style={{ color: "#475569" }} />
                <span className="text-sm font-mono" style={{ color: "#64748b" }}>@{user.login}</span>
                <a
                  href={user.html_url ?? `https://github.com/${user.login}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 transition-colors"
                  style={{ color: "#334155" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#3b82f6")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#334155")}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="shrink-0 hidden sm:block">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                style={!isFreeTier
                  ? { background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }
                  : { background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {!isFreeTier && <Zap className="w-3 h-3" />}
                {plan.toUpperCase()}
              </span>
            </div>
          </div>

          {/* ── Current plan ── */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
              Current Plan
            </h2>
            <PlanCard tier={plan} />
          </section>

          {/* ── Usage stats ── */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
              This Month's Usage
            </h2>
            <div
              className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
              style={{ background: "#131314", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <RingProgress
                used={aiUsage.used}
                limit={aiUsage.limit}
                exhausted={aiUsage.exhausted}
              />
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <BrainCircuit className="w-4 h-4" style={{ color: "#3b82f6" }} />
                  <span className="text-sm font-semibold text-white">AI Analyses</span>
                  {aiUsage.exhausted && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      Limit reached
                    </span>
                  )}
                </div>
                <p className="text-sm mb-4" style={{ color: "#475569" }}>
                  {aiUsage.limit === null
                    ? "Unlimited analyses — Pro plan"
                    : `${aiUsage.used} of ${aiUsage.limit} used this month`}
                </p>
                {/* Progress bar (only for limited plans) */}
                {aiUsage.limit !== null && (
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (aiUsage.used / aiUsage.limit) * 100)}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: aiUsage.exhausted
                          ? "#ef4444"
                          : aiUsage.used / aiUsage.limit > 0.7
                          ? "#f59e0b"
                          : "#3b82f6",
                      }}
                    />
                  </div>
                )}
                {aiUsage.limit !== null && (
                  <p className="text-[11px] mt-2" style={{ color: "#334155" }}>
                    Resets on the 1st of each month
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ── Features ── */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
              Features
            </h2>
            <div
              className="rounded-2xl px-5 py-1"
              style={{ background: "#131314", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <FeatureRow label="AI Commit Briefings" enabled icon={<BrainCircuit className="w-4 h-4" />} />
              <FeatureRow
                label={`Multi-repo Analysis (up to ${features.max_repos} repos)`}
                enabled={features.max_repos > 1}
                icon={<GitBranch className="w-4 h-4" />}
              />
              <FeatureRow
                label="Compare Mode — side-by-side repo analysis"
                enabled={features.compare_mode}
                icon={<Layers className="w-4 h-4" />}
              />
              <FeatureRow
                label="Standup Generator"
                enabled={features.standup_emails}
                icon={<ClipboardList className="w-4 h-4" />}
              />
              <FeatureRow
                label="Saved Workspaces"
                enabled={features.workspaces}
                icon={<Bookmark className="w-4 h-4" />}
              />
            </div>
          </section>

          {/* ── Upgrade section (Free only) ── */}
          {isFreeTier && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                Upgrade
              </h2>
              <div
                className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{
                  background: "rgba(139,92,246,0.05)",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">
                    Go Pro for ₹999/month
                  </h3>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Unlimited AI analyses · 3 repos · Compare mode · Workspaces · Standups
                  </p>
                </div>
                <UpgradeButton />
              </div>
            </motion.section>
          )}

          {/* ── Pro badge section (Pro only) ── */}
          {!isFreeTier && (
            <div
              className="rounded-2xl p-5 flex items-center gap-3"
              style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#10b981" }} />
              <div>
                <p className="text-sm font-semibold text-white">All Pro features active</p>
                <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                  You have unlimited access to all DevContext features.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
