import { useState, useEffect, useCallback } from "react"
import { useLocation } from "wouter"
import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import {
  Users, Eye, MousePointerClick, Activity, LogOut, RefreshCw, BrainCircuit, Zap,
  Mail, Plus, Trash2, ToggleLeft, ToggleRight, Check, X, BarChart2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface E2emGrant {
  id: number
  github_username: string
  repos: string[]
  recipient_name: string
  recipient_email: string | null
  user_display_name: string | null
  enabled: boolean
  created_at: string
}

interface Stats {
  total_users: number
  total_events: number
  total_sessions: number
  events_by_type: Array<{ event_type: string; count: string }>
  daily_events: Array<{ date: string; count: string }>
  top_repos: Array<{ repo: string; count: string }>
  recent_events: Array<{
    id: number
    event_type: string
    page: string | null
    element: string | null
    user_login: string | null
    session_id: string | null
    created_at: string
  }>
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-white/5 rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value.toLocaleString()}</p>
      </div>
    </motion.div>
  )
}

const EVENT_COLORS: Record<string, string> = {
  page_view: "#6366f1",
  "click:generate_summary": "#10b981",
  "click:generate_standup": "#0ea5e9",
  "click:copy": "#f59e0b",
  "click:connect_github": "#8b5cf6",
  user_signup: "#ec4899",
}

function eventColor(type: string): string {
  return EVENT_COLORS[type] ?? "#64748b"
}

