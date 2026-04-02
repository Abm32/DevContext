import { Router, type IRouter } from "express";
import { db, analyticsEvents } from "@workspace/db";
import { getTokenPayload } from "./auth";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const { event_type, page, element, session_id, metadata } = req.body as {
      event_type?: string;
      page?: string;
      element?: string;
      session_id?: string;
      metadata?: unknown;
    };

    if (!event_type || typeof event_type !== "string") {
      res.status(400).json({ error: "event_type required" });
      return;
    }

    const payload = getTokenPayload(req);

    await db.insert(analyticsEvents).values({
      event_type: event_type.slice(0, 60),
      page: page?.slice(0, 200),
      element: element?.slice(0, 100),
      session_id: session_id?.slice(0, 64),
      user_id: payload?.githubUser.id,
      user_login: payload?.githubUser.login,
      metadata: metadata ?? null,
    });

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to track event");
    res.status(500).json({ error: "Failed to track" });
  }
});

export default router;
