import { Router, type IRouter, type Request } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { e2emGrants, userPlans, aiUsage } from "@workspace/db";
import { sql, eq, desc } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_COOKIE = "dc_admin_token";

function getAdminJwtSecret(): string {
  return process.env["ADMIN_JWT_SECRET"] ?? "";
}

function verifyAdminToken(req: Request): boolean {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (!token) return false;
  const secret = getAdminJwtSecret();
  if (!secret) return false;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

router.post("/login", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "";
  const ADMIN_SALT = process.env["ADMIN_SALT"] ?? "";
  const ADMIN_HASH = process.env["ADMIN_PASSWORD_HASH"] ?? "";
  const JWT_SECRET = getAdminJwtSecret();

  if (!ADMIN_EMAIL || !ADMIN_SALT || !ADMIN_HASH || !JWT_SECRET) {
    res.status(500).json({ error: "Admin not configured" });
    return;
  }

  const inputHash = createHmac("sha256", ADMIN_SALT).update(password).digest("hex");

  const storedBuf = Buffer.from(ADMIN_HASH, "hex");
  const inputBuf = Buffer.from(inputHash, "hex");

  const emailMatch = email === ADMIN_EMAIL;
  const passwordMatch = storedBuf.length === inputBuf.length && timingSafeEqual(storedBuf, inputBuf);

  if (!emailMatch || !passwordMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "24h" });
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ ok: true });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  if (!verifyAdminToken(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ ok: true });
});

