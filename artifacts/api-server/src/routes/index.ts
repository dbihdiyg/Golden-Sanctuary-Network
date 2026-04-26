import { Router, type IRouter } from "express";
import healthRouter from "./health";
import youtubeRouter from "./youtube";
import askRabbiRouter from "./ask-rabbi";
import postsRouter from "./posts";
import adminRouter from "./admin";
import profileRouter from "./profile";
import forumRouter from "./forum";
import mediaSubmissionsRouter from "./media-submissions";
import newsletterRouter from "./newsletter";
import chatbotRouter from "./chatbot";
import analyticsRouter from "./analytics";
import hadarAiRouter from "./hadar-ai";
import hadarStripeRouter from "./hadar-stripe";
import hadarDesignsRouter from "./hadar-designs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(youtubeRouter);
router.use(askRabbiRouter);
router.use(postsRouter);
router.use(adminRouter);
router.use(profileRouter);
router.use(forumRouter);
router.use(mediaSubmissionsRouter);
router.use("/newsletter", newsletterRouter);
router.use("/chatbot", chatbotRouter);
router.use(analyticsRouter);
router.use(hadarAiRouter);
router.use(hadarStripeRouter);
router.use(hadarDesignsRouter);

export default router;
