import { useState, useEffect, useCallback } from "react"
import { useLocation } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, LogOut, RefreshCw, BarChart2, ChevronDown,
  Search, Crown, Zap, Check, X, CreditCard, ArrowUpDown,
  Shield, RotateCcw, Edit3,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type PlanTier = "free" | "plus" | "pro" | "team"

interface AdminUser {
  id: number
  github_username: string
  plan: string
  razorpay_payment_id: string | null
  razorpay_order_id: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
  ai_usage_current_month: number
  ai_usage_all_time: number
  ai_usage_months: Array<{ month: string; count: number }>
}

const PLAN_META: Record<PlanTier, { label: string; color: string; bg: string; border: string; limit: number }> = {
  free:  { label: "Free",  color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)", limit: 10 },
  plus:  { label: "Plus",  color: "#60a5fa", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.25)",  limit: 100 },
  pro:   { label: "Pro",   color: "#a78bfa", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.25)",  limit: 500 },
  team:  { label: "Team",  color: "#34d399", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)",  limit: 2000 },
}

function getPlanMeta(plan: string) {
  return PLAN_META[plan as PlanTier] ?? PLAN_META.free
}

function planExpiry(user: AdminUser): string {
  if (user.plan === "free") return "—"
  const activated = new Date(user.updated_at)
  const expiry = new Date(activated)
  expiry.setDate(expiry.getDate() + 30)
  return expiry.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function isExpired(user: AdminUser): boolean {
  if (user.plan === "free") return false
  const expiry = new Date(user.updated_at)
  expiry.setDate(expiry.getDate() + 30)
  return expiry < new Date()
}

function PlanBadge({ plan }: { plan: string }) {
  const meta = getPlanMeta(plan)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold"
      style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
    >
      {plan === "team" && <Crown className="w-3 h-3" />}
      {plan === "pro" && <Zap className="w-3 h-3" />}
      {plan === "plus" && <Shield className="w-3 h-3" />}
      {meta.label}
    </span>
  )
}

type SortKey = "username" | "plan" | "created_at" | "updated_at" | "ai_usage_current_month"