router.get("/stats", async (req, res) => {
  if (!verifyAdminToken(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const [uniqueUsers, totalEvents, eventsByType, dailyEvents, recentEvents, topRepos] = await Promise.all([
      db.execute(sql`
        SELECT COUNT(DISTINCT user_id) AS count FROM analytics_events WHERE user_id IS NOT NULL
      `),
      db.execute(sql`SELECT COUNT(*) AS count FROM analytics_events`),
      db.execute(sql`
        SELECT event_type, COUNT(*) AS count
        FROM analytics_events
        GROUP BY event_type
        ORDER BY count DESC
        LIMIT 20
      `),
      db.execute(sql`
        SELECT
          TO_CHAR(DATE(created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS date,
          COUNT(*) AS count
        FROM analytics_events
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY DATE(created_at AT TIME ZONE 'UTC')
        ORDER BY date ASC
      `),
      db.execute(sql`
        SELECT id, event_type, page, element, user_login, session_id, created_at
        FROM analytics_events
        ORDER BY created_at DESC
        LIMIT 50
      `),
      db.execute(sql`
        SELECT
          metadata->>'repo' AS repo,
          COUNT(*) AS count
        FROM analytics_events
        WHERE event_type IN ('click:generate_summary', 'click:generate_standup')
          AND metadata->>'repo' IS NOT NULL
        GROUP BY metadata->>'repo'
        ORDER BY count DESC
        LIMIT 10
      `),
    ]);

    const uniqueSessions = await db.execute(sql`
      SELECT COUNT(DISTINCT session_id) AS count FROM analytics_events WHERE session_id IS NOT NULL
    `);

    res.json({
      total_users: Number((uniqueUsers.rows[0] as { count: string })?.count ?? 0),
      total_events: Number((totalEvents.rows[0] as { count: string })?.count ?? 0),
      total_sessions: Number((uniqueSessions.rows[0] as { count: string })?.count ?? 0),
      events_by_type: eventsByType.rows,
      daily_events: dailyEvents.rows,
      recent_events: recentEvents.rows,
      top_repos: (topRepos.rows as Array<{ repo: string; count: string }>),
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ── e2em grant management ─────────────────────────────────────────────────────

router.get("/e2em/grants", async (req, res) => {
  if (!verifyAdminToken(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const grants = await db.select().from(e2emGrants).orderBy(e2emGrants.created_at);
    res.json(grants);
  } catch (err) {
    req.log.error({ err }, "e2em grants list error");
    res.status(500).json({ error: "Failed to list grants" });
  }
});

router.post("/e2em/grants", async (req, res) => {
  if (!verifyAdminToken(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const body = req.body as {
    github_username?: string;
    repos?: string[];
    recipient_name?: string;
    recipient_email?: string;
    user_display_name?: string;
    enabled?: boolean;
  };
  if (!body.github_username) {
    res.status(400).json({ error: "github_username required" });
    return;
  }
  try {
    const [grant] = await db.insert(e2emGrants).values({
      github_username: body.github_username.toLowerCase(),
      repos: body.repos ?? [],
      recipient_name: body.recipient_name ?? "Sir",
      recipient_email: body.recipient_email ?? null,
      user_display_name: body.user_display_name ?? null,
      enabled: body.enabled ?? true,
    }).returning();
    res.json(grant);
  } catch (err) {
    req.log.error({ err }, "e2em grant create error");
    res.status(500).json({ error: "Failed to create grant" });
  }
});

router.put("/e2em/grants/:id", async (req, res) => {
  if (!verifyAdminToken(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const id = Number(req.params["id"]);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = req.body as {
    repos?: string[];
    recipient_name?: string;
    recipient_email?: string;
    user_display_name?: string;
    enabled?: boolean;
  };
  try {
    const [updated] = await db.update(e2emGrants)
      .set({
        ...(body.repos !== undefined ? { repos: body.repos } : {}),
        ...(body.recipient_name !== undefined ? { recipient_name: body.recipient_name } : {}),
        ...(body.recipient_email !== undefined ? { recipient_email: body.recipient_email } : {}),
        ...(body.user_display_name !== undefined ? { user_display_name: body.user_display_name } : {}),
        ...(body.enabled !== undefined ? { enabled: body.enabled } : {}),
        updated_at: new Date(),
      })
      .where(eq(e2emGrants.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Grant not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "e2em grant update error");
    res.status(500).json({ error: "Failed to update grant" });
  }
});

router.delete("/e2em/grants/:id", async (req, res) => {
  if (!verifyAdminToken(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const id = Number(req.params["id"]);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(e2emGrants).where(eq(e2emGrants.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "e2em grant delete error");
    res.status(500).json({ error: "Failed to delete grant" });
  }
});

// ── Plan management ───────────────────────────────────────────────────────────

router.get("/plans", async (req, res) => {
  if (!verifyAdminToken(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const plans = await db.select().from(userPlans).orderBy(desc(userPlans.created_at));
    const usage = await db.select().from(aiUsage).orderBy(desc(aiUsage.updated_at));
    const usageByUser: Record<string, number> = {};
    for (const row of usage) {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      if (row.month === currentMonth) usageByUser[row.github_username] = row.count;
    }
    res.json(plans.map(p => ({ ...p, ai_usage_this_month: usageByUser[p.github_username] ?? 0 })));
  } catch (err) {
    req.log.error({ err }, "admin plans list error");
    res.status(500).json({ error: "Failed to list plans" });
  }
});

router.put("/plans/:username", async (req, res) => {
  if (!verifyAdminToken(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { username } = req.params;
  const { plan } = req.body as { plan: string };
  if (!["free", "plus", "pro", "team"].includes(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }
  try {
    await db.insert(userPlans)
      .values({ github_username: username, plan, updated_at: new Date() })
      .onConflictDoUpdate({
        target: [userPlans.github_username],
        set: { plan, updated_at: sql`now()` },
      });
    res.json({ ok: true, github_username: username, plan });
  } catch (err) {
    req.log.error({ err }, "admin plan update error");
    res.status(500).json({ error: "Failed to update plan" });
  }
});

router.delete("/plans/:username/usage", async (req, res) => {
  if (!verifyAdminToken(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { username } = req.params;
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await db.delete(aiUsage)
      .where(eq(aiUsage.github_username, username));
    res.json({ ok: true, reset: username, month: currentMonth });
  } catch (err) {
    req.log.error({ err }, "admin usage reset error");
    res.status(500).json({ error: "Failed to reset usage" });
  }
});

// ── Full user list (for Users management page) ────────────────────────────────

router.get("/users", async (req, res) => {
  if (!verifyAdminToken(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const plans = await db.select().from(userPlans).orderBy(desc(userPlans.created_at));
    const allUsage = await db.select().from(aiUsage).orderBy(desc(aiUsage.updated_at));

    // Build usage lookup by user
    const usageByUser: Record<string, { current_month: number; all_time: number; months: Array<{ month: string; count: number }> }> = {};
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    for (const row of allUsage) {
      if (!usageByUser[row.github_username]) {
        usageByUser[row.github_username] = { current_month: 0, all_time: 0, months: [] };
      }
      const u = usageByUser[row.github_username]!;
      u.all_time += row.count;
      u.months.push({ month: row.month, count: row.count });
      if (row.month === currentMonth) u.current_month = row.count;
    }

    res.json(plans.map(p => ({
      ...p,
      ai_usage_current_month: usageByUser[p.github_username]?.current_month ?? 0,
      ai_usage_all_time: usageByUser[p.github_username]?.all_time ?? 0,
      ai_usage_months: usageByUser[p.github_username]?.months ?? [],
    })));
  } catch (err) {
    req.log.error({ err }, "admin users list error");
    res.status(500).json({ error: "Failed to list users" });
  }
});

// Set AI credit count for a user's current month (allows adding or subtracting credits)
router.post("/users/:username/credits", async (req, res) => {
  if (!verifyAdminToken(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { username } = req.params;
  const { count } = req.body as { count?: number };
  if (typeof count !== "number" || count < 0 || !Number.isInteger(count)) {
    res.status(400).json({ error: "count must be a non-negative integer" });
    return;
  }
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await db.insert(aiUsage)
      .values({ github_username: username, month: currentMonth, count, updated_at: now })
      .onConflictDoUpdate({
        target: [aiUsage.github_username, aiUsage.month],
        set: { count, updated_at: now },
      });
    res.json({ ok: true, github_username: username, month: currentMonth, count });
  } catch (err) {
    req.log.error({ err }, "admin credits set error");
    res.status(500).json({ error: "Failed to set credits" });
  }
});

export default router;
