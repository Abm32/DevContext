import { Sparkles, Zap, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { useRazorpay } from "@/hooks/use-razorpay"

interface UpgradePromptProps {
  feature: string
  description: string
  inline?: boolean
  onDismiss?: () => void
}

export function UpgradePrompt({ feature, description, inline = false, onDismiss }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const { openCheckout } = useRazorpay()

  if (dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleUpgrade = () => {
    setStatus("loading")
    setErrorMsg("")
    openCheckout({
      onSuccess: () => setStatus("success"),
      onError: (msg) => { setStatus("error"); setErrorMsg(msg) },
      onDismiss: () => setStatus("idle"),
    })
  }

  if (status === "success") {
    return inline ? (
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
      >
        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#10b981" }} />
        <p className="text-xs font-semibold" style={{ color: "#10b981" }}>
          You're now on Pro! Refresh to see all features unlocked.
        </p>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <CheckCircle2 className="w-6 h-6" style={{ color: "#10b981" }} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white mb-1">You're on Pro!</h3>
          <p className="text-sm" style={{ color: "#64748b" }}>All features are now unlocked. Refresh the page to see everything.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
        >
          Refresh now
        </button>
      </div>
    )
  }

  if (inline) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(139,92,246,0.2)" }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: "#a78bfa" }}>{feature} · Pro feature</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{description}</p>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={status === "loading"}
          className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all disabled:opacity-60 flex items-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
        >
          {status === "loading" ? <><Loader2 className="w-3 h-3 animate-spin" />Processing…</> : "Upgrade"}
        </button>
        {status === "error" && (
          <p className="text-[10px] text-red-400 ml-1">{errorMsg}</p>
        )}
        {onDismiss && (
          <button onClick={dismiss} className="shrink-0 p-1 rounded hover:bg-white/5 transition-colors">
            <X className="w-3 h-3" style={{ color: "#475569" }} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
      >
        <Sparkles className="w-6 h-6" style={{ color: "#a78bfa" }} />
      </div>
      <div>
        <h3 className="text-base font-bold text-white mb-1">{feature}</h3>
        <p className="text-sm" style={{ color: "#64748b" }}>{description}</p>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          <p className="text-xs text-red-400">{errorMsg}</p>
        </div>
      )}

      <button
        onClick={handleUpgrade}
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
        ) : (
          <><Zap className="w-4 h-4" />Upgrade to Pro — ₹999/mo</>
        )}
      </button>
      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
        Unlimited AI · Compare repos · Standups · Workspaces
      </p>
    </div>
  )
}

// ─── Small usage counter chip for free tier ───────────────────────────────────

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

// ─── Standalone upgrade button (used in dashboard header) ─────────────────────

export function UpgradeButton({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const { openCheckout } = useRazorpay()

  const handleUpgrade = () => {
    setStatus("loading")
    openCheckout({
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
        Upgraded! Reloading…
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleUpgrade}
        disabled={status === "loading"}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70 ${className ?? ""}`}
        style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}
      >
        {status === "loading" ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing…</>
        ) : (
          <><Zap className="w-3.5 h-3.5" />Upgrade for Unlimited AI</>
        )}
      </button>
      {status === "error" && (
        <p className="text-[10px] text-red-400 max-w-[200px] text-right">{errorMsg}</p>
      )}
    </div>
  )
}
