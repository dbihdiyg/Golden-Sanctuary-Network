import { existsSync, mkdirSync, createWriteStream } from "node:fs";
import { writeFile, unlink, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
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

const TMP_DIR = "/tmp/hadar-videos";
const APP_URL = process.env.APP_URL || "http://localhost";
const BASE_PATH = process.env.VITE_BASE_PATH || "/design-templates";

function ensureTmpDir() {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
}

interface VideoOverlay {
  fieldId: string;
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  shadowColor?: string;
  align: "left" | "center" | "right";
  startTime: number;
  endTime: number;
}

async function downloadFromStorage(storagePath: string, localPath: string): Promise<void> {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) throw new Error("Object storage not configured");
  const bucket = objectStorageClient.bucket(bucketId);
  const file = bucket.file(storagePath);
  const [exists] = await file.exists();
  if (!exists) throw new Error(`File not found in storage: ${storagePath}`);
  await new Promise<void>((resolve, reject) => {
    file.createReadStream()
      .on("error", reject)
      .pipe(createWriteStream(localPath))
      .on("finish", resolve)
      .on("error", reject);
  });
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

// ─── FFmpeg renderer (for renderType: "ffmpeg" templates) ─────────────────────
async function renderWithFFmpeg(
  jobId: number,
  baseVideoUrl: string,
  overlays: VideoOverlay[],
  fieldValues: Record<string, string>,
  writeProgress: (pct: number) => Promise<void>
): Promise<string> {
  ensureTmpDir();

  // Extract storage path: "/api/hadar/media/hadar-videos/foo.mp4" → "hadar-videos/foo.mp4"
  const storagePath = baseVideoUrl.replace(/^\/api\/hadar\/media\//, "");

  const tmpInputPath = path.join(TMP_DIR, `ffmpeg-in-${jobId}-${randomUUID()}.mp4`);
  await downloadFromStorage(storagePath, tmpInputPath);
  await writeProgress(25);

  // Build drawtext filter chain
  const activeOverlays = overlays.filter(ov => fieldValues[ov.fieldId]?.trim());
  const filterParts = activeOverlays.map(ov => {
    const rawText = (fieldValues[ov.fieldId] ?? "").trim();
    // Escape for FFmpeg: single quotes and colons
    const escapedText = rawText
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\u2019") // replace straight quote with curly to avoid escaping issues
      .replace(/:/g, "\\:");

    const hexColor = (ov.fontColor || "#FFFFFF").replace("#", "0x");
    const hexShadow = (ov.shadowColor || "#000000").replace("#", "0x");
    const xExpr =
      ov.align === "center" ? `(w-text_w)/2`
      : ov.align === "right" ? `w*${(ov.x / 100).toFixed(4)}-text_w`
      : `w*${(ov.x / 100).toFixed(4)}`;
    const yExpr = `h*${(ov.y / 100).toFixed(4)}-text_h/2`;
    const hasTime = ov.endTime > 0;
    const enableExpr = hasTime ? `:enable='between(t,${ov.startTime},${ov.endTime})'` : "";

    return `drawtext=text='${escapedText}':x=${xExpr}:y=${yExpr}:fontsize=${ov.fontSize}:fontcolor=${hexColor}:shadowcolor=${hexShadow}:shadowx=2:shadowy=2${enableExpr}`;
  });

  const outputPath = path.join(TMP_DIR, `ffmpeg-out-${jobId}-${randomUUID()}.mp4`);
  await writeProgress(35);

  await new Promise<void>((resolve, reject) => {
    const args: string[] = ["-i", tmpInputPath];
    if (filterParts.length > 0) {
      args.push("-vf", filterParts.join(","));
    } else {
      args.push("-c:v", "copy");
    }
    args.push("-c:a", "copy", "-y", outputPath);

    logger.info({ jobId, filters: filterParts.length }, "[FFmpeg] Starting render");

    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    const stderrLines: string[] = [];
    proc.stderr?.on("data", (d: Buffer) => {
      stderrLines.push(d.toString());
    });
    proc.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        const lastLines = stderrLines.join("").split("\n").slice(-5).join("\n");
        reject(new Error(`FFmpeg exited with code ${code}. Last output:\n${lastLines}`));
      }
    });
    proc.on("error", (e) => reject(new Error(`FFmpeg not found: ${e.message}. Ensure ffmpeg is installed.`)));
  });

  await unlink(tmpInputPath).catch(() => {});
  await writeProgress(90);
  return outputPath;
}

