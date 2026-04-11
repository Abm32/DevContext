import { Sparkles, Zap, X, CheckCircle2, AlertCircle, Loader2, Users, Crown } from "lucide-react"
import { useState } from "react"
import { useRazorpay } from "@/hooks/use-razorpay"
import type { PlanTier } from "@/hooks/use-plan"

type PaidPlan = Exclude<PlanTier, "free">

// ─── Tier metadata ─────────────────────────────────────────────────────────────
const TIER_META: Record<PaidPlan, {
  label: string
  price: string
  icon: React.ReactNode
  color: string
  bg: string
  border: string
  perks: string[]
}> = {
  plus: {
    label: "Plus",
    price: "₹499/mo",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
    perks: ["100 AI analyses/mo", "3 repos", "Compare mode"],
  },
  pro: {
    label: "Pro",
    price: "₹999/mo",
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.25)",
    perks: ["500 AI analyses/mo", "10 repos", "Standups + Workspaces"],
  },
  team: {
    label: "Team",
    price: "₹2,499/mo",
    icon: <Users className="w-3.5 h-3.5" />,
    color: "#34d399",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.22)",
    perks: ["2,000 AI analyses/mo", "Unlimited repos", "Up to 10 members (Coming Soon)"],
  },
}

// Available upgrade options above a given current plan
const TIERS_ABOVE: Record<PlanTier, PaidPlan[]> = {
  free: ["plus", "pro", "team"],
  plus: ["pro", "team"],
  pro: ["team"],
  team: [],
}

// ─── Single-plan checkout button ───────────────────────────────────────────────
function PlanButton({
  plan,
  onSuccess,
  onError,
}: {
  plan: PaidPlan
  onSuccess?: () => void
  onError?: (msg: string) => void
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const { openCheckout } = useRazorpay()
  const meta = TIER_META[plan]

  const handle = () => {
    setStatus("loading")
    openCheckout({
      plan,
      onSuccess: () => { setStatus("success"); onSuccess?.() },
      onError: (msg) => { setStatus("error"); onError?.(msg) },
      onDismiss: () => setStatus("idle"),
    })
  }

  if (status === "success") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
        style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        Upgraded to {meta.label}!
      </span>
    )
  }

  return (
    <button
      onClick={handle}
      disabled={status === "loading"}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-all disabled:opacity-60"
      style={{ background: `linear-gradient(135deg, ${meta.color}cc, ${meta.color}99)`, border: `1px solid ${meta.border}` }}
    >
      {status === "loading"
        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing…</>
        : <>{meta.icon}{meta.label} — {meta.price}</>}
    </button>
  )
}

// ─── UpgradePrompt (feature gate) ─────────────────────────────────────────────
interface UpgradePromptProps {
  feature: string
  description: string
  inline?: boolean
  currentPlan?: PlanTier
  onDismiss?: () => void
}

export function UpgradePrompt({
  feature, description, inline = false, currentPlan = "free", onDismiss,
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false)
  const [globalStatus, setGlobalStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const tiers = TIERS_ABOVE[currentPlan]

  if (dismissed) return null

  const onSuccess = () => { setGlobalStatus("success"); setTimeout(() => window.location.reload(), 1500) }
  const onError = (msg: string) => { setGlobalStatus("error"); setErrorMsg(msg) }

  if (globalStatus === "success") {
    const content = (
      <>
        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#10b981" }} />
        <p className="text-xs font-semibold" style={{ color: "#10b981" }}>
          You're upgraded! Reloading…
        </p>
      </>
    )
    return inline ? (
      <div className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
        {content}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <CheckCircle2 className="w-6 h-6" style={{ color: "#10b981" }} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white mb-1">You're upgraded!</h3>
          <p className="text-sm" style={{ color: "#64748b" }}>Reloading to apply changes…</p>
        </div>
      </div>
    )
  }

  if (inline) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(139,92,246,0.2)" }}>
          <Zap className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: "#a78bfa" }}>{feature} · Paid feature</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {tiers.map(t => <PlanButton key={t} plan={t} onSuccess={onSuccess} onError={onError} />)}
        </div>
        {globalStatus === "error" && <p className="text-[10px] text-red-400 ml-1">{errorMsg}</p>}
        {onDismiss && (
          <button onClick={() => { setDismissed(true); onDismiss?.() }}
            className="shrink-0 p-1 rounded hover:bg-white/5 transition-colors">
            <X className="w-3 h-3" style={{ color: "#475569" }} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-6 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
        <Sparkles className="w-6 h-6" style={{ color: "#a78bfa" }} />
      </div>
      <div>
        <h3 className="text-base font-bold text-white mb-1">{feature}</h3>
        <p className="text-sm" style={{ color: "#64748b" }}>{description}</p>
      </div>
      {globalStatus === "error" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          <p className="text-xs text-red-400">{errorMsg}</p>
        </div>
      )}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {tiers.map(t => {
          const meta = TIER_META[t]
          return (
            <div key={t} className="rounded-xl p-3 flex items-center justify-between gap-3"
              style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
              <div className="text-left">
                <p className="text-xs font-bold text-white">{meta.label}</p>
                <p className="text-[11px]" style={{ color: "#64748b" }}>{meta.perks.join(" · ")}</p>
              </div>
              <PlanButton plan={t} onSuccess={onSuccess} onError={onError} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Small usage counter chip ──────────────────────────────────────────────────
interface UsageChipProps {
  used: number
  limit: number
  exhausted: boolean
}

export function UsageChip({ used, limit, exhausted }: UsageChipProps) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
      style={{
        background: exhausted ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
        border: exhausted ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.08)",
        color: exhausted ? "#f87171" : "#64748b",
      }}
    >
      <Sparkles className="w-3 h-3" />
      <span>{used}/{limit} AI</span>
      {exhausted && <span className="font-semibold">· Upgrade</span>}
    </div>
  )
}

// ─── Standalone upgrade button ─────────────────────────────────────────────────
export function UpgradeButton({
  plan = "pro",
  className,
}: {
  plan?: PaidPlan
  className?: string
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const { openCheckout } = useRazorpay()
  const meta = TIER_META[plan]

  const handleUpgrade = () => {
    setStatus("loading")
    openCheckout({
      plan,
      onSuccess: () => { setStatus("success"); setTimeout(() => window.location.reload(), 1500) },
      onError: (msg) => { setStatus("error"); setErrorMsg(msg) },
      onDismiss: () => setStatus("idle"),
    })
  }

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${className ?? ""}`}
        style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        Upgraded to {meta.label}! Reloading…
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleUpgrade}
        disabled={status === "loading"}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70 ${className ?? ""}`}
        style={{ background: `linear-gradient(135deg, ${meta.color}dd, ${meta.color}99)`, boxShadow: `0 4px 16px ${meta.bg}` }}
      >
        {status === "loading"
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing…</>
          : <>{meta.icon}Upgrade to {meta.label} — {meta.price}</>}
      </button>
      {status === "error" && (
        <p className="text-[10px] text-red-400 max-w-[220px] text-right">{errorMsg}</p>
      )}
    </div>
  )
}

// ─── Crown icon for Team plan ──────────────────────────────────────────────────
export { Crown }
