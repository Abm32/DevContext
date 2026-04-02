import { Router, type IRouter, type Request } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

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
    const [uniqueUsers, totalEvents, eventsByType, dailyEvents, recentEvents] = await Promise.all([
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
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
