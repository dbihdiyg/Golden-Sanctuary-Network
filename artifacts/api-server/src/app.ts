import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Stripe webhook: raw body ONLY for this path, must come before express.json()
app.use("/api/hadar/webhook", express.raw({ type: "application/json" }));

// JSON body parser for all other routes
app.use(express.json({ limit: "15mb" }));

app.use(clerkMiddleware());

app.use("/api", router);

export default app;
