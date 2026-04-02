import { useState, useEffect, useCallback } from "react"
import { useLocation } from "wouter"
import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import {
  Users, Eye, MousePointerClick, Activity, LogOut, RefreshCw, BrainCircuit, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
  total_users: number
  total_events: number
  total_sessions: number
  events_by_type: Array<{ event_type: string; count: string }>
  daily_events: Array<{ date: string; count: string }>
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
      </main>
    </div>
  )
}