/**
 * Main entry point: process a queued + paid video job.
 *
 * - renderType "ffmpeg": renders using FFmpeg text overlays on baseVideoUrl.
 * - renderType "aefx": renders using After Effects via nexrender.
 *   Requires NEXRENDER_API_URL. If not configured, throws a clear error immediately.
 */
export async function processVideoJob(
  jobId: number,
  onProgress?: (pct: number) => void
): Promise<void> {
  logger.info(`[VideoRenderer] Processing job ${jobId}`);

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
    const [job] = await db.select().from(hadarVideoJobs).where(eq(hadarVideoJobs.id, jobId));
    if (!job) throw new Error(`Job ${jobId} not found`);

    const [template] = await db.select().from(hadarVideoTemplates).where(eq(hadarVideoTemplates.id, job.templateId));
    if (!template) throw new Error(`Template ${job.templateId} not found`);

    const renderType = (template as any).renderType ?? "ffmpeg";
    const fieldValues = (job.fieldValues as Record<string, string>) ?? {};

    let outputPath: string;

    if (renderType === "aefx") {
      // ── After Effects path ────────────────────────────────────────────────
      if (!isNexrenderConfigured()) {
        throw new Error(
          "NEXRENDER_API_URL is not configured. This is an After Effects Premium template. " +
          "Please set NEXRENDER_API_URL in the environment variables to point to a running nexrender server. " +
          "See the admin panel → Statistics for setup instructions."
        );
      }

      const aeProjectUrl = (template as any).aeProjectUrl;
      if (!aeProjectUrl) {
        throw new Error(
          `Template "${template.title}" has no After Effects project uploaded. ` +
          "Please upload an .aep or .zip file in Admin → Video → Templates."
        );
      }

      await db
        .update(hadarVideoJobs)
        .set({ rendererUsed: "aefx", updatedAt: new Date() })
        .where(eq(hadarVideoJobs.id, jobId))
        .catch(() => {});

      const aeLayerMappings = ((template as any).aeLayerMappings as AeLayerMapping[]) ?? [];
      await writeProgress(5);

      ensureTmpDir();
      outputPath = await renderWithNexrender(jobId, {
        aeProjectUrl,
        aeCompositionName: (template as any).aeCompositionName ?? "MAIN_COMP",
        fieldValues,
        layerMappings: aeLayerMappings,
        maxWaitSeconds: (template as any).maxRenderSeconds ?? 600,
      }, writeProgress);

    } else {
      // ── FFmpeg path ───────────────────────────────────────────────────────
      const baseVideoUrl = (template as any).baseVideoUrl;
      if (!baseVideoUrl) {
        throw new Error(
          `Template "${template.title}" has no base video uploaded. ` +
          "Please upload a base video in Admin → Video → Templates."
        );
      }

      await db
        .update(hadarVideoJobs)
        .set({ rendererUsed: "ffmpeg", updatedAt: new Date() })
        .where(eq(hadarVideoJobs.id, jobId))
        .catch(() => {});

      const overlays = ((template as any).overlays as VideoOverlay[]) ?? [];
      await writeProgress(10);

      outputPath = await renderWithFFmpeg(jobId, baseVideoUrl, overlays, fieldValues, writeProgress);
    }

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
        rendererUsed: renderType,
        updatedAt: now,
      })
      .where(eq(hadarVideoJobs.id, jobId));

    logger.info(`[VideoRenderer] Job ${jobId} complete (${renderType}) → ${outputUrl}`);

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
