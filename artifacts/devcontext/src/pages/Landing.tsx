import { useEffect, useState, useRef } from "react"
import { useLocation } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import {
  Github, Zap, CheckCircle2, ArrowRight, GitBranch, FileText,
  Layers, Brain, Monitor, Sparkles, ShieldCheck,
  Cloud, Code2, Database, CreditCard, Play, RotateCcw, GitCommit, Plus,
  Minus, ChevronRight,
} from "lucide-react"
import { useGetMe } from "@workspace/api-client-react"
import { track } from "@/hooks/use-track"

// ─── Commit Mock-up (desktop) ─────────────────────────────────────────────────
function CommitMockup() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "#131314",
        boxShadow: "0 40px 80px 0 rgba(0,46,106,0.18), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3.5" style={{ background: "#1a1a1c" }}>
        <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="ml-3 text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}>
          devcontext-analysis.md
        </span>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-md shrink-0 mt-0.5"
            style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}
          >
            <GitBranch className="w-3 h-3" />
            COMMIT ANALYSIS
          </span>
          <span className="text-sm font-mono font-medium" style={{ color: "#e2e8f0" }}>
            fix/auth-middleware-v2
          </span>
        </div>
        <div className="rounded-lg p-3.5 flex flex-col gap-2" style={{ background: "#0d0d0f" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
            Summary
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
            Transitioned from JWT local storage to HttpOnly cookies to mitigate XSS risks in the dashboard subroute.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Impacted Files:
          </p>
          <div className="flex flex-col gap-1.5">
            {["src/middleware/auth.ts", "api/v1/login.go"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <FileText className="w-3 h-3 shrink-0" style={{ color: "#60a5fa" }} />
                <span className="text-xs font-mono" style={{ color: "#94a3b8" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="rounded-lg p-3" style={{ background: "#0d0d0f" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
              Smart Next Steps
            </p>
            <div className="flex flex-col gap-1.5">
              {["Update CORS policy", "Verify refresh logic"].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span style={{ color: "#3b82f6" }} className="text-xs">+</span>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ background: "#0d0d0f" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
              Status
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
              <span className="text-xs" style={{ color: "#10b981" }}>Context Rebuilt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Bento Card (desktop) ─────────────────────────────────────────────────────
function BentoCard({
  icon, title, description, accent, children, className = "",
}: {
  icon?: React.ReactNode; title?: string; description?: string
  accent?: string; children?: React.ReactNode; className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`rounded-2xl p-6 flex flex-col ${className}`}
      style={{ background: "#131314", boxShadow: "0 0 0 1px rgba(255,255,255,0.05)" }}
    >
      {icon && (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
          style={{ background: accent ? `${accent}18` : "rgba(255,255,255,0.05)" }}
        >
          {icon}
        </div>
      )}
      {title && (
        <h3 className="font-semibold text-white mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.0625rem" }}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{description}</p>
      )}
      {children}
    </motion.div>
  )
}

// ─── Mobile Feature Card ──────────────────────────────────────────────────────
function MobileFeatureCard({
  icon, title, description, children,
}: {
  icon: React.ReactNode; title: string; description: string; children?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: "#131314" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.05)" }}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white text-base mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{description}</p>
      </div>
      {children}
    </motion.div>
  )
}

// ─── Interactive Demo ─────────────────────────────────────────────────────────
const DEMO_COMMITS = [
  {
    sha: "a1b2c3d",
    message: "feat: add Stripe webhook handler for subscription events",
    ago: "2h ago",
    files: [
      { name: "src/webhooks/stripe.ts", add: 142, del: 0 },
      { name: "src/routes/billing.ts", add: 28, del: 5 },
    ],
  },
  {
    sha: "e4f5g6h",
    message: "fix: race condition in auth token refresh flow",
    ago: "6h ago",
    files: [
      { name: "src/middleware/auth.ts", add: 18, del: 6 },
      { name: "src/utils/token.ts", add: 4, del: 2 },
    ],
  },
  {
    sha: "i7j8k9l",
    message: "refactor: extract PaymentService into standalone module",
    ago: "1d ago",
    files: [
      { name: "src/services/payment.ts", add: 89, del: 0 },
      { name: "src/api/checkout.ts", add: 12, del: 67 },
    ],
  },
]

const DEMO_NEXT_STEPS = `You've been hardening the payments pipeline and auth layer. Here's where to pick up:

→ Wire the webhook handler to your subscription state machine
→ Add idempotency keys to prevent duplicate Stripe event processing  
→ Write integration tests for the token refresh race condition fix
→ Update CORS policy to allow Stripe webhook origin in staging`

const DEMO_STANDUP = `Yesterday: Added a Stripe webhook handler for subscription events, fixed a race condition in the auth token refresh flow, and extracted PaymentService into its own module.

Today: Wire webhooks into the subscription state machine and add idempotency key handling.

Blockers: None — the payment module is cleanly isolated and ready to extend.`

function InteractiveDemo({ onConnect }: { onConnect: (el: string) => void }) {
  type Phase = "idle" | "loading" | "done"
  const [phase, setPhase] = useState<Phase>("idle")
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<"next_steps" | "standup">("next_steps")
  const [displayed, setDisplayed] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fullText = mode === "next_steps" ? DEMO_NEXT_STEPS : DEMO_STANDUP

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const runDemo = () => {
    clearTimers()
    setPhase("loading")
    setProgress(0)
    setDisplayed("")

    // Animate progress bar from 0 → 100 over ~1.6s
    let p = 0
    const tick = () => {
      p += p < 70 ? 8 : p < 90 ? 3 : 1
      if (p >= 100) {
        setProgress(100)
        timerRef.current = setTimeout(() => {
          setPhase("done")
          setDisplayed("")
        }, 250)
      } else {
        setProgress(p)
        timerRef.current = setTimeout(tick, 60)
      }
    }
    timerRef.current = setTimeout(tick, 60)
  }

  // Typewriter when phase transitions to done
  useEffect(() => {
    if (phase !== "done") return
    setDisplayed("")
    let i = 0
    const TYPE_SPEED = 18
    const type = () => {
      if (i <= fullText.length) {
        setDisplayed(fullText.slice(0, i))
        i++
        timerRef.current = setTimeout(type, TYPE_SPEED)
      }
    }
    timerRef.current = setTimeout(type, 120)
    return clearTimers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Restart typewriter when mode tab changes (during done phase)
  useEffect(() => {
    if (phase !== "done") return
    clearTimers()
    setDisplayed("")
    let i = 0
    const TYPE_SPEED = 14
    const type = () => {
      if (i <= fullText.length) {
        setDisplayed(fullText.slice(0, i))
        i++
        timerRef.current = setTimeout(type, TYPE_SPEED)
      }
    }
    timerRef.current = setTimeout(type, 80)
    return clearTimers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const reset = () => {
    clearTimers()
    setPhase("idle")
    setProgress(0)
    setDisplayed("")
  }

  useEffect(() => () => clearTimers(), [])

  return (
    <section className="px-6 md:px-12 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <Play className="w-3 h-3" style={{ color: "#8b5cf6" }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#8b5cf6" }}>
              Live Demo
            </span>
          </div>
          <h2 className="font-bold mb-3"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
              letterSpacing: "-0.02em",
              color: "#f1f5f9",
            }}>
            See it in action — no login required
          </h2>
          <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "#64748b" }}>
            Click Generate to watch DevContext analyse a real commit history and produce an AI briefing, right here.
          </p>
        </motion.div>

        {/* Demo panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#131314",
            boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* Toolbar bar */}
          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ background: "#1a1a1c", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg"
              style={{ background: "#0d0d0f" }}>
              <GitBranch className="w-3 h-3" style={{ color: "#3b82f6" }} />
              <span className="text-xs font-mono" style={{ color: "#94a3b8" }}>acme / my-saas-app</span>
              <ChevronRight className="w-3 h-3" style={{ color: "#334155" }} />
              <span className="text-xs font-mono" style={{ color: "#64748b" }}>main</span>
            </div>
            <div className="flex items-center gap-2">
              {phase === "done" && (
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                  style={{ color: "#64748b", background: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#e2e8f0")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {/* Left: Commits */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.25)" }}>
                  Recent Commits · 3 selected
                </span>
                <span className="text-[10px]" style={{ color: "#3b82f6" }}>branch: main</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {DEMO_COMMITS.map((commit) => (
                  <div
                    key={commit.sha}
                    className="rounded-xl p-3.5"
                    style={{
                      background: "#0d0d0f",
                      border: "1px solid rgba(59,130,246,0.18)",
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ background: "rgba(59,130,246,0.15)" }}>
                        <GitCommit className="w-3 h-3" style={{ color: "#3b82f6" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white leading-snug mb-1.5 font-medium">
                          {commit.message}
                        </p>
                        <div className="flex flex-col gap-1">
                          {commit.files.map(f => (
                            <div key={f.name} className="flex items-center gap-2">
                              <FileText className="w-2.5 h-2.5 shrink-0" style={{ color: "#475569" }} />
                              <span className="text-[10px] font-mono truncate" style={{ color: "#475569" }}>
                                {f.name}
                              </span>
                              <div className="flex items-center gap-1 ml-auto shrink-0">
                                <span className="text-[10px] flex items-center gap-0.5" style={{ color: "#10b981" }}>
                                  <Plus className="w-2 h-2" />{f.add}
                                </span>
                                {f.del > 0 && (
                                  <span className="text-[10px] flex items-center gap-0.5" style={{ color: "#f87171" }}>
                                    <Minus className="w-2 h-2" />{f.del}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "#334155" }}>
                        {commit.ago}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generate button */}
              <button
                onClick={phase === "idle" ? runDemo : undefined}
                disabled={phase === "loading" || phase === "done"}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: phase === "idle"
                    ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
                    : phase === "done"
                    ? "rgba(139,92,246,0.1)"
                    : "rgba(139,92,246,0.15)",
                  color: phase === "done" ? "#64748b" : "#ffffff",
                  boxShadow: phase === "idle" ? "0 4px 20px rgba(139,92,246,0.3)" : "none",
                  cursor: phase === "idle" ? "pointer" : "default",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {phase === "idle" && <><Sparkles className="w-4 h-4" /> Generate Analysis</>}
                {phase === "loading" && <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing commits…</>}
                {phase === "done" && <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Analysis complete</>}
              </button>
            </div>

            {/* Right: AI Output */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.25)" }}>
                  AI Analysis
                </span>
                {/* Mode toggle — only active after done */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg"
                  style={{ background: "#0d0d0f" }}>
                  {(["next_steps", "standup"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => phase === "done" && setMode(m)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors"
                      style={{
                        background: mode === m && phase === "done" ? "rgba(139,92,246,0.2)" : "transparent",
                        color: mode === m && phase === "done" ? "#a78bfa" : "#334155",
                        cursor: phase === "done" ? "pointer" : "default",
                      }}
                    >
                      {m === "next_steps" ? "Next Steps" : "Standup"}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {phase === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center gap-4 py-12"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.15)" }}>
                      <Brain className="w-7 h-7" style={{ color: "#8b5cf6" }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white mb-1">Ready to analyse</p>
                      <p className="text-xs" style={{ color: "#475569" }}>Hit Generate to see what DevContext produces</p>
                    </div>
                  </motion.div>
                )}

                {phase === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col gap-5 justify-center py-8"
                  >
                    {[
                      { label: "Fetching diffs", done: progress > 25 },
                      { label: "Building context graph", done: progress > 55 },
                      { label: "Running AI model", done: progress > 80 },
                      { label: "Formatting output", done: progress > 95 },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: step.done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${step.done ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
                          }}>
                          {step.done
                            ? <CheckCircle2 className="w-3 h-3" style={{ color: "#10b981" }} />
                            : <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#334155" }} />
                          }
                        </div>
                        <span className="text-xs" style={{ color: step.done ? "#94a3b8" : "#334155" }}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "#334155" }}>
                        <span>Analysing 3 commits</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="rounded-full h-1.5 overflow-hidden" style={{ background: "#1e293b" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #8b5cf6, #3b82f6)", width: `${progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {phase === "done" && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col gap-3"
                  >
                    {/* Header chip */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                        <Sparkles className="w-3 h-3" style={{ color: "#a78bfa" }} />
                        <span className="text-[10px] font-semibold" style={{ color: "#a78bfa" }}>
                          {mode === "next_steps" ? "Next Steps" : "Standup Update"}
                        </span>
                      </div>
                      <span className="text-[10px]" style={{ color: "#334155" }}>acme/my-saas-app · main</span>
                    </div>

                    {/* Output text */}
                    <div className="rounded-xl p-4 flex-1 min-h-[200px]"
                      style={{ background: "#0d0d0f", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans"
                        style={{ color: "#cbd5e1", fontFamily: "'Inter', sans-serif" }}>
                        {displayed}
                        <span
                          className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse"
                          style={{
                            background: "#8b5cf6",
                            opacity: displayed.length < fullText.length ? 1 : 0,
                          }}
                        />
                      </pre>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => onConnect("demo_cta")}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <Github className="w-4 h-4" />
                      Connect Your Repo — It's Free
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Mobile Landing ───────────────────────────────────────────────────────────
function MobileLanding({ onConnect }: { onConnect: (el: string) => void }) {
  const brands = [
    { icon: <Cloud className="w-4 h-4" />, name: "AWS" },
    { icon: <Code2 className="w-4 h-4" />, name: "Vercel" },
    { icon: <Database className="w-4 h-4" />, name: "Supabase" },
    { icon: <CreditCard className="w-4 h-4" />, name: "Stripe" },
  ]

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#0A0A0B", color: "#e2e8f0" }}>
      {/* Mobile Nav */}
      <nav className="flex items-center justify-between px-5 h-14 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="DevContext" className="w-7 h-7 rounded-lg object-cover" />
          <span className="font-bold text-sm" style={{ color: "#3b82f6", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            DevContext
          </span>
        </div>
        <button
          onClick={() => onConnect("mobile_nav_signin")}
          className="text-sm font-semibold px-4 py-1.5 rounded-xl"
          style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          Sign In
        </button>
      </nav>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mt-7 mb-6"
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#10b981" }}>
              System Online
            </span>
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 mb-8"
        >
          <h1
            className="font-extrabold leading-[1.1]"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "2.5rem",
              letterSpacing: "-0.03em",
              color: "#f1f5f9",
            }}
          >
            Resume your{" "}
            <span style={{
              background: "linear-gradient(135deg, #3b82f6 20%, #8b5cf6 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              code brain
            </span>{" "}
            in seconds.
          </h1>

          <p className="text-sm leading-relaxed text-center" style={{ color: "#64748b" }}>
            Stop spending 30 minutes remembering where you left off. DevContext reconstructs your mental model instantly.
          </p>

          {/* CTA */}
          <button
            onClick={() => onConnect("mobile_hero_cta")}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-semibold text-sm text-white mt-2"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              boxShadow: "0 4px 24px rgba(59,130,246,0.35)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Github className="w-4 h-4" />
            Connect GitHub to Start
          </button>
          <p className="text-center text-[11px] uppercase tracking-widest font-semibold"
            style={{ color: "rgba(255,255,255,0.2)" }}>
            No Credit Card Required
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="flex flex-col gap-4 mb-10">
          <MobileFeatureCard
            icon={<Layers className="w-5 h-5" style={{ color: "#3b82f6" }} />}
            title="Context Rebuilt"
            description="Every branch, every PR, and every local change indexed into a coherent story of your current task."
          />

          <MobileFeatureCard
            icon={<Sparkles className="w-5 h-5" style={{ color: "#8b5cf6" }} />}
            title="AI Summaries"
            description="Natural language summaries of complex diffs so you can explain your progress in seconds."
          >
            {/* Mini progress element */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#3b82f6" }} />
                <div className="flex-1 rounded-full h-1.5" style={{ background: "#1e293b" }}>
                  <div className="h-full rounded-full" style={{ background: "#3b82f6", width: "72%" }} />
                </div>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: "#0d0d0f" }}>
                <p className="text-xs font-mono" style={{ color: "#64748b" }}>
                  <span style={{ color: "#60a5fa" }}>feat:</span> oauth2 flow unified across services
                </p>
              </div>
            </div>
          </MobileFeatureCard>

          <MobileFeatureCard
            icon={<Zap className="w-5 h-5" style={{ color: "#f59e0b" }} />}
            title="Smart Next Steps"
            description="Intelligent suggestions for your next 3 moves based on your current project velocity and blockages."
          />
        </div>

        {/* Trusted by */}
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-center mb-5"
            style={{ color: "rgba(255,255,255,0.2)" }}>
            Trusted by Individual Contributors at
          </p>
          <div className="grid grid-cols-2 gap-3">
            {brands.map((b) => (
              <div
                key={b.name}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: "#131314" }}
              >
                <span style={{ color: "#475569" }}>{b.icon}</span>
                <span className="text-sm font-semibold" style={{ color: "#64748b" }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-5 flex flex-col gap-3 mb-4"
          style={{ background: "#131314" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.12)" }}>
              <ShieldCheck className="w-5 h-5" style={{ color: "#10b981" }} />
            </div>
            <h3 className="font-semibold text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Bank-Grade Privacy
            </h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            We never store your source code. Our engine processes all metadata via a secure tunnel, ensuring your IP stays where it belongs.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer
        className="px-4 py-6 flex flex-col items-center gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span className="font-extrabold text-xs tracking-widest text-white"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          DEVCONTEXT
        </span>
        <p className="text-[11px] text-center" style={{ color: "#334155" }}>
          The intelligence layer for complex engineering.
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
            Free to Use
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ background: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid rgba(255,255,255,0.07)" }}>
            No Credit Card
          </span>
        </div>
      </footer>
    </div>
  )
}

// ─── Pricing CTA button (landing page — users always unauthenticated here) ────
function PricingCTAButton({
  plan,
  color,
  popular,
}: {
  plan: "plus" | "pro" | "team"
  color: string
  popular: boolean
}) {
  const LABELS = { plus: "Start with Plus", pro: "Get Pro", team: "Start with Team" }
  const bg = popular
    ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
    : `linear-gradient(135deg, ${color}bb, ${color}66)`

  return (
    <button
      onClick={() => {
        void track("click:pricing_cta", { metadata: { plan } })
        // Persist plan intent so Dashboard can auto-launch checkout after OAuth
        localStorage.setItem("devcontext_pending_plan", plan)
        window.location.href = "/api/auth/github"
      }}
      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
      style={{ background: bg, boxShadow: popular ? "0 4px 16px rgba(139,92,246,0.3)" : "none" }}
    >
      {LABELS[plan]}
    </button>
  )
}

// ─── Landing (root) ───────────────────────────────────────────────────────────
export default function Landing() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading } = useGetMe({ query: { retry: false } })

  useEffect(() => { void track("page_view", { page: "/" }) }, [])

  useEffect(() => {
    if (user && !isLoading) setLocation("/dashboard")
  }, [user, isLoading, setLocation])

  if (isLoading) return null

  const handleConnect = (element: string) => {
    void track("click:connect_github", { element })
    window.location.href = "/api/auth/github"
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE  (hidden on md+)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        <MobileLanding onConnect={handleConnect} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP  (hidden below md)  — UNCHANGED
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden md:flex flex-col min-h-screen"
        style={{ background: "#0A0A0B", color: "#e2e8f0" }}
      >
        {/* ── Nav ── */}
        <nav
          className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
          style={{
            background: "rgba(10,10,11,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <img src="/images/logo.png" alt="DevContext" className="w-7 h-7 rounded-lg object-cover" />
              <span
                className="font-extrabold tracking-tight text-white text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.08em" }}
              >
                DEVCONTEXT
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {["Product", "Features", "Security"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs font-medium transition-colors"
                  style={{ color: "#64748b", letterSpacing: "0.02em" }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = "#e2e8f0")}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = "#64748b")}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleConnect("nav_signin")}
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors"
              style={{ color: "#94a3b8", background: "transparent" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#94a3b8")}
            >
              Sign In
            </button>
            <button
              onClick={() => handleConnect("nav_cta")}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 0 20px rgba(59,130,246,0.25)",
              }}
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="flex-1 flex items-center px-6 md:px-12 pt-16 pb-12 md:pb-20">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex items-center gap-2 self-start">
                <span
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(59,130,246,0.12)",
                    color: "#60a5fa",
                    border: "1px solid rgba(59,130,246,0.25)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <Zap className="w-3 h-3" />
                  AI Powered Analysis
                </span>
              </div>

              <h1
                className="leading-[1.08] font-extrabold"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(2.6rem, 5vw, 3.75rem)",
                  letterSpacing: "-0.03em",
                  color: "#f1f5f9",
                }}
              >
                Resume your{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 20%, #8b5cf6 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  code brain
                </span>{" "}
                in seconds.
              </h1>

              <p className="text-base leading-relaxed max-w-md" style={{ color: "#64748b", fontFamily: "'Inter', sans-serif" }}>
                DevContext reconstructs the mental model of your codebase using deep commit analysis and semantic mapping. Stop wasting hours remembering where you left off.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <button
                  onClick={() => handleConnect("hero_cta")}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    boxShadow: "0 4px 24px rgba(59,130,246,0.30)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <Github className="w-4 h-4" />
                  Connect GitHub to Start
                </button>
                <button
                  onClick={() => handleConnect("hero_secondary")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    color: "#94a3b8",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#94a3b8")}
                >
                  See it in Action
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 mt-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif" }}
                >
                  Secure GitHub OAuth Scopes
                </span>
                <div className="flex flex-wrap gap-3">
                  {["Profile Access", "Repository Metadata", "Organization Read"].map((scope) => (
                    <div key={scope} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                      <span className="text-xs" style={{ color: "#64748b", fontFamily: "'Inter', sans-serif" }}>
                        {scope}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="w-full max-w-lg mx-auto md:mx-0"
            >
              <CommitMockup />
            </motion.div>
          </div>
        </section>

        {/* ── Interactive Demo ── */}
        <InteractiveDemo onConnect={handleConnect} />

        {/* ── Engineered for Focus ── */}
        <section className="px-6 md:px-12 pb-20 pt-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className="font-bold mb-3"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                  letterSpacing: "-0.02em",
                  color: "#f1f5f9",
                }}
              >
                Engineered for Focus
              </h2>
              <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "#64748b" }}>
                Skip the "wait, what was I doing?" phase. Get instant architectural clarity before you type a single line of code.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BentoCard
                icon={<Layers className="w-4 h-4" style={{ color: "#3b82f6" }} />}
                title="Context Rebuilt"
                description="Our engine crawls your recent branches, PRs, and tickets to build a dynamic knowledge graph of your current workspace status."
                accent="#3b82f6"
                className="md:row-span-1"
              />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl overflow-hidden relative min-h-[220px]"
                style={{
                  background: "linear-gradient(135deg, #0d1117 0%, #0a0e1a 100%)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <svg width="100%" height="100%" viewBox="0 0 400 280" className="opacity-60">
                    <defs>
                      <radialGradient id="meshGrad" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0a0a0b" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <ellipse cx="200" cy="140" rx="180" ry="120" fill="url(#meshGrad)" />
                    {Array.from({ length: 18 }).map((_, i) => {
                      const x1 = 60 + (i % 6) * 60; const y1 = 40 + Math.floor(i / 6) * 90
                      const x2 = 80 + ((i + 3) % 6) * 60; const y2 = 40 + Math.floor((i + 2) / 6) * 90
                      return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke={i % 2 === 0 ? "#10b981" : "#3b82f6"} strokeOpacity="0.25" strokeWidth="1" />
                      )
                    })}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <circle key={i} cx={80 + (i % 4) * 80} cy={60 + Math.floor(i / 4) * 80}
                        r="3" fill={i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#3b82f6" : "#8b5cf6"}
                        fillOpacity="0.7" />
                    ))}
                  </svg>
                </div>
              </motion.div>

              <BentoCard
                icon={<Brain className="w-4 h-4" style={{ color: "#8b5cf6" }} />}
                title="AI Summaries"
                description="Human-readable briefings on what changed while you were away, across all repositories and teams."
                accent="#8b5cf6"
              />

              <BentoCard
                icon={<Zap className="w-4 h-4" style={{ color: "#f59e0b" }} />}
                title="Smart Next Steps"
                description="DevContext predicts your next logical task and pre-fetches relevant documentation and code snippets."
                accent="#f59e0b"
              />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="md:col-span-2 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
                style={{ background: "#131314", boxShadow: "0 0 0 1px rgba(255,255,255,0.05)" }}
              >
                <div className="flex-1">
                  <h3
                    className="font-semibold text-white mb-2"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.0625rem" }}
                  >
                    Semantic Search Layer
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                    Search your repository by intent, not just keywords. "Where do we handle payment retries?" actually finds the logic.
                  </p>
                </div>
                <div
                  className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.1)" }}
                >
                  <span className="font-mono text-xl font-bold" style={{ color: "#10b981" }}>&gt;_</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="px-6 md:px-12 pb-24 pt-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className="font-bold mb-3"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                  letterSpacing: "-0.02em",
                  color: "#f1f5f9",
                }}
              >
                Simple, Transparent Pricing
              </h2>
              <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "#64748b" }}>
                Start free. Upgrade as your team grows.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ── Free ── */}
              {[
                {
                  tier: "free",
                  label: "Free",
                  price: "₹0",
                  period: "forever",
                  tagline: "For solo exploration",
                  color: "#64748b",
                  bg: "rgba(255,255,255,0.03)",
                  border: "rgba(255,255,255,0.07)",
                  cta: null,
                  popular: false,
                  features: [
                    "10 AI analyses / month",
                    "1 repository",
                    "Commit briefings",
                    "7-day sessions",
                  ],
                  missing: ["Compare mode", "Standups", "Workspaces"],
                },
                {
                  tier: "plus",
                  label: "Plus",
                  price: "₹499",
                  period: "/ month",
                  tagline: "For active developers",
                  color: "#60a5fa",
                  bg: "rgba(59,130,246,0.06)",
                  border: "rgba(59,130,246,0.2)",
                  cta: "plus" as const,
                  popular: false,
                  features: [
                    "100 AI analyses / month",
                    "3 repositories",
                    "Commit briefings",
                    "Compare mode",
                  ],
                  missing: ["Standups", "Workspaces"],
                },
                {
                  tier: "pro",
                  label: "Pro",
                  price: "₹999",
                  period: "/ month",
                  tagline: "For power users",
                  color: "#a78bfa",
                  bg: "rgba(139,92,246,0.08)",
                  border: "rgba(139,92,246,0.3)",
                  cta: "pro" as const,
                  popular: true,
                  features: [
                    "500 AI analyses / month",
                    "Compare up to 10 repos",
                    "Standup generator",
                    "Saved workspaces",
                    "Dependency health",
                  ],
                  missing: [],
                },
                {
                  tier: "team",
                  label: "Team",
                  price: "₹2,499",
                  period: "/ month",
                  tagline: "For engineering teams",
                  color: "#34d399",
                  bg: "rgba(16,185,129,0.05)",
                  border: "rgba(16,185,129,0.18)",
                  cta: "team" as const,
                  popular: false,
                  features: [
                    "2,000 AI analyses / month",
                    "Compare up to 10 repos",
                    "Up to 10 team members",
                    "Standup generator",
                    "Saved workspaces",
                    "Dependency health",
                  ],
                  missing: [],
                },
              ].map((plan, i) => (
                <motion.div
                  key={plan.tier}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="relative flex flex-col rounded-2xl p-6"
                  style={{
                    background: plan.popular ? "rgba(139,92,246,0.1)" : plan.bg,
                    border: `1px solid ${plan.popular ? "rgba(139,92,246,0.4)" : plan.border}`,
                    boxShadow: plan.popular ? "0 0 40px rgba(139,92,246,0.12)" : "none",
                  }}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: "#8b5cf6", color: "#fff" }}
                    >
                      Most Popular
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: plan.color }}>{plan.label}</p>
                    <div className="flex items-end gap-1.5">
                      <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {plan.price}
                      </span>
                      <span className="text-sm mb-1" style={{ color: "#475569" }}>{plan.period}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#475569" }}>{plan.tagline}</p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 flex flex-col gap-2 mb-6">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#10b981" }} />
                        <span className="text-xs" style={{ color: "#cbd5e1" }}>{f}</span>
                      </div>
                    ))}
                    {plan.missing.map(f => (
                      <div key={f} className="flex items-center gap-2 opacity-30">
                        <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                          <div className="w-2.5 h-px rounded" style={{ background: "#475569" }} />
                        </div>
                        <span className="text-xs" style={{ color: "#475569" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {plan.cta ? (
                    <PricingCTAButton plan={plan.cta} color={plan.color} popular={plan.popular} />
                  ) : (
                    <button
                      onClick={() => handleConnect("pricing_free")}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      Get Started Free
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex flex-col gap-1">
            <span
              className="font-extrabold text-sm text-white tracking-widest"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              DEVCONTEXT
            </span>
            <span className="text-xs" style={{ color: "#334155" }}>
              The intelligence layer for complex engineering.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                Free to Use
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
                style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                No API Key Required
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
              <span className="text-[11px]" style={{ color: "#334155" }}>7-day secure sessions · SOC 2 Type II Pending</span>
            </div>
          </div>
        </footer>

        <div
          className="px-6 md:px-12 py-4 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
        >
          <span className="text-[11px]" style={{ color: "#1e293b" }}>
            © 2024 DevContext. Designed for the obsessed.
          </span>
        </div>
      </div>
    </>
  )
}
