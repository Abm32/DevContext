import { useState } from "react"
import { useLocation } from "wouter"
import { motion } from "framer-motion"
import { useGetMe } from "@workspace/api-client-react"
import { usePlan, type PlanTier } from "@/hooks/use-plan"
import { useRazorpay } from "@/hooks/use-razorpay"
import { Header } from "@/components/layout/Header"
import {
  Sparkles, Zap, Users, Check, X, ArrowLeft,
  BrainCircuit, GitBranch, Layers, ClipboardList,
  Bookmark, Crown, Loader2, CheckCircle2, Shield,
} from "lucide-react"

type PaidPlan = Exclude<PlanTier, "free">

const TIERS: {
  id: PlanTier
  label: string
  price: string
  priceNum: number
  tagline: string
  color: string
  bg: string
  border: string
  gradient: string
  icon: React.ReactNode
  popular?: boolean
}[] = [
  {
    id: "free",
    label: "Free",
    price: "₹0",
    priceNum: 0,
    tagline: "Get started, no card needed",
    color: "#64748b",
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)",
    gradient: "linear-gradient(135deg, #334155, #1e293b)",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "plus",
    label: "Plus",
    price: "₹499",
    priceNum: 499,
    tagline: "For active developers",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.2)",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: "pro",
    label: "Pro",
    price: "₹999",
    priceNum: 999,
    tagline: "For power users & leads",
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.06)",
    border: "rgba(139,92,246,0.2)",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    icon: <Crown className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "team",
    label: "Team",
    price: "₹2,499",
    priceNum: 2499,
    tagline: "For engineering teams",
    color: "#34d399",
    bg: "rgba(16,185,129,0.06)",
    border: "rgba(16,185,129,0.18)",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    icon: <Users className="w-5 h-5" />,
  },
]

type FeatureRow = {
  label: string
  icon: React.ReactNode
  values: Record<PlanTier, string | boolean>
}

const FEATURES: FeatureRow[] = [
  {
    label: "AI Commit Briefings",
    icon: <BrainCircuit className="w-4 h-4" />,
    values: { free: "10/mo", plus: "100/mo", pro: "500/mo", team: "2,000/mo" },
  },
  {
    label: "Repositories",
    icon: <GitBranch className="w-4 h-4" />,
    values: { free: "1", plus: "3", pro: "10", team: "Unlimited" },
  },
  {
    label: "Compare Mode",
    icon: <Layers className="w-4 h-4" />,
    values: { free: false, plus: true, pro: true, team: true },
  },
  {
    label: "Standup Generator",
    icon: <ClipboardList className="w-4 h-4" />,
    values: { free: false, plus: false, pro: true, team: true },
  },
  {
    label: "Saved Workspaces",
    icon: <Bookmark className="w-4 h-4" />,
    values: { free: false, plus: false, pro: true, team: true },
  },
  {
    label: "Dependency Health",
    icon: <Shield className="w-4 h-4" />,
    values: { free: true, plus: true, pro: true, team: true },
  },
  {
    label: "Team Members",
    icon: <Users className="w-4 h-4" />,
    values: { free: "1", plus: "1", pro: "1", team: "Up to 10" },
  },
]

function CheckoutButton({ plan, currentPlan }: { plan: PlanTier; currentPlan: PlanTier }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const { openCheckout } = useRazorpay()
  const tierOrder: Record<PlanTier, number> = { free: 0, plus: 1, pro: 2, team: 3 }
  const tier = TIERS.find(t => t.id === plan)!

  if (plan === currentPlan) {
    return (
      <span
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        Current Plan
      </span>
    )
  }

  if (tierOrder[plan] < tierOrder[currentPlan]) {
    return null
  }

  if (plan === "free") return null

  if (status === "success") {
    return (
      <span
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}
      >
        <CheckCircle2 className="w-4 h-4" />
        Upgraded!
      </span>
    )
  }

  return (
    <button
      onClick={() => {
        setStatus("loading")
        openCheckout({
          plan: plan as PaidPlan,
          onSuccess: () => { setStatus("success"); setTimeout(() => window.location.reload(), 1500) },
          onError: () => setStatus("idle"),
          onDismiss: () => setStatus("idle"),
        })
      }}
      disabled={status === "loading"}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:brightness-110 active:scale-[0.98]"
      style={{ background: tier.gradient, boxShadow: `0 4px 20px ${tier.bg}` }}
    >
      {status === "loading"
        ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
        : <>Upgrade to {tier.label}</>}
    </button>
  )
}

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-4 h-4 mx-auto" style={{ color: "#10b981" }} />
    ) : (
      <X className="w-4 h-4 mx-auto" style={{ color: "#334155" }} />
    )
  }
  return <span className="text-sm font-medium text-white">{value}</span>
}

