import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { db } from "@workspace/db";
import { hadarVideoJobs, hadarVideoTemplates } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { objectStorageClient } from "./objectStorage";
import { randomUUID } from "node:crypto";
import { logger } from "./logger";
import { sendVideoReadyEmail, sendVideoFailedEmail, sendAdminVideoFailedAlert } from "./emailService";

const TMP_DIR = "/tmp/hadar-videos";
const FONT_PATH = "/home/runner/workspace/artifacts/api-server/src/assets/NotoSansHebrew-Bold.ttf";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";
const APP_URL = process.env.APP_URL || "http://localhost";
const BASE_PATH = process.env.VITE_BASE_PATH || "/design-templates";

export interface OverlayConfig {
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

export interface FieldDef {
  id: string;
  label: string;
  type: "text" | "textarea";
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}

export interface PreRenderedAsset {
  id: string;
  label: string;
  url: string;
  type: "intro" | "outro" | "overlay";
  durationSecs?: number;
}

function ensureTmpDir() {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
}

function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/:/g, "\\:")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/%/g, "\\%");
}

function toFFmpegColor(color: string): string {
  return color.startsWith("#") ? color.slice(1) : color;
}

/** Parse HH:MM:SS.ss from FFmpeg stderr time= field → seconds */
function parseFFmpegTime(line: string): number | null {
  const m = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
  if (!m) return null;
  return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
}

function buildFilterGraph(
  overlays: OverlayConfig[],
  fieldValues: Record<string, string>,
  videoWidth: number,
  videoHeight: number,
  videoDuration: number
): string {
  const filters: string[] = [];
  for (const ov of overlays) {
    const rawText = fieldValues[ov.fieldId] ?? "";
    if (!rawText.trim()) continue;
    const text = escapeDrawtext(rawText);
    const color = toFFmpegColor(ov.fontColor || "FFFFFF");
    const shadowColor = toFFmpegColor(ov.shadowColor || "000000");
    const endT = ov.endTime > 0 ? ov.endTime : videoDuration;
    const alignExpr =
      ov.align === "center"
        ? `(${videoWidth}*${ov.x / 100})-tw/2`
        : ov.align === "right"
        ? `(${videoWidth}*${ov.x / 100})-tw`
        : `(${videoWidth}*${ov.x / 100})`;

    filters.push([
      `drawtext`,
      `fontfile=${FONT_PATH}`,
      `text='${text}'`,
      `fontsize=${ov.fontSize || 48}`,
      `fontcolor=${color}`,
      `shadowcolor=${shadowColor}@0.8`,
      `shadowx=2`,
      `shadowy=2`,
      `x=${alignExpr}`,
      `y=(${videoHeight}*${ov.y / 100})`,
      `text_shaping=1`,
      `enable='between(t,${ov.startTime},${endT})'`,
    ].join(":"));
  }
  return filters.length > 0 ? filters.join(",") : "null";
}

async function downloadToTmp(url: string, ext = "mp4"): Promise<string> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`Failed to download: ${fullUrl} → ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const tmpPath = path.join(TMP_DIR, `dl-${randomUUID()}.${ext}`);
  ensureTmpDir();
  await writeFile(tmpPath, buffer);
  return tmpPath;
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
 * Concatenate intro + main video + outro into a single MP4 using FFmpeg.
 * Returns the path of the concatenated file.
 */
async function concatenateSegments(segments: string[]): Promise<string> {
  if (segments.length === 1) return segments[0];
  ensureTmpDir();
  const listPath = path.join(TMP_DIR, `concat-${randomUUID()}.txt`);
  const outPath = path.join(TMP_DIR, `joined-${randomUUID()}.mp4`);
  const listContent = segments.map(s => `file '${s}'`).join("\n");
  await writeFile(listPath, listContent);
  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-y", "-f", "concat", "-safe", "0", "-i", listPath,
      "-c", "copy", outPath,
    ], { stdio: ["ignore", "pipe", "pipe"] });
    proc.on("close", (code) => {
      if (code === 0) resolve(); else reject(new Error(`FFmpeg concat failed (code ${code})`));
    });
    proc.on("error", reject);
  });
  await unlink(listPath).catch(() => {});
  return outPath;
}

interface RenderOptions {
  jobId: number;
  baseVideoPath: string;
  overlays: OverlayConfig[];
  fieldValues: Record<string, string>;
  videoWidth: number;
  videoHeight: number;
  videoDuration: number;
  renderPreset?: string;
  renderCrf?: number;
  maxRenderSeconds?: number;
  onProgress?: (pct: number) => void;
}

async function renderVideo(opts: RenderOptions): Promise<string> {
  ensureTmpDir();
  const outputPath = path.join(TMP_DIR, `${opts.jobId}-${randomUUID()}.mp4`);
  const filterGraph = buildFilterGraph(
    opts.overlays, opts.fieldValues,
    opts.videoWidth, opts.videoHeight, opts.videoDuration
  );
  const hasFilter = filterGraph !== "null";
  const preset = opts.renderPreset ?? "fast";
  const crf = opts.renderCrf ?? 22;
  const timeoutMs = (opts.maxRenderSeconds ?? 300) * 1000;

  const args = [
    "-y",
    "-i", opts.baseVideoPath,
    ...(hasFilter ? ["-vf", filterGraph] : []),
    "-c:v", "libx264",
    "-preset", preset,
    "-crf", String(crf),
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputPath,
  ];

  logger.info({ preset, crf, timeout: opts.maxRenderSeconds }, `[VideoRenderer] FFmpeg starting for job ${opts.jobId}`);

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    let killed = false;

    const killTimer = setTimeout(() => {
      killed = true;
      proc.kill("SIGKILL");
      reject(new Error(`Render timeout after ${opts.maxRenderSeconds}s`));
    }, timeoutMs);

    proc.stderr.on("data", (d: Buffer) => {
      const chunk = d.toString();
      stderr += chunk;
      // Parse progress from FFmpeg stderr
      const timeSec = parseFFmpegTime(chunk);
      if (timeSec !== null && opts.videoDuration > 0 && opts.onProgress) {
        const pct = Math.min(99, Math.round((timeSec / opts.videoDuration) * 100));
        opts.onProgress(pct);
      }
    });

    proc.on("close", (code) => {
      clearTimeout(killTimer);
      if (killed) return;
      if (code === 0) {
        opts.onProgress?.(99);
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-1500)}`));
      }
    });

    proc.on("error", (err) => {
      clearTimeout(killTimer);
      reject(err);
    });
  });
}

