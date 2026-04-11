import { useEffect } from "react"
import { useLocation } from "wouter"
import { motion } from "framer-motion"
import { useGetMe } from "@workspace/api-client-react"
import { usePlan, type PlanTier } from "@/hooks/use-plan"
import { UpgradeButton } from "@/components/upgrade-prompt"
import { Header } from "@/components/layout/Header"
import {
  Github, ExternalLink, CheckCircle2, XCircle,
  BrainCircuit, GitBranch, Layers, ClipboardList, Bookmark,
  ArrowLeft, Crown, Zap, Sparkles, Users,
} from "lucide-react"

type PaidPlan = Exclude<PlanTier, "free">

// ─── Tier display config ───────────────────────────────────────────────────────
const TIER_CONFIG: Record<PlanTier, {
  label: string
  price: string
  description: string
  color: string
  bg: string
  border: string
  icon: React.ReactNode
}> = {
  free: {
    label: "Free Plan",
    price: "₹0",
    description: "10 AI analyses/month · 1 repo · Core features",
    color: "#64748b",
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)",
    icon: <Sparkles className="w-5 h-5" style={{ color: "#475569" }} />,
  },
  plus: {
    label: "Plus Plan",
    price: "₹499",
    description: "100 AI analyses/month · 3 repos · Compare mode",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.22)",
    icon: <Zap className="w-5 h-5" style={{ color: "#60a5fa" }} />,
  },
  pro: {
    label: "Pro Plan",
    price: "₹999",
    description: "500 AI analyses/month · Compare up to 10 repos · All features",
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.25)",
    icon: <Crown className="w-5 h-5" style={{ color: "#a78bfa" }} />,
  },
  team: {
    label: "Team Plan",
    price: "₹2,499",
    description: "2,000 AI analyses/month · Unlimited repos · Up to 10 members",
    color: "#34d399",
    bg: "rgba(16,185,129,0.06)",
    border: "rgba(16,185,129,0.18)",
    icon: <Users className="w-5 h-5" style={{ color: "#34d399" }} />,
  },
}

// ─── Circular progress ring ────────────────────────────────────────────────────
function RingProgress({ used, limit, exhausted }: { used: number; limit: number; exhausted: boolean }) {
  const pct = Math.min(100, (used / limit) * 100)
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - pct / 100)
  const color = exhausted ? "#ef4444" : pct > 70 ? "#f59e0b" : "#3b82f6"

  return (
    <div className="relative inline-flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="7" stroke="rgba(255,255,255,0.06)" />
        <circle
          cx="48" cy="48" r={r}
          fill="none" strokeWidth="7"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold leading-none" style={{ color }}>{used}</span>
        <span className="text-[10px] leading-none mt-0.5" style={{ color: "#475569" }}>/ {limit}</span>
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
function PlanCard({ tier }: { tier: PlanTier }) {
  const cfg = TIER_CONFIG[tier]
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${cfg.bg}`, border: `1px solid ${cfg.border}` }}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base font-bold text-white">{cfg.label}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {tier.toUpperCase()}
          </span>
        </div>
        <p className="text-sm" style={{ color: "#64748b" }}>{cfg.description}</p>
      </div>
      {tier !== "free" && (
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-white">{cfg.price}</p>
          <p className="text-[11px]" style={{ color: "#475569" }}>/month</p>
        </div>
      )}
    </div>
  )
}

const ALL_PAID_TIERS: PaidPlan[] = ["plus", "pro", "team"]

function UpgradeSection({ currentPlan }: { currentPlan: PlanTier }) {
  const availableTiers = ALL_PAID_TIERS.filter(t => {
    const order: Record<PlanTier, number> = { free: 0, plus: 1, pro: 2, team: 3 }
    return order[t] > order[currentPlan]
  })
  if (availableTiers.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
        Upgrade Your Plan
      </h2>
      <div className="flex flex-col gap-3">
        {availableTiers.map(tier => {
          const cfg = TIER_CONFIG[tier]
          return (
            <div
              key={tier}
              className="rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  {cfg.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white">{cfg.label}</span>
                    <span className="text-lg font-bold" style={{ color: cfg.color }}>{cfg.price}<span className="text-xs font-normal" style={{ color: "#475569" }}>/mo</span></span>
                  </div>
                  <p className="text-xs" style={{ color: "#64748b" }}>{cfg.description}</p>
                </div>
              </div>
              <UpgradeButton plan={tier} />
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}

// ─── Profile page ─────────────────────────────────────────────────────────────
export default function Profile() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading: isUserLoading, isError } = useGetMe({ query: { retry: false } })
  const { plan, features, usage, isTeam, isLoading: isPlanLoading } = usePlan()

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
  const cfg = TIER_CONFIG[plan]

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
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                {cfg.icon}
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
                  {aiUsage.used} of {aiUsage.limit} used this month
                </p>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (aiUsage.used / aiUsage.limit) * 100)}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: aiUsage.exhausted ? "#ef4444" : aiUsage.used / aiUsage.limit > 0.7 ? "#f59e0b" : "#3b82f6",
                    }}
                  />
                </div>
                <p className="text-[11px] mt-2" style={{ color: "#334155" }}>
                  Resets on the 1st of each month
                </p>
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
                label={`Multi-repo Analysis (up to ${features.max_repos >= 9999 ? "unlimited" : features.max_repos} repos)`}
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

          {/* ── Upgrade section (non-Team only) ── */}
          {!isTeam && <UpgradeSection currentPlan={plan} />}

          {/* ── Team confirmation ── */}
          {isTeam && (
            <div
              className="rounded-2xl p-5 flex items-center gap-3"
              style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#10b981" }} />
              <div>
                <p className="text-sm font-semibold text-white">Team plan active — all features unlocked</p>
                <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                  You have maximum access with 2,000 AI analyses/month, unlimited repos in compare, and up to 10 team members.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