export default function AdminUsers() {
  const [, setLocation] = useLocation()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("created_at")
  const [sortAsc, setSortAsc] = useState(false)

  // Per-row edit state
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [editingCredits, setEditingCredits] = useState<string | null>(null)
  const [creditInput, setCreditInput] = useState<Record<string, string>>({})
  const [savingPlan, setSavingPlan] = useState<string | null>(null)
  const [savingCredits, setSavingCredits] = useState<string | null>(null)
  const [resetting, setResetting] = useState<string | null>(null)
  const [actionResult, setActionResult] = useState<Record<string, { ok: boolean; msg: string }>>({})

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" })
      if (res.status === 401) { setLocation("/admin/login"); return }
      if (!res.ok) throw new Error("Failed to load users")
      const data = await res.json() as AdminUser[]
      setUsers(data)
    } catch {
      setError("Could not load users. Check your connection.")
    } finally {
      setLoading(false)
    }
  }, [setLocation])

  useEffect(() => { void fetchUsers() }, [fetchUsers])

  const showResult = (username: string, ok: boolean, msg: string) => {
    setActionResult(prev => ({ ...prev, [username]: { ok, msg } }))
    setTimeout(() => setActionResult(prev => { const n = { ...prev }; delete n[username]; return n }), 3000)
  }

  const savePlan = async (username: string, newPlan: string) => {
    setSavingPlan(username)
    try {
      const res = await fetch(`/api/admin/plans/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
        credentials: "include",
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.github_username === username ? { ...u, plan: newPlan, updated_at: new Date().toISOString() } : u))
        showResult(username, true, `Plan → ${newPlan}`)
      } else {
        showResult(username, false, "Failed to update plan")
      }
    } catch {
      showResult(username, false, "Network error")
    } finally {
      setSavingPlan(null)
      setEditingPlan(null)
    }
  }

  const saveCredits = async (username: string) => {
    const val = parseInt(creditInput[username] ?? "")
    if (isNaN(val) || val < 0) { showResult(username, false, "Enter a valid number"); return }
    setSavingCredits(username)
    try {
      const res = await fetch(`/api/admin/users/${username}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: val }),
        credentials: "include",
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.github_username === username ? { ...u, ai_usage_current_month: val } : u))
        showResult(username, true, `Credits set to ${val}`)
      } else {
        showResult(username, false, "Failed to set credits")
      }
    } catch {
      showResult(username, false, "Network error")
    } finally {
      setSavingCredits(null)
      setEditingCredits(null)
    }
  }

  const resetUsage = async (username: string) => {
    setResetting(username)
    try {
      const res = await fetch(`/api/admin/plans/${username}/usage`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.github_username === username ? { ...u, ai_usage_current_month: 0 } : u))
        showResult(username, true, "Usage reset to 0")
      } else {
        showResult(username, false, "Failed to reset usage")
      }
    } catch {
      showResult(username, false, "Network error")
    } finally {
      setResetting(null)
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(prev => !prev)
    else { setSortKey(key); setSortAsc(true) }
  }

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase()
      if (q && !u.github_username.toLowerCase().includes(q)) return false
      if (planFilter !== "all" && u.plan !== planFilter) return false
      return true
    })
    .sort((a, b) => {
      let va: string | number = "", vb: string | number = ""
      if (sortKey === "username") { va = a.github_username; vb = b.github_username }
      else if (sortKey === "plan") { va = a.plan; vb = b.plan }
      else if (sortKey === "created_at") { va = a.created_at; vb = b.created_at }
      else if (sortKey === "updated_at") { va = a.updated_at; vb = b.updated_at }
      else if (sortKey === "ai_usage_current_month") { va = a.ai_usage_current_month; vb = b.ai_usage_current_month }
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1 : -1
      return 0
    })

  const tierCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.plan] = (acc[u.plan] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0B" }}>
      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "rgba(10,10,11,0.95)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-white tracking-widest text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            DEVCONTEXT
          </span>
          <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>ADMIN</span>
        </div>

        <nav className="flex items-center gap-1">
          {[
            { label: "Dashboard", path: "/admin/dashboard", icon: BarChart2 },
            { label: "Users", path: "/admin/users", icon: Users },
          ].map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: path === "/admin/users" ? "rgba(59,130,246,0.12)" : "transparent",
                color: path === "/admin/users" ? "#60a5fa" : "rgba(255,255,255,0.45)",
                border: path === "/admin/users" ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void fetchUsers()}
            disabled={loading}
            className="text-muted-foreground hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST", credentials: "include" })
              setLocation("/admin/login")
            }}
            className="text-muted-foreground hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">
        {/* ── Header ── */}
        <div>
          <h1 className="text-xl font-bold text-white">User Management</h1>
          <p className="text-sm mt-1" style={{ color: "#475569" }}>Manage plans, credits, and account details for all registered users.</p>
        </div>

        {/* ── Tier breakdown pills ── */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPlanFilter("all")}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: planFilter === "all" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
              color: planFilter === "all" ? "#fff" : "#475569",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            All ({users.length})
          </button>
          {(["free", "plus", "pro", "team"] as PlanTier[]).map(tier => (
            <button
              key={tier}
              onClick={() => setPlanFilter(tier)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: planFilter === tier ? getPlanMeta(tier).bg : "rgba(255,255,255,0.04)",
                color: planFilter === tier ? getPlanMeta(tier).color : "#475569",
                border: `1px solid ${planFilter === tier ? getPlanMeta(tier).border : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {getPlanMeta(tier).label} ({tierCounts[tier] ?? 0})
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#475569" }} />
          <input
            type="text"
            placeholder="Search by username…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e2e8f0",
            }}
          />
        </div>

        {/* ── Table ── */}
        {error ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => void fetchUsers()} className="mt-3 text-xs text-muted-foreground hover:text-white underline">Retry</button>
          </div>
        ) : loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <Users className="w-8 h-8 mx-auto mb-3" style={{ color: "#334155" }} />
            <p className="text-sm" style={{ color: "#475569" }}>No users found.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Table header */}
            <div
              className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3"
              style={{
                gridTemplateColumns: "1.5fr 90px 160px 130px 130px 130px 160px",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.3)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {([
                ["username", "Username"],
                ["plan", "Tier"],
                ["ai_usage_current_month", "Credits (this month)"],
                ["created_at", "Joined"],
                ["updated_at", "Plan activated"],
                [null, "Expires"],
                [null, "Actions"],
              ] as Array<[SortKey | null, string]>).map(([key, label]) => (
                <div
                  key={label}
                  className={key ? "flex items-center gap-1 cursor-pointer hover:text-white transition-colors select-none" : ""}
                  onClick={key ? () => toggleSort(key) : undefined}
                >
                  {label}
                  {key && (
                    <ArrowUpDown className={`w-3 h-3 transition-opacity ${sortKey === key ? "opacity-100" : "opacity-30"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y" style={{ divideColor: "rgba(255,255,255,0.04)" }}>
              <AnimatePresence>
                {filtered.map((user, idx) => {
                  const meta = getPlanMeta(user.plan)
                  const limit = meta.limit
                  const pct = Math.min((user.ai_usage_current_month / limit) * 100, 100)
                  const expired = isExpired(user)
                  const result = actionResult[user.github_username]

                  return (
                    <motion.div
                      key={user.github_username}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="grid items-center px-5 py-4 hover:bg-white/[0.015] transition-colors"
                      style={{ gridTemplateColumns: "1.5fr 90px 160px 130px 130px 130px 160px" }}
                    >
                      {/* Username */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={`https://github.com/${user.github_username}.png?size=32`}
                          className="w-7 h-7 rounded-full shrink-0"
                          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                          alt={user.github_username}
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.github_username}&background=1e293b&color=94a3b8&size=32` }}
                        />
                        <div className="min-w-0">
                          <a
                            href={`https://github.com/${user.github_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate block"
                          >
                            {user.github_username}
                          </a>
                          {user.razorpay_payment_id && (
                            <span className="text-[10px] font-mono truncate block" style={{ color: "#475569" }}>
                              {user.razorpay_payment_id.slice(0, 16)}…
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tier */}
                      <div>
                        {editingPlan === user.github_username ? (
                          <div className="flex flex-col gap-1">
                            <select
                              autoFocus
                              defaultValue={user.plan}
                              onChange={e => { void savePlan(user.github_username, e.target.value) }}
                              onBlur={() => setEditingPlan(null)}
                              disabled={savingPlan === user.github_username}
                              className="text-xs rounded-lg px-2 py-1 outline-none"
                              style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)" }}
                            >
                              {(["free", "plus", "pro", "team"] as PlanTier[]).map(t => (
                                <option key={t} value={t}>{getPlanMeta(t).label}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <button onClick={() => setEditingPlan(user.github_username)} className="group flex items-center gap-1">
                            <PlanBadge plan={user.plan} />
                            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: "#94a3b8" }} />
                          </button>
                        )}
                      </div>

                      {/* Credits */}
                      <div className="pr-3">
                        {editingCredits === user.github_username ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              autoFocus
                              min={0}
                              value={creditInput[user.github_username] ?? user.ai_usage_current_month}
                              onChange={e => setCreditInput(prev => ({ ...prev, [user.github_username]: e.target.value }))}
                              onKeyDown={e => {
                                if (e.key === "Enter") void saveCredits(user.github_username)
                                if (e.key === "Escape") setEditingCredits(null)
                              }}
                              className="w-16 text-xs rounded-lg px-2 py-1 outline-none"
                              style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)" }}
                            />
                            <button
                              onClick={() => void saveCredits(user.github_username)}
                              disabled={savingCredits === user.github_username}
                              className="p-1 rounded-md hover:bg-green-500/10 transition-colors"
                            >
                              <Check className="w-3 h-3 text-emerald-400" />
                            </button>
                            <button onClick={() => setEditingCredits(null)} className="p-1 rounded-md hover:bg-red-500/10 transition-colors">
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setCreditInput(prev => ({ ...prev, [user.github_username]: String(user.ai_usage_current_month) }))
                              setEditingCredits(user.github_username)
                            }}
                            className="group w-full text-left"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white">
                                {user.ai_usage_current_month.toLocaleString()}
                                <span style={{ color: "#475569" }}> / {limit.toLocaleString()}</span>
                              </span>
                              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: "#94a3b8" }} />
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  background: pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : meta.color,
                                }}
                              />
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Joined */}
                      <div className="text-xs" style={{ color: "#64748b" }}>
                        {new Date(user.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>

                      {/* Plan activated */}
                      <div className="text-xs" style={{ color: "#64748b" }}>
                        {user.plan === "free"
                          ? <span style={{ color: "#334155" }}>—</span>
                          : new Date(user.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>

                      {/* Expires */}
                      <div>
                        {user.plan === "free"
                          ? <span className="text-xs" style={{ color: "#334155" }}>—</span>
                          : (
                            <span
                              className="text-xs"
                              style={{ color: expired ? "#ef4444" : "#64748b" }}
                            >
                              {expired && <span className="mr-1 text-[10px] px-1 py-0.5 rounded font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>Expired</span>}
                              {planExpiry(user)}
                            </span>
                          )
                        }
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <AnimatePresence mode="wait">
                          {result ? (
                            <motion.span
                              key="result"
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-xs px-2 py-1 rounded-lg"
                              style={{
                                background: result.ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                                color: result.ok ? "#10b981" : "#f87171",
                              }}
                            >
                              {result.ok ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
                              {result.msg}
                            </motion.span>
                          ) : (
                            <motion.div key="actions" className="flex items-center gap-1.5">
                              <button
                                onClick={() => void resetUsage(user.github_username)}
                                disabled={resetting === user.github_username}
                                title="Reset this month's usage to 0"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:bg-white/5"
                                style={{ color: "#64748b", border: "1px solid rgba(255,255,255,0.06)" }}
                              >
                                <RotateCcw className={`w-3 h-3 ${resetting === user.github_username ? "animate-spin" : ""}`} />
                                Reset
                              </button>
                              {user.razorpay_payment_id && (
                                <span title={`Payment: ${user.razorpay_payment_id}`}>
                                  <CreditCard className="w-3.5 h-3.5" style={{ color: "#334155" }} />
                                </span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── Footer summary ── */}
        {!loading && !error && (
          <p className="text-xs text-center" style={{ color: "#334155" }}>
            Showing {filtered.length} of {users.length} users
            {search || planFilter !== "all" ? ` (filtered)` : ""}
          </p>
        )}
      </div>
    </div>
  )
}
