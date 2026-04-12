import { Router, type IRouter } from "express";
import healthRouter from "./health";
import youtubeRouter from "./youtube";
import askRabbiRouter from "./ask-rabbi";
import postsRouter from "./posts";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(youtubeRouter);
router.use(askRabbiRouter);
router.use(postsRouter);
router.use(adminRouter);

export default router;
