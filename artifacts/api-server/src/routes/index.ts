import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import githubRouter from "./github";
import aiRouter from "./ai";
import trackRouter from "./track";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/github", githubRouter);
router.use("/ai", aiRouter);
router.use("/track", trackRouter);
router.use("/admin", adminRouter);

export default router;
