import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userPlans, aiUsage, PLAN_LIMITS, type PlanTier } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getTokenPayload } from "./auth";

const router: IRouter = Router();

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Get or create a user's plan row ─────────────────────────────────────────
async function getUserPlan(github_username: string): Promise<PlanTier> {
  const rows = await db.select().from(userPlans).where(eq(userPlans.github_username, github_username));
  if (rows.length) return rows[0]!.plan as PlanTier;
  await db.insert(userPlans).values({ github_username, plan: "free" }).onConflictDoNothing();
  return "free";
}

// ─── Get usage for current month ─────────────────────────────────────────────
async function getMonthlyUsage(github_username: string): Promise<number> {
  const month = currentMonth();
  const rows = await db.select().from(aiUsage)
    .where(eq(aiUsage.github_username, github_username));
  const row = rows.find(r => r.month === month);
  return row?.count ?? 0;
}

// ─── Increment usage (upsert) ─────────────────────────────────────────────────
export async function incrementAiUsage(github_username: string): Promise<void> {
  const month = currentMonth();
  await db.insert(aiUsage)
    .values({ github_username, month, count: 1 })
    .onConflictDoUpdate({
      target: [aiUsage.github_username, aiUsage.month],
      set: {
        count: sql`${aiUsage.count} + 1`,
        updated_at: sql`now()`,
      },
    });
}

// ─── GET /api/v1/plan/me ──────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) { res.status(401).json({ error: "Not authenticated" }); return; }

  try {
    const username = payload.githubUser.login;
    const plan = await getUserPlan(username);
    const limits = PLAN_LIMITS[plan];
    const usageCount = await getMonthlyUsage(username);
    const limitValue = limits.ai_analyses_per_month;

    res.json({
      plan,
      features: {
        compare_mode: limits.compare_mode,
        standup_emails: limits.standup_emails,
        workspaces: limits.workspaces,
        max_repos: limits.max_repos,
      },
      usage: {
        ai_analyses: {
          used: usageCount,
          limit: limitValue,
          exhausted: usageCount >= limitValue,
        },
      },
    });
  } catch (err) {
    req.log.error({ err }, "plan/me error");
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Check if user can generate AI (call from ai route) ───────────────────────
export async function checkAiAllowed(github_username: string): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan(github_username);
  const limits = PLAN_LIMITS[plan];
  const used = await getMonthlyUsage(github_username);
  if (used >= limits.ai_analyses_per_month) {
    return {
      allowed: false,
      reason: `Your ${plan} plan allows ${limits.ai_analyses_per_month} AI analyses per month. Upgrade to continue.`,
    };
  }
  return { allowed: true };
}

// ─── Check if user has a feature ─────────────────────────────────────────────
export async function checkFeatureAllowed(
  github_username: string,
  feature: keyof typeof PLAN_LIMITS["free"],
): Promise<{ allowed: boolean }> {
  const plan = await getUserPlan(github_username);
  return { allowed: !!PLAN_LIMITS[plan][feature] };
}

export { getUserPlan };
export default router;
