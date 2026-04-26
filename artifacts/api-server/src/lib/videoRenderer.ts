import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { db } from "@workspace/db";
import { hadarVideoJobs, hadarVideoTemplates } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { objectStorageClient } from "./objectStorage";
import { readFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { logger } from "./logger";

const TMP_DIR = "/tmp/hadar-videos";
const FONT_PATH = "/home/runner/workspace/artifacts/api-server/src/assets/NotoSansHebrew-Bold.ttf";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

export interface OverlayConfig {
  fieldId: string;
  x: number;          // percentage 0-100 of video width
  y: number;          // percentage 0-100 of video height
  fontSize: number;   // pt
  fontColor: string;  // hex or name e.g. "white"
  shadowColor?: string; // e.g. "black"
  align: "left" | "center" | "right";
  startTime: number;  // seconds
  endTime: number;    // seconds (0 = full video)
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

function ensureTmpDir() {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
}

/** Escape text for FFmpeg drawtext filter */
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

/** Convert hex color like #FFFFFF to FFmpeg color string */
function toFFmpegColor(color: string): string {
  return color.startsWith("#") ? color.slice(1) : color;
}

/**
 * Build the FFmpeg drawtext filter chain for all overlays.
 * Returns a single -vf filter string.
 */
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

    // Position: percentages → absolute pixels
    const endT = ov.endTime > 0 ? ov.endTime : videoDuration;
    const alignExpr =
      ov.align === "center"
        ? `(${videoWidth}*${ov.x / 100})-tw/2`
        : ov.align === "right"
        ? `(${videoWidth}*${ov.x / 100})-tw`
        : `(${videoWidth}*${ov.x / 100})`;

    const filter = [
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
    ].join(":");

    filters.push(filter);
  }

  return filters.length > 0 ? filters.join(",") : "null";
}

/**
 * Render a video job using FFmpeg.
 * Returns the output file path on success.
 */
async function renderVideo(
  jobId: number,
  baseVideoLocalPath: string,
  overlays: OverlayConfig[],
  fieldValues: Record<string, string>,
  videoWidth: number,
  videoHeight: number,
  videoDuration: number
): Promise<string> {
  ensureTmpDir();
  const outputPath = path.join(TMP_DIR, `${jobId}-${randomUUID()}.mp4`);

  const filterGraph = buildFilterGraph(
    overlays,
    fieldValues,
    videoWidth,
    videoHeight,
    videoDuration
  );

  const hasFilter = filterGraph !== "null";
  const args = [
    "-y",                          // overwrite output
    "-i", baseVideoLocalPath,
    ...(hasFilter ? ["-vf", filterGraph] : []),
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "22",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputPath,
  ];

  logger.info({ args }, `[VideoRenderer] Starting FFmpeg render for job ${jobId}`);

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) {
        logger.info(`[VideoRenderer] Job ${jobId} rendered OK → ${outputPath}`);
        resolve(outputPath);
      } else {
        logger.error(`[VideoRenderer] FFmpeg failed (code ${code}): ${stderr.slice(-2000)}`);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

/**
 * Download a video from a URL to a local tmp file.
 * Returns the local file path.
 */
async function downloadVideoToTmp(url: string): Promise<string> {
  // If it's a relative API path, fetch it from the local API server
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`Failed to download base video: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const tmpPath = path.join(TMP_DIR, `base-${randomUUID()}.mp4`);
  ensureTmpDir();
  const { writeFile } = await import("node:fs/promises");
  await writeFile(tmpPath, buffer);
  return tmpPath;
}

/**
 * Upload rendered video to object storage and return the storage URL.
 */
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
 * Main entry point: process a paid video job.
 * Called after Stripe payment confirmation.
 */
export async function processVideoJob(jobId: number): Promise<void> {
  logger.info(`[VideoRenderer] Processing job ${jobId}`);

  // Mark as rendering
  await db
    .update(hadarVideoJobs)
    .set({ status: "rendering", updatedAt: new Date() })
    .where(eq(hadarVideoJobs.id, jobId));

  let baseVideoTmpPath: string | null = null;

  try {
    // Load job + template
    const [job] = await db
      .select()
      .from(hadarVideoJobs)
      .where(eq(hadarVideoJobs.id, jobId));

    if (!job) throw new Error(`Job ${jobId} not found`);

    const [template] = await db
      .select()
      .from(hadarVideoTemplates)
      .where(eq(hadarVideoTemplates.id, job.templateId));

    if (!template) throw new Error(`Template ${job.templateId} not found`);

    const overlays = (template.overlays as OverlayConfig[]) ?? [];
    const fieldValues = (job.fieldValues as Record<string, string>) ?? {};

    // If no base video, generate a simple placeholder
    if (!template.baseVideoUrl) {
      throw new Error("Template has no base video uploaded yet");
    }

    // Download base video to tmp
    baseVideoTmpPath = await downloadVideoToTmp(template.baseVideoUrl);

    // Render
    const outputPath = await renderVideo(
      jobId,
      baseVideoTmpPath,
      overlays,
      fieldValues,
      template.videoWidth ?? 1920,
      template.videoHeight ?? 1080,
      template.videoDuration ?? 15
    );

    // Upload to object storage
    const outputUrl = await uploadRenderedVideo(outputPath, jobId);

    // Cleanup local render file
    await unlink(outputPath).catch(() => {});

    // Update job to ready
    await db
      .update(hadarVideoJobs)
      .set({ status: "ready", outputUrl, updatedAt: new Date() })
      .where(eq(hadarVideoJobs.id, jobId));

    logger.info(`[VideoRenderer] Job ${jobId} complete → ${outputUrl}`);
  } catch (err: any) {
    logger.error({ err }, `[VideoRenderer] Job ${jobId} failed`);
    await db
      .update(hadarVideoJobs)
      .set({ status: "failed", errorMessage: err.message, updatedAt: new Date() })
      .where(eq(hadarVideoJobs.id, jobId));
  } finally {
    if (baseVideoTmpPath) await unlink(baseVideoTmpPath).catch(() => {});
  }
}
