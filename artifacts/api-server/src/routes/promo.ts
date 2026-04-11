import { Router, type IRouter } from "express";
import { db, promoCodes, promoRedemptions, aiUsage, userPlans } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getTokenPayload } from "./auth";

const router: IRouter = Router();

router.post("/redeem", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { code } = req.body as { code?: string };
  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Code is required" });
    return;
  }

  const upperCode = code.trim().toUpperCase();
  const username = payload.githubUser.login;

  try {
    const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, upperCode));

    if (!promo) {
      res.status(404).json({ error: "Invalid promo code" });
      return;
    }
    if (!promo.is_active) {
      res.status(400).json({ error: "This promo code is no longer active" });
      return;
    }
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      res.status(400).json({ error: "This promo code has expired" });
      return;
    }
    if (promo.claims_count >= promo.max_claims) {
      res.status(400).json({ error: "This promo code has reached its claim limit" });
      return;
    }

    const [existing] = await db
      .select()
      .from(promoRedemptions)
      .where(eq(promoRedemptions.code, upperCode))
      .where(eq(promoRedemptions.github_username, username));

    if (existing) {
      res.status(400).json({ error: "You have already redeemed this code" });
      return;
    }

    await db.insert(promoRedemptions).values({ code: upperCode, github_username: username });

    await db
      .update(promoCodes)
      .set({ claims_count: sql`${promoCodes.claims_count} + 1` })
      .where(eq(promoCodes.code, upperCode));

    if (promo.bonus_credits > 0) {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      await db
        .insert(aiUsage)
        .values({ github_username: username, month: currentMonth, count: 0 })
        .onConflictDoNothing();
      await db
        .update(aiUsage)
        .set({ count: sql`${aiUsage.count} - ${promo.bonus_credits}`, updated_at: now })
        .where(eq(aiUsage.github_username, username))
        .where(eq(aiUsage.month, currentMonth));
    }

    if (promo.plan_override) {
      const now = new Date();
      await db
        .insert(userPlans)
        .values({ github_username: username, plan: promo.plan_override, updated_at: now })
        .onConflictDoUpdate({
          target: [userPlans.github_username],
          set: { plan: promo.plan_override, updated_at: now },
        });
    }

    res.json({
      ok: true,
      message: promo.plan_override
        ? `🎉 Code applied! Your plan has been upgraded to ${promo.plan_override}${promo.bonus_credits > 0 ? ` and ${promo.bonus_credits} bonus AI analyses have been added` : ""}.`
        : `🎉 Code applied! ${promo.bonus_credits} bonus AI analyses have been added to your account.`,
      bonus_credits: promo.bonus_credits,
      plan_override: promo.plan_override ?? null,
    });
  } catch (err) {
    console.error("promo redeem error", err);
    res.status(500).json({ error: "Failed to redeem code" });
  }
});

export default router;
