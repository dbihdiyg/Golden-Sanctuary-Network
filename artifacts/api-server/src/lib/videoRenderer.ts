import { existsSync, mkdirSync } from "node:fs";
import { writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { db } from "@workspace/db";
import { hadarVideoJobs, hadarVideoTemplates } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { objectStorageClient } from "./objectStorage";
import { randomUUID } from "node:crypto";
import { logger } from "./logger";
import { sendVideoReadyEmail, sendVideoFailedEmail, sendAdminVideoFailedAlert } from "./emailService";
import { renderWithNexrender, isNexrenderConfigured, type AeLayerMapping } from "./nexrenderService";
import { getDownloadUrl } from "./signedUrls";
import { readFile } from "node:fs/promises";

const TMP_DIR = "/tmp/hadar-videos";
const APP_URL = process.env.APP_URL || "http://localhost";
const BASE_PATH = process.env.VITE_BASE_PATH || "/design-templates";

function ensureTmpDir() {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
}

async function uploadRenderedVideo(localPath: string, jobId: number): Promise<string> {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) throw new Error("Object storage not configured");
  const buffer = await readFile(localPath);
  const storagePath = `hadar-videos/output/${jobId}-${randomUUID()}.mp4`;
  const bucket = objectStorageClient.bucket(bucketId);
  const file = bucket.file(storagePath);
  await file.save(buffer, { metadata: { contentType: "video/mp4" } });
  return `/api/hadar/media/${storagePath}`;
}

/**
 * Main entry point: process a queued + paid video job.
 * Only After Effects / nexrender rendering is supported.
 * If NEXRENDER_API_URL is not configured, the job fails immediately with a clear error.
 */
export async function processVideoJob(
  jobId: number,
  onProgress?: (pct: number) => void
): Promise<void> {
  logger.info(`[VideoRenderer] Processing job ${jobId} (AE-only mode)`);

  await db
    .update(hadarVideoJobs)
    .set({ status: "rendering", renderStartedAt: new Date(), progressPct: 0, updatedAt: new Date() })
    .where(eq(hadarVideoJobs.id, jobId));

  const tmpPaths: string[] = [];

  const writeProgress = async (pct: number) => {
    onProgress?.(pct);
    await db
      .update(hadarVideoJobs)
      .set({ progressPct: pct, updatedAt: new Date() })
      .where(eq(hadarVideoJobs.id, jobId))
      .catch(() => {});
  };

  try {
    if (!isNexrenderConfigured()) {
      throw new Error(
        "NEXRENDER_API_URL is not configured. Please set NEXRENDER_API_URL in the environment variables to point to a running nexrender server. " +
        "Rendering requires After Effects + nexrender. See admin panel for setup instructions."
      );
    }

    const [job] = await db.select().from(hadarVideoJobs).where(eq(hadarVideoJobs.id, jobId));
    if (!job) throw new Error(`Job ${jobId} not found`);

    const [template] = await db.select().from(hadarVideoTemplates).where(eq(hadarVideoTemplates.id, job.templateId));
    if (!template) throw new Error(`Template ${job.templateId} not found`);

    const aeProjectUrl = (template as any).aeProjectUrl;
    if (!aeProjectUrl) {
      throw new Error(
        `Template "${template.title}" has no After Effects project uploaded. ` +
        "Please upload an .aep or .zip file in the admin panel → Video → Templates."
      );
    }

    await db
      .update(hadarVideoJobs)
      .set({ rendererUsed: "aefx", updatedAt: new Date() })
      .where(eq(hadarVideoJobs.id, jobId))
      .catch(() => {});

    const aeLayerMappings = ((template as any).aeLayerMappings as AeLayerMapping[]) ?? [];
    const fieldValues = (job.fieldValues as Record<string, string>) ?? {};

    await writeProgress(5);

    ensureTmpDir();
    const outputPath = await renderWithNexrender(jobId, {
      aeProjectUrl,
      aeCompositionName: (template as any).aeCompositionName ?? "MAIN_COMP",
      fieldValues,
      layerMappings: aeLayerMappings,
      maxWaitSeconds: (template as any).maxRenderSeconds ?? 600,
    }, writeProgress);

    tmpPaths.push(outputPath);
    await writeProgress(97);

    const outputUrl = await uploadRenderedVideo(outputPath, jobId);

    const now = new Date();
    await db
      .update(hadarVideoJobs)
      .set({
        status: "ready",
        outputUrl,
        progressPct: 100,
        renderCompletedAt: now,
        estimatedCompletionAt: null,
        rendererUsed: "aefx",
        updatedAt: now,
      })
      .where(eq(hadarVideoJobs.id, jobId));

    logger.info(`[VideoRenderer] AE job ${jobId} complete → ${outputUrl}`);

    if (job.userEmail) {
      const signedLink = getDownloadUrl(jobId, APP_URL);
      sendVideoReadyEmail({
        to: job.userEmail,
        name: job.userName ?? "",
        videoTitle: template.title,
        jobId,
        downloadUrl: signedLink,
      }).catch((err: Error) => logger.error({ err }, "[VideoRenderer] Email send failed"));
      await db
        .update(hadarVideoJobs)
        .set({ notifiedAt: new Date() })
        .where(eq(hadarVideoJobs.id, jobId))
        .catch(() => {});
    }
  } catch (err: any) {
    logger.error({ err }, `[VideoRenderer] Job ${jobId} failed`);
    await db
      .update(hadarVideoJobs)
      .set({
        status: "failed",
        errorMessage: err.message,
        progressPct: 0,
        updatedAt: new Date(),
      })
      .where(eq(hadarVideoJobs.id, jobId));

    const [job] = await db.select().from(hadarVideoJobs).where(eq(hadarVideoJobs.id, jobId)).catch(() => [null]);
    const [template] = job
      ? await db.select().from(hadarVideoTemplates).where(eq(hadarVideoTemplates.id, job!.templateId)).catch(() => [null])
      : [null];

    if (job?.userEmail && template) {
      sendVideoFailedEmail({
        to: job.userEmail,
        name: job.userName ?? "",
        videoTitle: template.title,
        jobId,
        supportUrl: `${APP_URL}${BASE_PATH}/support`,
      }).catch(() => {});
    }
    if (template) {
      sendAdminVideoFailedAlert({ jobId, videoTitle: template.title, error: err.message }).catch(() => {});
    }
  } finally {
    for (const p of tmpPaths) {
      await unlink(p).catch(() => {});
    }
  }
}