export default function Pricing() {
  const [, setLocation] = useLocation()
  const { data: user } = useGetMe({ query: { retry: false } })
  const { plan: currentPlan } = usePlan()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        {user && (
          <button
            onClick={() => setLocation("/profile")}
            className="flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: "#475569" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#e2e8f0")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#475569")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1
            className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Pick the plan that fits your flow
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: "#64748b" }}>
            Start free. Upgrade when you need more AI analyses, repos, or team features.
          </p>
        </motion.div>

        {/* ── Plan Cards (Mobile: stacked, Desktop: grid) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10 md:mb-16">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-2xl p-5 md:p-6 flex flex-col"
              style={{
                background: "#131314",
                border: tier.popular
                  ? `2px solid ${tier.border}`
                  : `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              {tier.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: tier.gradient, color: "#fff" }}
                >
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: tier.bg, border: `1px solid ${tier.border}` }}
                >
                  <span style={{ color: tier.color }}>{tier.icon}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{tier.label}</h3>
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl md:text-4xl font-bold text-white">{tier.price}</span>
                {tier.priceNum > 0 && (
                  <span className="text-sm" style={{ color: "#475569" }}>/month</span>
                )}
              </div>
              <p className="text-xs mb-5" style={{ color: "#64748b" }}>{tier.tagline}</p>

              <div className="flex-1 flex flex-col gap-2.5 mb-5">
                {FEATURES.map(feat => {
                  const val = feat.values[tier.id]
                  if (val === false) return null
                  return (
                    <div key={feat.label} className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: tier.color }} />
                      <span className="text-xs" style={{ color: "#94a3b8" }}>
                        {typeof val === "string" ? `${feat.label}: ${val}` : feat.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              <CheckoutButton plan={tier.id} currentPlan={currentPlan} />
            </motion.div>
          ))}
        </div>

        {/* ── Comparison Table (Desktop) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="hidden md:block"
        >
          <h2
            className="text-xl font-bold text-white text-center mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Compare all features
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#131314", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
                    Feature
                  </th>
                  {TIERS.map(tier => (
                    <th key={tier.id} className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span style={{ color: tier.color }}>{tier.icon}</span>
                        <span className="text-sm font-bold text-white">{tier.label}</span>
                        <span className="text-xs" style={{ color: "#475569" }}>{tier.price}/mo</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feat, i) => (
                  <tr
                    key={feat.label}
                    style={{
                      borderBottom: i < FEATURES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <td className="px-6 py-3.5 text-sm flex items-center gap-2.5" style={{ color: "#94a3b8" }}>
                      <span style={{ color: "#475569" }}>{feat.icon}</span>
                      {feat.label}
                    </td>
                    {TIERS.map(tier => (
                      <td key={tier.id} className="px-4 py-3.5 text-center">
                        <FeatureValue value={feat.values[tier.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td className="px-6 py-4" />
                  {TIERS.map(tier => (
                    <td key={tier.id} className="px-4 py-4">
                      <CheckoutButton plan={tier.id} currentPlan={currentPlan} />
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>

        {/* ── Mobile Comparison (accordion-style) ── */}
        <div className="md:hidden">
          <h2
            className="text-lg font-bold text-white text-center mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Feature comparison
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#131314", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {FEATURES.map((feat, i) => (
              <div
                key={feat.label}
                className="px-4 py-3"
                style={{ borderBottom: i < FEATURES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: "#475569" }}>{feat.icon}</span>
                  <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{feat.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {TIERS.map(tier => (
                    <div key={tier.id} className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-semibold" style={{ color: tier.color }}>{tier.label}</span>
                      <span className="text-xs text-center">
                        <FeatureValue value={feat.values[tier.id]} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 md:mt-12 pb-8">
          <p className="text-xs" style={{ color: "#334155" }}>
            All plans include SSL, 99.9% uptime, and priority support. Cancel anytime.
          </p>
        </div>
      </main>
    </div>
  )
}
