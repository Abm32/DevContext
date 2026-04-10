import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { userPlans, PLAN_PRICES, type PlanTier } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getTokenPayload } from "./auth";

// ─── Plan rank hierarchy (downgrade prevention) ───────────────────────────────
const PLAN_RANK: Record<PlanTier, number> = { free: 0, plus: 1, pro: 2, team: 3 };

async function getCurrentPlan(username: string): Promise<PlanTier> {
  const [row] = await db.select({ plan: userPlans.plan }).from(userPlans).where(eq(userPlans.github_username, username)).limit(1);
  return (row?.plan as PlanTier | undefined) ?? "free";
}

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

  // ── Downgrade guard: reject if requested plan is at or below current plan ──
  try {
    const currentPlan = await getCurrentPlan(payload.githubUser.login);
    if (PLAN_RANK[paidPlan] <= PLAN_RANK[currentPlan]) {
      res.status(400).json({
        error: currentPlan === paidPlan
          ? "You are already on this plan"
          : "Downgrades are not supported. Please contact support."
      });
      return;
    }
  } catch (_e) { /* non-fatal — proceed if DB lookup fails */ }

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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: "Missing payment verification fields" });
    return;
  }

  // ── 1. Verify HMAC-SHA256 signature ────────────────────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400).json({ error: "Invalid payment signature" });
    return;
  }

  try {
    // ── 2. Fetch the order from Razorpay server-side to read the plan ─────────
    //     We NEVER trust the client for which plan to activate.
    const rzp = getRazorpay();
    const order = await rzp.orders.fetch(razorpay_order_id);
    const notes = order.notes as Record<string, string> | undefined;

    const planFromNotes = notes?.["plan"];
    if (!planFromNotes || !VALID_PAID_PLANS.includes(planFromNotes as PaidPlan)) {
      req.log.error({ planFromNotes, order_id: razorpay_order_id }, "Invalid plan in order notes");
      res.status(400).json({ error: "Could not determine plan from order" });
      return;
    }

    const activatedPlan = planFromNotes as PaidPlan;

    // ── 3. Verify the order amount matches the plan's expected price ──────────
    const expectedAmount = PLAN_PRICES[activatedPlan].amount_paise;
    if (Number(order.amount) !== expectedAmount) {
      req.log.error(
        { activatedPlan, orderAmount: order.amount, expectedAmount },
        "Order amount does not match plan price"
      );
      res.status(400).json({ error: "Payment amount does not match plan price" });
      return;
    }

    // ── 4. Verify the order is for the authenticated user ─────────────────────
    const usernameFromNotes = notes?.["github_username"];
    if (usernameFromNotes && usernameFromNotes !== payload.githubUser.login) {
      req.log.error(
        { usernameFromNotes, authenticatedUser: payload.githubUser.login },
        "Order user mismatch"
      );
      res.status(400).json({ error: "Order does not belong to current user" });
      return;
    }

    // ── 5. Guard against downgrade (e.g. concurrent session confusion) ───────
    const currentPlan = await getCurrentPlan(payload.githubUser.login);
    if (PLAN_RANK[activatedPlan] <= PLAN_RANK[currentPlan]) {
      req.log.warn({ activatedPlan, currentPlan }, "Rejected plan activation: downgrade attempt");
      res.status(400).json({
        error: currentPlan === activatedPlan
          ? "You are already on this plan"
          : "Downgrades are not supported. Please contact support."
      });
      return;
    }

    // ── 6. Activate the plan ──────────────────────────────────────────────────
    const username = payload.githubUser.login;
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
