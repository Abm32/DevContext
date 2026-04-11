import { useLocation } from "wouter"
import { useGetMe, useLogout } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, Github, Zap, Sparkles, Users } from "lucide-react"
import { usePlan, type PlanTier } from "@/hooks/use-plan"

type PaidPlan = Exclude<PlanTier, "free">

// Next tier to upgrade to from the current plan
const NEXT_TIER: Record<PlanTier, PaidPlan | null> = {
  free: "plus",
  plus: "pro",
  pro: "team",
  team: null,
}

const TIER_STYLE: Record<PlanTier, { color: string; bg: string; border: string; label: string; icon: React.ReactNode }> = {
  free: { color: "#64748b", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)", label: "Free", icon: null },
  plus: { color: "#60a5fa", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", label: "Plus", icon: <Sparkles className="w-2.5 h-2.5" /> },
  pro: { color: "#a78bfa", bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.25)", label: "Pro", icon: <Zap className="w-2.5 h-2.5" /> },
  team: { color: "#34d399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.22)", label: "Team", icon: <Users className="w-2.5 h-2.5" /> },
}

const UPGRADE_BTN: Record<PaidPlan, { bg: string; label: string }> = {
  plus: { bg: "linear-gradient(135deg, #3b82f6, #2563eb)", label: "→ Plus" },
  pro: { bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)", label: "→ Pro" },
  team: { bg: "linear-gradient(135deg, #10b981, #059669)", label: "→ Team" },
}

function PlanBadge({ plan }: { plan: PlanTier }) {
  const s = TIER_STYLE[plan]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.icon}
      {s.label}
    </span>
  )
}

function UpgradeNavButton({ currentPlan }: { currentPlan: PlanTier }) {
  const [, setLocation] = useLocation()
  const nextTier = NEXT_TIER[currentPlan]

  if (!nextTier) return null

  const btn = UPGRADE_BTN[nextTier]

  return (
    <button
      onClick={() => setLocation("/pricing")}
      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
      style={{ background: btn.bg, boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
    >
      Upgrade {btn.label}
    </button>
  )
}

export function Header() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading } = useGetMe({ query: { retry: false } })
  const { plan, isTeam } = usePlan()
  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => { window.location.href = "/" },
    },
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-3 md:px-4 h-12 md:h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/images/logo.png" alt="DevContext logo" className="w-6 h-6 md:w-7 md:h-7 rounded-lg object-cover" />
          <span className="font-display font-bold text-sm md:text-base text-white tracking-tight">
            DevContext
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 md:gap-2.5">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="w-16 h-5 rounded-full" />
              <Skeleton className="w-7 h-7 rounded-full" />
            </div>
          ) : user ? (
            <>
              {/* Plan badge */}
              <PlanBadge plan={plan} />

              {/* Upgrade CTA — hidden for Team (highest tier) */}
              {!isTeam && <UpgradeNavButton currentPlan={plan} />}

              {/* User pill → profile */}
              <button
                onClick={() => setLocation("/profile")}
                title="View profile"
                className="flex items-center gap-1.5 md:gap-2 bg-secondary/50 py-1 pl-1.5 md:pl-2.5 pr-1 rounded-full border border-white/5 hover:border-white/15 transition-colors"
              >
                <span className="text-xs font-medium text-muted-foreground hidden sm:block leading-none">
                  {user.login}
                </span>
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-6 h-6 rounded-full border border-white/10"
                />
              </button>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logoutMutation.mutate()}
                isLoading={logoutMutation.isPending}
                title="Log out"
                className="text-muted-foreground hover:text-destructive w-8 h-8"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button onClick={() => { window.location.href = "/api/auth/github" }} className="gap-2 text-sm h-8">
              <Github className="w-3.5 h-3.5" />
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
