import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Pre-warm DB connections so the first real request isn't slow
  pool.query("SELECT 1").catch(() => {});

  // Initialize render queue processor (must happen after server is listening)
  import("./lib/renderQueue").then(({ renderQueue }) => {
    import("./lib/videoRenderer").then(({ processVideoJob }) => {
      renderQueue.setProcessor(processVideoJob);
      logger.info(`[RenderQueue] Processor registered. Concurrency: ${renderQueue.concurrency}`);
    });
  }).catch((err: Error) => logger.error({ err }, "Failed to initialize render queue"));
});
