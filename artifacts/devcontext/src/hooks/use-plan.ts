import { useQuery } from "@tanstack/react-query"

export type PlanTier = "free" | "plus" | "pro" | "team"

export interface PlanData {
  plan: PlanTier
  features: {
    compare_mode: boolean
    standup_emails: boolean
    workspaces: boolean
    max_repos: number
  }
  usage: {
    ai_analyses: {
      used: number
      limit: number
      exhausted: boolean
    }
  }
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""

async function fetchPlan(): Promise<PlanData> {
  const res = await fetch(`${BASE}/api/plan/me`, { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch plan")
  return res.json() as Promise<PlanData>
}

export function usePlan() {
  const { data, isLoading, refetch } = useQuery<PlanData>({
    queryKey: ["plan", "me"],
    queryFn: fetchPlan,
    staleTime: 60_000,
    retry: false,
  })

  const plan = data?.plan ?? "free"
  const isFreeTier = plan === "free"
  const isPlusTier = plan === "plus"
  const isPro = plan === "pro"
  const isTeam = plan === "team"

  return {
    plan,
    features: data?.features ?? {
      compare_mode: false,
      standup_emails: false,
      workspaces: false,
      max_repos: 1,
    },
    usage: data?.usage ?? {
      ai_analyses: { used: 0, limit: 10, exhausted: false },
    },
    isLoading,
    isFreeTier,
    isPlusTier,
    isPro,
    isTeam,
    /** true for any paid tier */
    isPaid: !isFreeTier,
    refetch,
  }
}
