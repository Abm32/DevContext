import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import githubRouter from "./github";
import depsRouter from "./deps";
import aiRouter from "./ai";
import trackRouter from "./track";
import adminRouter from "./admin";
import e2emRouter from "./e2em";
import planRouter from "./plan";
import paymentsRouter from "./payments";
import promoRouter from "./promo";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/github", githubRouter);
router.use("/github", depsRouter);
router.use("/ai", aiRouter);
router.use("/track", trackRouter);
router.use("/admin", adminRouter);
router.use("/e2em", e2emRouter);
router.use("/plan", planRouter);
router.use("/payments", paymentsRouter);
router.use("/promo", promoRouter);

export default router;
