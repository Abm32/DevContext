import { useEffect } from "react"
import { useLocation } from "wouter"
import { motion } from "framer-motion"
import { Github, Zap, CheckCircle2, ArrowRight, GitBranch, FileText, Layers, Brain, ArrowUpRight } from "lucide-react"
import { useGetMe } from "@workspace/api-client-react"
import { track } from "@/hooks/use-track"

// ─── Commit Mock-up ───────────────────────────────────────────────────────────
function CommitMockup() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "#131314",
        boxShadow: "0 40px 80px 0 rgba(0,46,106,0.18), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3.5" style={{ background: "#1a1a1c" }}>
        <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        <span
          className="ml-3 text-xs font-mono"
          style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}
        >
          devcontext-analysis.md
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">
        {/* Branch + commit line */}
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

        {/* Summary box */}
        <div className="rounded-lg p-3.5 flex flex-col gap-2" style={{ background: "#0d0d0f" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
            Summary
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
            Transitioned from JWT local storage to HttpOnly cookies to mitigate XSS risks in the dashboard subroute.
          </p>
        </div>

        {/* Impacted files */}
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

        {/* Two panels */}
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

// ─── Bento Card ───────────────────────────────────────────────────────────────
function BentoCard({
  icon,
  title,
  description,
  accent,
  children,
  className = "",
}: {
  icon?: React.ReactNode
  title?: string
  description?: string
  accent?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`rounded-2xl p-6 flex flex-col ${className}`}
      style={{
        background: "#131314",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
      }}
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
        <h3
          className="font-semibold text-white mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.0625rem" }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
          {description}
        </p>
      )}
      {children}
    </motion.div>
  )
}

// ─── Landing ──────────────────────────────────────────────────────────────────
export default function Landing() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading } = useGetMe({ query: { retry: false } })

  useEffect(() => {
    void track("page_view", { page: "/" })
  }, [])

  useEffect(() => {
    if (user && !isLoading) setLocation("/dashboard")
  }, [user, isLoading, setLocation])

  if (isLoading) return null

  const handleConnect = (element: string) => {
    void track("click:connect_github", { element })
    window.location.href = "/api/auth/github"
  }

  return (
    <div
      className="min-h-screen flex flex-col"
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
        {/* Logo */}
        <div className="flex items-center gap-8">
          <span
            className="font-extrabold tracking-tight text-white text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.08em" }}
          >
            DEVCONTEXT
          </span>
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

        {/* Nav actions */}
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

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {/* Badge */}
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

            {/* Display headline */}
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

            {/* Body */}
            <p className="text-base leading-relaxed max-w-md" style={{ color: "#64748b", fontFamily: "'Inter', sans-serif" }}>
              DevContext reconstructs the mental model of your codebase using deep commit analysis and semantic mapping. Stop wasting hours remembering where you left off.
            </p>

            {/* CTAs */}
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

            {/* OAuth scopes */}
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

          {/* Right — Commit Mockup */}
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

      {/* ── Engineered for Focus ── */}
      <section className="px-6 md:px-12 pb-20 pt-4">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
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

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Row 1 */}

            {/* Card 1 — Context Rebuilt (tall left) */}
            <BentoCard
              icon={<Layers className="w-4 h-4" style={{ color: "#3b82f6" }} />}
              title="Context Rebuilt"
              description="Our engine crawls your recent branches, PRs, and tickets to build a dynamic knowledge graph of your current workspace status."
              accent="#3b82f6"
              className="md:row-span-1"
            />

            {/* Card 2 — Visual center card with mesh */}
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
              {/* Animated mesh */}
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

            {/* Card 3 — AI Summaries */}
            <BentoCard
              icon={<Brain className="w-4 h-4" style={{ color: "#8b5cf6" }} />}
              title="AI Summaries"
              description="Human-readable briefings on what changed while you were away, across all repositories and teams."
              accent="#8b5cf6"
            />

            {/* Row 2 */}

            {/* Card 4 — Smart Next Steps */}
            <BentoCard
              icon={<Zap className="w-4 h-4" style={{ color: "#f59e0b" }} />}
              title="Smart Next Steps"
              description="DevContext predicts your next logical task and pre-fetches relevant documentation and code snippets."
              accent="#f59e0b"
            />

            {/* Card 5 — Semantic Search Layer (spans 2 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-2 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
              style={{
                background: "#131314",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
              }}
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

      {/* bottom copyright strip */}
      <div
        className="px-6 md:px-12 py-4 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
      >
        <span className="text-[11px]" style={{ color: "#1e293b" }}>
          © 2024 DevContext. Designed for the obsessed.
        </span>
      </div>
    </div>
  )
}
