/**
 * Nexrender integration for After Effects premium rendering.
 *
 * Requires an external nexrender server (open-source, self-hostable).
 * Set NEXRENDER_API_URL to point to your server, e.g. http://nexrender-host:3050
 * If not configured, falls back with a warning.
 *
 * Nexrender docs: https://github.com/inlife/nexrender
 */
import { logger } from "./logger";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";

export interface AeLayerMapping {
  fieldId: string;        // our field ID (e.g. "bride_name")
  aeLayerName: string;    // AE text layer name (e.g. "BRIDE_NAME")
  aeProperty?: string;    // AE property, default "Source Text"
}

export interface NexrenderJobOptions {
  aeProjectUrl: string;                    // URL to the .aep file or zip package
  aeCompositionName: string;               // AE composition to render
  fieldValues: Record<string, string>;     // user-submitted field values
  layerMappings: AeLayerMapping[];         // field → AE layer mapping
  outputFormat?: "h264" | "h264-alpha";    // output codec
  maxWaitSeconds?: number;                 // timeout
}

export interface NexrenderJobResult {
  nexrenderJobId: string;
  outputPath: string;
}

const NEXRENDER_URL = process.env.NEXRENDER_API_URL?.replace(/\/$/, "");
const NEXRENDER_SECRET = process.env.NEXRENDER_SECRET || "";
const TMP_DIR = "/tmp/hadar-videos/nexrender";

function nexrenderHeaders() {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (NEXRENDER_SECRET) h["nexrender-secret"] = NEXRENDER_SECRET;
  return h;
}

/**
 * Returns true if nexrender is configured and available.
 */
export function isNexrenderConfigured(): boolean {
  return !!NEXRENDER_URL;
}

/**
 * Build the nexrender job payload from template + user data.
 */
function buildNexrenderJob(opts: NexrenderJobOptions): object {
  const composition = opts.aeCompositionName || "MAIN_COMP";

  // Each field value becomes a nexrender "data" asset
  const assets = opts.layerMappings
    .filter(m => m.aeLayerName && opts.fieldValues[m.fieldId])
    .map(m => ({
      type: "data",
      layerName: m.aeLayerName,
      property: m.aeProperty || "Source Text",
      value: opts.fieldValues[m.fieldId] ?? "",
    }));

  return {
    template: {
      src: opts.aeProjectUrl.startsWith("http")
        ? opts.aeProjectUrl
        : `${process.env.API_BASE_URL || "http://localhost:8080"}${opts.aeProjectUrl}`,
      composition,
    },
    assets,
    actions: {
      postrender: [
        {
          module: "@nexrender/action-encode",
          output: "output.mp4",
          params: {
            codec: "libx264",
            preset: "fast",
            crf: 22,
          },
        },
        {
          module: "@nexrender/action-upload",
          input: "output.mp4",
        },
      ],
    },
    onChange: null,
    onComplete: null,
    onError: null,
  };
}

/**
 * Submit a render job to nexrender and poll until complete.
 * Returns the local path of the downloaded output file.
 */
export async function renderWithNexrender(
  jobId: number,
  opts: NexrenderJobOptions,
  onProgress: (pct: number) => void
): Promise<string> {
  if (!NEXRENDER_URL) {
    throw new Error(
      "NEXRENDER_API_URL is not configured. " +
      "Set it to your nexrender server URL or use FFmpeg render type instead."
    );
  }

  const payload = buildNexrenderJob(opts);
  logger.info({ composition: opts.aeCompositionName }, `[Nexrender] Submitting AE job for hadar job ${jobId}`);

  // Submit job
  const submitRes = await fetch(`${NEXRENDER_URL}/api/v1/jobs`, {
    method: "POST",
    headers: nexrenderHeaders(),
    body: JSON.stringify(payload),
  });
  if (!submitRes.ok) {
    const errText = await submitRes.text();
    throw new Error(`Nexrender submit failed: ${submitRes.status} — ${errText}`);
  }
  const submitted = await submitRes.json() as { uid: string };
  const nxJobId = submitted.uid;
  logger.info(`[Nexrender] Job submitted, uid=${nxJobId}`);
  onProgress(10);

  // Poll until done
  const maxWait = (opts.maxWaitSeconds ?? 600) * 1000;
  const pollInterval = 5000;
  const deadline = Date.now() + maxWait;
  let outputUrl: string | null = null;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, pollInterval));

    const statusRes = await fetch(`${NEXRENDER_URL}/api/v1/jobs/${nxJobId}`, {
      headers: nexrenderHeaders(),
    });
    if (!statusRes.ok) continue;

    const statusData = await statusRes.json() as {
      state: string;
      output?: string;
      error?: string;
    };

    logger.info(`[Nexrender] Job ${nxJobId} state: ${statusData.state}`);

    switch (statusData.state) {
      case "queued":   onProgress(15); break;
      case "started":  onProgress(25); break;
      case "render":   onProgress(50); break;
      case "encode":   onProgress(75); break;
      case "postrender": onProgress(85); break;
      case "finish":
        outputUrl = statusData.output ?? null;
        onProgress(95);
        break;
      case "error":
        throw new Error(`Nexrender render failed: ${statusData.error ?? "unknown error"}`);
    }

    if (statusData.state === "finish" && outputUrl) break;
  }

  if (!outputUrl) throw new Error("Nexrender timed out waiting for render completion");

  // Download output file to tmp
  if (!existsSync(TMP_DIR)) await mkdir(TMP_DIR, { recursive: true });
  const localPath = path.join(TMP_DIR, `nx-${jobId}-${randomUUID()}.mp4`);

  const fileUrl = outputUrl.startsWith("http") ? outputUrl : `${NEXRENDER_URL}${outputUrl}`;
  const dlRes = await fetch(fileUrl, { headers: nexrenderHeaders() });
  if (!dlRes.ok) throw new Error(`Failed to download nexrender output: ${dlRes.status}`);
  const buf = Buffer.from(await dlRes.arrayBuffer());
  await writeFile(localPath, buf);

  logger.info(`[Nexrender] Output downloaded to ${localPath}`);
  return localPath;
}
