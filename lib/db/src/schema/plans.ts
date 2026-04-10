import { pgTable, serial, varchar, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export type PlanTier = "free" | "plus" | "pro" | "team";

export const userPlans = pgTable("user_plans", {
  id: serial("id").primaryKey(),
  github_username: varchar("github_username", { length: 100 }).notNull().unique(),
  plan: varchar("plan", { length: 20 }).notNull().default("free"),
  stripe_customer_id: varchar("stripe_customer_id", { length: 200 }),
  razorpay_payment_id: varchar("razorpay_payment_id", { length: 200 }),
  razorpay_order_id: varchar("razorpay_order_id", { length: 200 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  github_username: varchar("github_username", { length: 100 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // "YYYY-MM"
  count: integer("count").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, table => [
  uniqueIndex("ai_usage_user_month_idx").on(table.github_username, table.month),
]);

export type UserPlan = typeof userPlans.$inferSelect;
export type InsertUserPlan = typeof userPlans.$inferInsert;
export type AiUsage = typeof aiUsage.$inferSelect;
export type InsertAiUsage = typeof aiUsage.$inferInsert;

// ─── Plan config ─────────────────────────────────────────────────────────────
//
// max_repos: Maximum repos active in compare mode simultaneously.
//   Dashboard uses useQueries (dynamic pipeline) — no fixed slot ceiling.
//
//   free  = 1     (single-repo mode only, compare disabled)
//   plus  = 3     (up to 3 repos in compare mode)
//   pro   = 10    (up to 10 repos in compare mode)
//   team  = 9999  (sentinel for "unlimited"; UI shows "Unlimited repos")
//
//   The Dashboard reads maxRepos = features.max_repos and enforces selection.
//   REPO_COLORS cycles via i % REPO_COLORS.length for visual distinction.

export const PLAN_LIMITS = {
  free: {
    ai_analyses_per_month: 10,
    max_repos: 1,
    compare_mode: false,
    standup_emails: false,
    workspaces: false,
  },
  plus: {
    ai_analyses_per_month: 100,
    max_repos: 3,
    compare_mode: true,
    standup_emails: false,
    workspaces: false,
  },
  pro: {
    ai_analyses_per_month: 500,
    max_repos: 10,
    compare_mode: true,
    standup_emails: true,
    workspaces: true,
  },
  team: {
    ai_analyses_per_month: 2000,
    max_repos: 9999,
    compare_mode: true,
    standup_emails: true,
    workspaces: true,
  },
} as const satisfies Record<PlanTier, {
  ai_analyses_per_month: number;
  max_repos: number;
  compare_mode: boolean;
  standup_emails: boolean;
  workspaces: boolean;
}>;

// ─── Razorpay amounts in paise (1 INR = 100 paise) ───────────────────────────

export const PLAN_PRICES: Record<Exclude<PlanTier, "free">, { amount_paise: number; label: string }> = {
  plus: { amount_paise: 49900, label: "₹499/month" },
  pro: { amount_paise: 99900, label: "₹999/month" },
  team: { amount_paise: 249900, label: "₹2,499/month" },
};
