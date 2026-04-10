import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { userPlans } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getTokenPayload } from "./auth";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require("razorpay") as typeof import("razorpay").default;

const router: IRouter = Router();

const KEY_ID = process.env["RAZORPAY_KEY_ID"] ?? "";
const KEY_SECRET = process.env["RAZORPAY_KEY_SECRET"] ?? "";

// ₹999/month for Pro plan
const PRO_AMOUNT_PAISE = 99900; // Razorpay uses paise (1 INR = 100 paise)
const CURRENCY = "INR";

function getRazorpay() {
  return new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
}

// ─── POST /api/payments/create-order ─────────────────────────────────────────
router.post("/create-order", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) { res.status(401).json({ error: "Not authenticated" }); return; }

  try {
    const rzp = getRazorpay();
    const order = await rzp.orders.create({
      amount: PRO_AMOUNT_PAISE,
      currency: CURRENCY,
      receipt: `devctx_${payload.githubUser.login}_${Date.now()}`,
      notes: {
        github_username: payload.githubUser.login,
        plan: "pro",
      },
    });

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: KEY_ID,
      prefill: {
        name: payload.githubUser.name ?? payload.githubUser.login,
      },
    });
  } catch (err) {
    req.log.error({ err }, "payments/create-order error");
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// ─── POST /api/payments/verify ────────────────────────────────────────────────
router.post("/verify", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: "Missing payment verification fields" });
    return;
  }

  // Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400).json({ error: "Invalid payment signature" });
    return;
  }

  try {
    const username = payload.githubUser.login;

    // Upsert plan to pro
    await db
      .insert(userPlans)
      .values({
        github_username: username,
        plan: "pro",
        razorpay_payment_id,
        razorpay_order_id,
      })
      .onConflictDoUpdate({
        target: [userPlans.github_username],
        set: {
          plan: "pro",
          razorpay_payment_id,
          razorpay_order_id,
          updated_at: new Date(),
        },
      });

    res.json({ success: true, plan: "pro" });
  } catch (err) {
    req.log.error({ err }, "payments/verify error");
    res.status(500).json({ error: "Failed to upgrade plan" });
  }
});

export default router;
