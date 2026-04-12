import { Router, type IRouter } from "express";
import healthRouter from "./health";
import youtubeRouter from "./youtube";
import askRabbiRouter from "./ask-rabbi";

const router: IRouter = Router();

router.use(healthRouter);
router.use(youtubeRouter);
router.use(askRabbiRouter);

export default router;