function formatEventType(type: string): string {
  return type.replace("click:", "").replace(/_/g, " ")
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // ─── plans state ───────────────────────────────────────────────────────
  interface UserPlanRow {
    id: number
    github_username: string
    plan: string
    ai_usage_this_month: number
    created_at: string
    updated_at: string
  }
  const [plans, setPlans] = useState<UserPlanRow[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [planEditUser, setPlanEditUser] = useState("")
  const [planEditValue, setPlanEditValue] = useState("free")
  const [planSaving, setPlanSaving] = useState(false)

  const fetchPlans = useCallback(async () => {
    setPlansLoading(true)
    try {
      const res = await fetch("/api/admin/plans")
      if (res.ok) setPlans((await res.json()) as UserPlanRow[])
    } catch { /* silent */ } finally {
      setPlansLoading(false)
    }
  }, [])

  useEffect(() => { void fetchPlans() }, [fetchPlans])

  const handleSetPlan = async (username: string, plan: string) => {
    setPlanSaving(true)
    try {
      await fetch(`/api/admin/plans/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      void fetchPlans()
      setPlanEditUser("")
    } finally {
      setPlanSaving(false)
    }
  }

  const handleResetUsage = async (username: string) => {
    if (!confirm(`Reset AI usage for ${username}?`)) return
    await fetch(`/api/admin/plans/${username}/usage`, { method: "DELETE" })
    void fetchPlans()
  }

  // ─── e2em state ────────────────────────────────────────────────────────
  const [e2emGrants, setE2emGrants] = useState<E2emGrant[]>([])
  const [e2emLoading, setE2emLoading] = useState(false)
  const [showAddGrant, setShowAddGrant] = useState(false)
  const [newGrant, setNewGrant] = useState({
    github_username: "",
    repos: "",
    recipient_name: "Sir",
    recipient_email: "",
    user_display_name: "",
  })
  const [addingGrant, setAddingGrant] = useState(false)
  const [grantError, setGrantError] = useState("")

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const me = await fetch("/api/admin/me")
      if (!me.ok) {
        setLocation("/admin/login")
        return
      }
      const res = await fetch("/api/admin/stats")
      if (!res.ok) {
        setError("Failed to load stats")
        return
      }
      const data = (await res.json()) as Stats
      setStats(data)
      setLastRefresh(new Date())
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }, [setLocation])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    setLocation("/admin/login")
  }

  // ─── e2em grant handlers ──────────────────────────────────────────────────
  const fetchE2emGrants = useCallback(async () => {
    setE2emLoading(true)
    try {
      const res = await fetch("/api/admin/e2em/grants")
      if (res.ok) setE2emGrants((await res.json()) as E2emGrant[])
    } catch { /* silent */ } finally {
      setE2emLoading(false)
    }
  }, [])

  useEffect(() => { void fetchE2emGrants() }, [fetchE2emGrants])

  const handleToggleGrant = async (id: number, enabled: boolean) => {
    await fetch(`/api/admin/e2em/grants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    })
    void fetchE2emGrants()
  }

  const handleDeleteGrant = async (id: number) => {
    if (!confirm("Delete this e2em grant?")) return
    await fetch(`/api/admin/e2em/grants/${id}`, { method: "DELETE" })
    void fetchE2emGrants()
  }

  const handleCreateGrant = async () => {
    setGrantError("")
    if (!newGrant.github_username.trim()) { setGrantError("GitHub username required"); return }
    setAddingGrant(true)
    try {
      const repos = newGrant.repos.split(",").map(r => r.trim()).filter(Boolean)
      const res = await fetch("/api/admin/e2em/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_username: newGrant.github_username.trim(),
          repos,
          recipient_name: newGrant.recipient_name.trim() || "Sir",
          recipient_email: newGrant.recipient_email.trim() || null,
          user_display_name: newGrant.user_display_name.trim() || null,
        }),
      })
      if (!res.ok) { setGrantError("Failed to create grant"); return }
      setNewGrant({ github_username: "", repos: "", recipient_name: "Sir", recipient_email: "", user_display_name: "" })
      setShowAddGrant(false)
      void fetchE2emGrants()
    } catch { setGrantError("Network error") }
    finally { setAddingGrant(false) }
  }

  const totalPageViews = stats?.events_by_type.find(e => e.event_type === "page_view")?.count ?? "0"
  const totalSummaries =
    (Number(stats?.events_by_type.find(e => e.event_type === "click:generate_summary")?.count ?? 0) +
      Number(stats?.events_by_type.find(e => e.event_type === "click:generate_standup")?.count ?? 0))

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-white/5 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-white text-sm">DevContext</span>
            <span className="text-muted-foreground text-xs border border-white/10 px-2 py-0.5 rounded-full">
              Admin
            </span>
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
                  background: path === "/admin/dashboard" ? "rgba(99,102,241,0.12)" : "transparent",
                  color: path === "/admin/dashboard" ? "#818cf8" : "rgba(255,255,255,0.4)",
                  border: path === "/admin/dashboard" ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {lastRefresh && (
              <span className="text-[11px] text-muted-foreground/50 hidden sm:block">
                Updated {formatTime(lastRefresh.toISOString())}
              </span>
            )}
            <button
              onClick={() => void fetchStats()}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Button variant="outline" size="sm" onClick={() => void handleLogout()} className="gap-1.5 text-xs">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time platform usage metrics
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-white/5 rounded-2xl p-5">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))
          ) : (
            <>
              <StatCard icon={Users} label="GitHub Users" value={stats?.total_users ?? 0} color="bg-primary/20 text-primary" />
              <StatCard icon={Eye} label="Page Views" value={Number(totalPageViews)} color="bg-emerald-500/20 text-emerald-400" />
              <StatCard icon={Zap} label="Summaries Run" value={totalSummaries} color="bg-amber-500/20 text-amber-400" />
              <StatCard icon={Activity} label="Sessions" value={stats?.total_sessions ?? 0} color="bg-blue-500/20 text-blue-400" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity Chart */}
          <div className="bg-card border border-white/5 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Activity — Last 14 Days</h2>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={(stats?.daily_events ?? []).map(d => ({ ...d, count: Number(d.count) }))} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickFormatter={(v: string) => {
                      const d = new Date(v + "T00:00:00Z")
                      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#6366f1" }}
                    labelFormatter={(v: string) => formatDate(v + "T00:00:00Z")}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Events by Type */}
          <div className="bg-card border border-white/5 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Events by Type</h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-52 overflow-y-auto scrollbar-hide">
                {(stats?.events_by_type ?? []).map((e) => {
                  const total = stats?.total_events ?? 1
                  const pct = Math.round((Number(e.count) / total) * 100)
                  return (
                    <div key={e.event_type} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: eventColor(e.event_type) }}
                      />
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        {formatEventType(e.event_type)}
                      </span>
                      <div className="w-24 h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: eventColor(e.event_type) }}
                        />
                      </div>
                      <span className="text-xs font-medium text-white w-8 text-right">
                        {Number(e.count).toLocaleString()}
                      </span>
                    </div>
                  )
                })}
                {(stats?.events_by_type ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No events recorded yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top Repos */}
        <div className="bg-card border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            Most Analyzed Repos
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          ) : (stats?.top_repos ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No repo data yet — generate some summaries first</p>
          ) : (
            <div className="space-y-2.5">
              {(stats?.top_repos ?? []).map((r, idx) => {
                const max = Number(stats!.top_repos[0].count)
                const pct = Math.round((Number(r.count) / max) * 100)
                return (
                  <div key={r.repo} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground/40 w-4 text-right shrink-0">{idx + 1}</span>
                    <span className="text-xs text-white truncate flex-1 max-w-[220px]">{r.repo}</span>
                    <div className="w-24 h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-primary w-8 text-right shrink-0">{Number(r.count)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* e2em Access Management */}
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              e2em Access Management
            </h2>
            <button
              onClick={() => setShowAddGrant(s => !s)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors"
            >
              {showAddGrant ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddGrant ? "Cancel" : "Add Grant"}
            </button>
          </div>

          {/* Add Grant Form */}
          {showAddGrant && (
            <div className="p-5 border-b border-white/5 bg-blue-500/[0.04] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">GitHub Username *</label>
                  <input
                    type="text"
                    value={newGrant.github_username}
                    onChange={e => setNewGrant(g => ({ ...g, github_username: e.target.value }))}
                    placeholder="octocat"
                    className="bg-secondary/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={newGrant.user_display_name}
                    onChange={e => setNewGrant(g => ({ ...g, user_display_name: e.target.value }))}
                    placeholder="Abhimanyu R B"
                    className="bg-secondary/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Recipient Name</label>
                  <input
                    type="text"
                    value={newGrant.recipient_name}
                    onChange={e => setNewGrant(g => ({ ...g, recipient_name: e.target.value }))}
                    placeholder="Kumaresan"
                    className="bg-secondary/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Recipient Email</label>
                  <input
                    type="email"
                    value={newGrant.recipient_email}
                    onChange={e => setNewGrant(g => ({ ...g, recipient_email: e.target.value }))}
                    placeholder="manager@example.com"
                    className="bg-secondary/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Repos (comma-separated full names)</label>
                <input
                  type="text"
                  value={newGrant.repos}
                  onChange={e => setNewGrant(g => ({ ...g, repos: e.target.value }))}
                  placeholder="YIP-KDISC/web_client, YIP-KDISC/web_server"
                  className="bg-secondary/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-full"
                />
              </div>
              {grantError && <p className="text-xs text-red-400">{grantError}</p>}
              <button
                onClick={() => void handleCreateGrant()}
                disabled={addingGrant}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors"
              >
                {addingGrant ? "Creating…" : <><Check className="w-3.5 h-3.5" /> Create Grant</>}
              </button>
            </div>
          )}

          {/* Grant list */}
          {e2emLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : e2emGrants.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No e2em grants yet</div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {e2emGrants.map(g => (
                <div key={g.id} className="px-5 py-3.5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <a
                        href={`https://github.com/${g.github_username}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-white hover:text-primary transition-colors"
                      >
                        @{g.github_username}
                      </a>
                      {g.user_display_name && (
                        <span className="text-xs text-muted-foreground/60">({g.user_display_name})</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {(g.repos ?? []).map(r => (
                        <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground border border-white/5 font-mono">{r}</span>
                      ))}
                    </div>
                    <div className="text-[11px] text-muted-foreground/50">
                      To: {g.recipient_name}{g.recipient_email ? ` <${g.recipient_email}>` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => void handleToggleGrant(g.id, g.enabled)}
                      title={g.enabled ? "Disable" : "Enable"}
                      className="text-muted-foreground hover:text-white transition-colors"
                    >
                      {g.enabled
                        ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                        : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => void handleDeleteGrant(g.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events Table */}
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-muted-foreground" />
              Recent Events
            </h2>
            <span className="text-[11px] text-muted-foreground">Last 50</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Event</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Page</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Session</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3 px-4">
                          <Skeleton className="h-3 w-full max-w-[80px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (stats?.recent_events ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No events yet</td>
                  </tr>
                ) : (
                  (stats?.recent_events ?? []).map((evt) => (
                    <tr key={evt.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                          style={{
                            background: eventColor(evt.event_type) + "22",
                            color: eventColor(evt.event_type),
                          }}
                        >
                          {formatEventType(evt.event_type)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground truncate max-w-[120px]">
                        {evt.page ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {evt.user_login ? (
                          <a
                            href={`https://github.com/${evt.user_login}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            @{evt.user_login}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50">anonymous</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground/50 font-mono">
                        {evt.session_id ? evt.session_id.slice(0, 8) + "…" : "—"}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground whitespace-nowrap">
                        {formatDate(evt.created_at)} {formatTime(evt.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* ── Plans Management ───────────────────────────────────────────────── */}
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <Zap className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">User Plans</h2>
                <p className="text-xs text-muted-foreground">Manage free / pro / team tiers and AI usage</p>
              </div>
            </div>
            <button onClick={() => void fetchPlans()} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${plansLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Quick assign form */}
          <div className="px-6 py-4 border-b border-white/5 flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">GitHub username</label>
              <input
                type="text"
                value={planEditUser}
                onChange={e => setPlanEditUser(e.target.value)}
                placeholder="e.g. abm32"
                className="bg-secondary/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50 w-48"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Plan</label>
              <select
                value={planEditValue}
                onChange={e => setPlanEditValue(e.target.value)}
                className="bg-secondary/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="team">Team</option>
              </select>
            </div>
            <button
              onClick={() => void handleSetPlan(planEditUser.trim(), planEditValue)}
              disabled={!planEditUser.trim() || planSaving}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              {planSaving ? "Saving…" : "Assign Plan"}
            </button>
          </div>

          {/* Plans table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Username", "Plan", "AI Usage (this month)", "Since", "Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plansLoading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Loading…</td></tr>
                ) : plans.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground/50">No plan records yet — users default to free until they generate an AI analysis.</td></tr>
                ) : (
                  plans.map(row => (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <a href={`https://github.com/${row.github_username}`} target="_blank" rel="noreferrer" className="text-white hover:text-primary transition-colors font-mono">
                          @{row.github_username}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          row.plan === "pro" ? "bg-violet-500/15 text-violet-400 border border-violet-500/25" :
                          row.plan === "team" ? "bg-blue-500/15 text-blue-400 border border-blue-500/25" :
                          "bg-white/5 text-muted-foreground border border-white/10"
                        }`}>
                          {row.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${row.plan === "free" && row.ai_usage_this_month >= 10 ? "text-red-400" : "text-white"}`}>
                            {row.ai_usage_this_month}
                          </span>
                          {row.plan === "free" && (
                            <span className="text-[10px] text-muted-foreground/50">/ 10</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue={row.plan}
                            onChange={e => void handleSetPlan(row.github_username, e.target.value)}
                            className="bg-secondary/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="team">Team</option>
                          </select>
                          <button
                            onClick={() => void handleResetUsage(row.github_username)}
                            className="text-[11px] text-muted-foreground hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                            title="Reset AI usage count"
                          >
                            Reset usage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
