import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import githubRouter from "./github";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/github", githubRouter);
router.use("/ai", aiRouter);

export default router;
