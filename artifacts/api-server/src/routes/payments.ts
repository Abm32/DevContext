import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { userPlans, PLAN_PRICES, type PlanTier } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getTokenPayload } from "./auth";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require("razorpay") as typeof import("razorpay").default;

const router: IRouter = Router();

const KEY_ID = process.env["RAZORPAY_KEY_ID"] ?? "";
const KEY_SECRET = process.env["RAZORPAY_KEY_SECRET"] ?? "";
const CURRENCY = "INR";

function getRazorpay() {
  return new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
}

type PaidPlan = Exclude<PlanTier, "free">;
const VALID_PAID_PLANS: PaidPlan[] = ["plus", "pro", "team"];

// ─── POST /api/payments/create-order ─────────────────────────────────────────
router.post("/create-order", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { plan = "pro" } = req.body as { plan?: string };
  if (!VALID_PAID_PLANS.includes(plan as PaidPlan)) {
    res.status(400).json({ error: `Invalid plan. Choose from: ${VALID_PAID_PLANS.join(", ")}` });
    return;
  }

  const paidPlan = plan as PaidPlan;
  const pricing = PLAN_PRICES[paidPlan];

  try {
    const rzp = getRazorpay();
    const order = await rzp.orders.create({
      amount: pricing.amount_paise,
      currency: CURRENCY,
      receipt: `devctx_${payload.githubUser.login}_${paidPlan}_${Date.now()}`,
      notes: {
        github_username: payload.githubUser.login,
        plan: paidPlan,
      },
    });

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: KEY_ID,
      plan: paidPlan,
      plan_label: pricing.label,
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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = "pro" } = req.body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    plan?: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: "Missing payment verification fields" });
    return;
  }

  if (!VALID_PAID_PLANS.includes(plan as PaidPlan)) {
    res.status(400).json({ error: "Invalid plan specified" });
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
    const activatedPlan = plan as PaidPlan;

    await db
      .insert(userPlans)
      .values({
        github_username: username,
        plan: activatedPlan,
        razorpay_payment_id,
        razorpay_order_id,
      })
      .onConflictDoUpdate({
        target: [userPlans.github_username],
        set: {
          plan: activatedPlan,
          razorpay_payment_id,
          razorpay_order_id,
          updated_at: new Date(),
        },
      });

    res.json({ success: true, plan: activatedPlan });
  } catch (err) {
    req.log.error({ err }, "payments/verify error");
    res.status(500).json({ error: "Failed to upgrade plan" });
  }
});

export default router;