/**
 * Main entry point: process a queued + paid video job.
 * Called by the render queue after Stripe payment confirmation.
 */
export async function processVideoJob(
  jobId: number,
  onProgress?: (pct: number) => void
): Promise<void> {
  logger.info(`[VideoRenderer] Processing job ${jobId}`);

  // Mark as rendering
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

    if (!template.baseVideoUrl) throw new Error("Template has no base video uploaded yet");

    // Download base video
    await writeProgress(5);
    const baseVideoPath = await downloadToTmp(template.baseVideoUrl);
    tmpPaths.push(baseVideoPath);

    // Download + concatenate pre-rendered assets (intro/outro)
    const preRenderedAssets = (template.preRenderedAssets as PreRenderedAsset[]) ?? [];
    const introAssets = preRenderedAssets.filter(a => a.type === "intro");
    const outroAssets = preRenderedAssets.filter(a => a.type === "outro");

    const segmentsToConcat: string[] = [];

    for (const asset of introAssets) {
      await writeProgress(8);
      const introPath = await downloadToTmp(asset.url.startsWith("http") ? asset.url : asset.url);
      tmpPaths.push(introPath);
      segmentsToConcat.push(introPath);
    }

    segmentsToConcat.push(baseVideoPath);

    for (const asset of outroAssets) {
      await writeProgress(10);
      const outroPath = await downloadToTmp(asset.url);
      tmpPaths.push(outroPath);
      segmentsToConcat.push(outroPath);
    }

    // Concatenate if needed
    let inputForRender = baseVideoPath;
    if (segmentsToConcat.length > 1) {
      await writeProgress(12);
      inputForRender = await concatenateSegments(segmentsToConcat);
      tmpPaths.push(inputForRender);
    }

    // Render with text overlays
    await writeProgress(15);
    const overlays = (template.overlays as OverlayConfig[]) ?? [];
    const fieldValues = (job.fieldValues as Record<string, string>) ?? {};

    const outputPath = await renderVideo({
      jobId,
      baseVideoPath: inputForRender,
      overlays,
      fieldValues,
      videoWidth: template.videoWidth ?? 1920,
      videoHeight: template.videoHeight ?? 1080,
      videoDuration: template.videoDuration ?? 15,
      renderPreset: template.renderPreset ?? "fast",
      renderCrf: template.renderCrf ?? 22,
      maxRenderSeconds: template.maxRenderSeconds ?? 300,
      onProgress: (pct) => {
        // Map render progress (0-100) into 15-95 range
        writeProgress(15 + Math.round(pct * 0.8));
      },
    });
    tmpPaths.push(outputPath);

    // Upload to object storage
    await writeProgress(97);
    const outputUrl = await uploadRenderedVideo(outputPath, jobId);

    // Finalize job
    const now = new Date();
    await db
      .update(hadarVideoJobs)
      .set({
        status: "ready",
        outputUrl,
        progressPct: 100,
        renderCompletedAt: now,
        estimatedCompletionAt: null,
        updatedAt: now,
      })
      .where(eq(hadarVideoJobs.id, jobId));

    logger.info(`[VideoRenderer] Job ${jobId} complete → ${outputUrl}`);

    // Send email notification
    if (job.userEmail) {
      const downloadUrl = `${APP_URL}${BASE_PATH}/my-videos`;
      sendVideoReadyEmail({
        to: job.userEmail,
        name: job.userName ?? "",
        videoTitle: template.title,
        jobId,
        downloadUrl,
      }).catch((err: Error) => logger.error({ err }, "[VideoRenderer] Email send failed"));

      // Mark notified
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

    // Notify user + admin on failure
    const [job] = await db.select().from(hadarVideoJobs).where(eq(hadarVideoJobs.id, jobId)).catch(() => [null]);
    const [template] = job
      ? await db.select().from(hadarVideoTemplates).where(eq(hadarVideoTemplates.id, job.templateId)).catch(() => [null])
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
