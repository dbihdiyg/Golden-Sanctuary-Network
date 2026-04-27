import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import multer from "multer";
import { db } from "@workspace/db";
import { hadarVideoTemplates, hadarVideoJobs } from "@workspace/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { objectStorageClient } from "../lib/objectStorage";
import { randomUUID } from "node:crypto";
import { getUncachableStripeClient } from "../stripeClient";
import { logger } from "../lib/logger";
import { renderQueue } from "../lib/renderQueue";
import { verifyDownloadToken, generateDownloadToken } from "../lib/signedUrls";
import type { Request, Response, NextFunction } from "express";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

const VIDEO_PRICE_AGOROT = 4900;

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const secret =
    req.headers["x-admin-secret"] ||
    req.headers.authorization?.replace(/^bearer\s+/i, "");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ─── Admin login ──────────────────────────────────────────────────────────────
router.post("/hadar/admin/auth", (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password" });
  }
  res.json({ token: process.env.ADMIN_SECRET });
});

// ─── Media proxy (serve object storage files without public ACL) ──────────────
router.use("/hadar/media", async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") return next();
  try {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) return res.status(500).send("Storage not configured");
    const filePath = req.path.replace(/^\//, "");
    if (!filePath || filePath.includes("..")) return res.status(400).send("Invalid path");
    const bucket = objectStorageClient.bucket(bucketId);
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    if (!exists) return res.status(404).send("Not found");
    const [metadata] = await file.getMetadata();
    const contentType = (metadata.contentType as string) || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");
    file.createReadStream().pipe(res);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// ─── Admin: video stats ───────────────────────────────────────────────────────
router.get("/hadar/admin/video-stats", adminAuth, async (_req, res) => {
  try {
    const jobs = await db.select({
      status: hadarVideoJobs.status,
    }).from(hadarVideoJobs);

    const stats = {
      totalJobs: jobs.length,
      paidJobs: jobs.filter(j => j.status === "paid").length,
      queuedJobs: jobs.filter(j => j.status === "queued").length,
      renderingJobs: jobs.filter(j => j.status === "rendering").length,
      readyJobs: jobs.filter(j => j.status === "ready").length,
      failedJobs: jobs.filter(j => j.status === "failed").length,
      nexrenderConfigured: !!process.env.NEXRENDER_API_URL,
    };
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function uploadVideoToStorage(buffer: Buffer, mimetype: string, folder: string, ext: string): Promise<string> {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) throw new Error("Object storage not configured");
  const fileName = `${folder}/${randomUUID()}.${ext}`;
  const bucket = objectStorageClient.bucket(bucketId);
  const file = bucket.file(fileName);
  await file.save(buffer, { metadata: { contentType: mimetype } });
  return `/api/hadar/media/${fileName}`;
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC — Video template listing + detail
// ════════════════════════════════════════════════════════════════════════════

router.get("/hadar/video-templates", async (_req, res) => {
  try {
    const templates = await db
      .select()
      .from(hadarVideoTemplates)
      .where(eq(hadarVideoTemplates.isActive, true))
      .orderBy(desc(hadarVideoTemplates.createdAt));
    res.json(templates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/hadar/video-templates/:slug", async (req, res) => {
  try {
    const [tmpl] = await db
      .select()
      .from(hadarVideoTemplates)
      .where(eq(hadarVideoTemplates.slug, req.params.slug));
    if (!tmpl) return res.status(404).json({ error: "Not found" });
    res.json(tmpl);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN — CRUD + Queue
// ════════════════════════════════════════════════════════════════════════════

router.get("/hadar/admin/video-templates", adminAuth, async (_req, res) => {
  try {
    const templates = await db
      .select()
      .from(hadarVideoTemplates)
      .orderBy(desc(hadarVideoTemplates.createdAt));
    res.json(templates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/hadar/admin/video-templates", adminAuth, async (req, res) => {
  try {
    const {
      slug, title, description, category, price, fields, overlays,
      videoDuration, videoWidth, videoHeight,
      tier, maxRenderSeconds, renderPreset, renderCrf,
      renderType, aeCompositionName, aeLayerMappings, preRenderedAssets,
    } = req.body;
    if (!slug || !title) return res.status(400).json({ error: "slug and title required" });
    const [created] = await db
      .insert(hadarVideoTemplates)
      .values({
        slug, title,
        description: description ?? "",
        category: category ?? "",
        tier: tier ?? "standard",
        price: price ?? VIDEO_PRICE_AGOROT,
        fields: fields ?? [],
        overlays: overlays ?? [],
        videoDuration: videoDuration ?? 15,
        videoWidth: videoWidth ?? 1920,
        videoHeight: videoHeight ?? 1080,
        maxRenderSeconds: maxRenderSeconds ?? 300,
        renderPreset: renderPreset ?? "fast",
        renderCrf: renderCrf ?? 22,
        renderType: renderType ?? "ffmpeg",
        aeCompositionName: aeCompositionName ?? null,
        aeLayerMappings: aeLayerMappings ?? [],
        preRenderedAssets: preRenderedAssets ?? [],
      } as any)
      .returning();
    res.json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/hadar/admin/video-templates/:id", adminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      title, description, category, price, fields, overlays,
      videoDuration, videoWidth, videoHeight, isActive,
      tier, maxRenderSeconds, renderPreset, renderCrf,
      renderType, aeCompositionName, aeLayerMappings, preRenderedAssets,
    } = req.body;
    const [updated] = await db
      .update(hadarVideoTemplates)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(tier !== undefined && { tier }),
        ...(price !== undefined && { price }),
        ...(fields !== undefined && { fields }),
        ...(overlays !== undefined && { overlays }),
        ...(videoDuration !== undefined && { videoDuration }),
        ...(videoWidth !== undefined && { videoWidth }),
        ...(videoHeight !== undefined && { videoHeight }),
        ...(isActive !== undefined && { isActive }),
        ...(maxRenderSeconds !== undefined && { maxRenderSeconds }),
        ...(renderPreset !== undefined && { renderPreset }),
        ...(renderCrf !== undefined && { renderCrf }),
        ...(renderType !== undefined && { renderType }),
        ...(aeCompositionName !== undefined && { aeCompositionName }),
        ...(aeLayerMappings !== undefined && { aeLayerMappings }),
        ...(preRenderedAssets !== undefined && { preRenderedAssets }),
        updatedAt: new Date(),
      } as any)
      .where(eq(hadarVideoTemplates.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/hadar/admin/video-templates/:id/upload-video", adminAuth, upload.single("video"), async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { type } = req.body;
    const ext = req.file.originalname.split(".").pop()?.toLowerCase() || "mp4";
    const url = await uploadVideoToStorage(req.file.buffer, req.file.mimetype, "hadar-videos/templates", ext);
    const field =
      type === "preview" ? { previewVideoUrl: url } :
      type === "thumb" ? { previewImageUrl: url } :
      { baseVideoUrl: url };
    const [updated] = await db
      .update(hadarVideoTemplates)
      .set({ ...field, updatedAt: new Date() })
      .where(eq(hadarVideoTemplates.id, id))
      .returning();
    res.json({ url, template: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** Upload a pre-rendered asset (intro, outro) and append it to template's preRenderedAssets list */
router.post("/hadar/admin/video-templates/:id/upload-asset", adminAuth, upload.single("asset"), async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: "No file" });
    const { assetType, label, durationSecs } = req.body;
    if (!["intro", "outro", "overlay"].includes(assetType)) {
      return res.status(400).json({ error: "assetType must be intro|outro|overlay" });
    }
    const ext = req.file.originalname.split(".").pop()?.toLowerCase() || "mp4";
    const url = await uploadVideoToStorage(req.file.buffer, req.file.mimetype, "hadar-videos/assets", ext);

    const [tmpl] = await db.select().from(hadarVideoTemplates).where(eq(hadarVideoTemplates.id, id));
    if (!tmpl) return res.status(404).json({ error: "Template not found" });

    const existing = (tmpl.preRenderedAssets as any[]) ?? [];
    const newAsset = {
      id: randomUUID(),
      label: label ?? assetType,
      url,
      type: assetType,
      durationSecs: durationSecs ? Number(durationSecs) : null,
    };
    const [updated] = await db
      .update(hadarVideoTemplates)
      .set({ preRenderedAssets: [...existing, newAsset], updatedAt: new Date() })
      .where(eq(hadarVideoTemplates.id, id))
      .returning();
    res.json({ asset: newAsset, template: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** Admin: live render queue stats */
router.get("/hadar/admin/video-queue", adminAuth, (_req, res) => {
  res.json(renderQueue.getStats());
});

/** Admin: retry a failed job */
router.post("/hadar/admin/video-jobs/:id/retry", adminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [job] = await db.select().from(hadarVideoJobs).where(eq(hadarVideoJobs.id, id));
    if (!job) return res.status(404).json({ error: "Not found" });
    if (job.status !== "failed") return res.status(400).json({ error: "Only failed jobs can be retried" });

    const [tmpl] = await db.select().from(hadarVideoTemplates).where(eq(hadarVideoTemplates.id, job.templateId));
    const priority = (job.priority as "standard" | "premium") ?? "standard";

    await db
      .update(hadarVideoJobs)
      .set({ status: "queued", errorMessage: null, progressPct: 0, updatedAt: new Date() })
      .where(eq(hadarVideoJobs.id, id));

    const eta = renderQueue.getEta(id, priority) ?? new Date(Date.now() + (tmpl?.maxRenderSeconds ?? 300) * 1000);
    await db.update(hadarVideoJobs).set({ estimatedCompletionAt: eta }).where(eq(hadarVideoJobs.id, id));

    renderQueue.enqueue(id, priority);
    res.json({ queued: true, jobId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** Admin: all jobs list */
router.get("/hadar/admin/video-jobs", adminAuth, async (_req, res) => {
  try {
    const jobs = await db
      .select({ job: hadarVideoJobs, template: hadarVideoTemplates })
      .from(hadarVideoJobs)
      .innerJoin(hadarVideoTemplates, eq(hadarVideoJobs.templateId, hadarVideoTemplates.id))
      .orderBy(desc(hadarVideoJobs.createdAt));
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// USER — Create video job + Stripe checkout
// ════════════════════════════════════════════════════════════════════════════

router.post("/hadar/video-checkout", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { templateSlug, fieldValues, userEmail, userName } = req.body as {
      templateSlug: string;
      fieldValues: Record<string, string>;
      userEmail?: string;
      userName?: string;
    };

    const [template] = await db
      .select()
      .from(hadarVideoTemplates)
      .where(eq(hadarVideoTemplates.slug, templateSlug));
    if (!template) return res.status(404).json({ error: "Template not found" });

    const priority = (template.tier === "premium" ? "premium" : "standard") as "standard" | "premium";

    const [job] = await db
      .insert(hadarVideoJobs)
      .values({
        clerkUserId: userId,
        templateId: template.id,
        fieldValues: fieldValues ?? {},
        status: "pending_payment",
        priority,
        pricePaid: template.price,
        userEmail: userEmail ?? null,
        userName: userName ?? null,
      })
      .returning();

    const basePath = process.env.VITE_BASE_PATH || "/design-templates";
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "ils",
          product_data: {
            name: `וידאו: ${template.title}`,
            description: template.description || "סרטון מותאם אישית",
          },
          unit_amount: template.price,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.APP_URL || "http://localhost"}${basePath}/my-videos?videoJobId=${job.id}&payment=success`,
      cancel_url: `${process.env.APP_URL || "http://localhost"}${basePath}/video/${templateSlug}`,
      metadata: { videoJobId: String(job.id), type: "video_job" },
      ...(userEmail && { customer_email: userEmail }),
    });

    await db
      .update(hadarVideoJobs)
      .set({ stripeSessionId: session.id })
      .where(eq(hadarVideoJobs.id, job.id));

    res.json({ url: session.url, jobId: job.id });
  } catch (err: any) {
    logger.error({ err }, "video checkout failed");
    res.status(500).json({ error: err.message });
  }
});

// ── User job list / detail ───────────────────────────────────────────────────

router.get("/hadar/video-jobs", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const jobs = await db
      .select({ job: hadarVideoJobs, template: hadarVideoTemplates })
      .from(hadarVideoJobs)
      .innerJoin(hadarVideoTemplates, eq(hadarVideoJobs.templateId, hadarVideoTemplates.id))
      .where(eq(hadarVideoJobs.clerkUserId, userId))
      .orderBy(desc(hadarVideoJobs.createdAt));
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/hadar/video-jobs/:id", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    const [job] = await db
      .select()
      .from(hadarVideoJobs)
      .where(and(eq(hadarVideoJobs.id, id), eq(hadarVideoJobs.clerkUserId, userId)));
    if (!job) return res.status(404).json({ error: "Not found" });

    // Attach live queue info
    const priority = (job.priority as "standard" | "premium") ?? "standard";
    const queuePosition = renderQueue.getQueuePosition(id);
    const isActive = renderQueue.isActive(id);
    const eta = job.estimatedCompletionAt
      ?? (isActive || queuePosition !== null ? renderQueue.getEta(id, priority) : null);

    res.json({
      ...job,
      queuePosition,
      isRendering: isActive,
      estimatedCompletionAt: eta?.toISOString() ?? null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Upload AE project file (.aep or .zip) ─────────────────────────────

router.post("/hadar/admin/video-templates/:id/upload-ae-project", adminAuth, upload.single("file"), async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const ext = req.file.originalname.endsWith(".zip") ? "zip" : "aep";
    const url = await uploadVideoToStorage(req.file.buffer, req.file.mimetype || "application/octet-stream", "hadar-videos/ae-projects", ext);
    await db.execute(
      sql`UPDATE hadar_video_templates SET ae_project_url = ${url}, updated_at = NOW() WHERE id = ${id}`
    );
    const [tmpl] = await db.select().from(hadarVideoTemplates).where(eq(hadarVideoTemplates.id, id));
    res.json({ aeProjectUrl: url, template: tmpl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: All video jobs with details ───────────────────────────────────────

router.get("/hadar/admin/video-jobs", adminAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Number(req.query.limit ?? 50));
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status as string | undefined;

    let query = db
      .select({
        job: hadarVideoJobs,
        templateTitle: hadarVideoTemplates.title,
        templateSlug: hadarVideoTemplates.slug,
      })
      .from(hadarVideoJobs)
      .leftJoin(hadarVideoTemplates, eq(hadarVideoJobs.templateId, hadarVideoTemplates.id))
      .orderBy(desc(hadarVideoJobs.createdAt))
      .limit(limit)
      .offset(offset) as any;

    if (statusFilter) {
      query = db
        .select({ job: hadarVideoJobs, templateTitle: hadarVideoTemplates.title, templateSlug: hadarVideoTemplates.slug })
        .from(hadarVideoJobs)
        .leftJoin(hadarVideoTemplates, eq(hadarVideoJobs.templateId, hadarVideoTemplates.id))
        .where(eq(hadarVideoJobs.status, statusFilter as any))
        .orderBy(desc(hadarVideoJobs.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const jobs = await query;

    // Attach live queue info
    const enriched = jobs.map((row: any) => ({
      ...row.job,
      templateTitle: row.templateTitle,
      templateSlug: row.templateSlug,
      queuePosition: renderQueue.getQueuePosition(row.job.id),
      isRendering: renderQueue.isActive(row.job.id),
    }));

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Generate a signed download link for a job ─────────────────────────

router.get("/hadar/admin/video-jobs/:id/sign", adminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [job] = await db.select().from(hadarVideoJobs).where(eq(hadarVideoJobs.id, id));
    if (!job) return res.status(404).json({ error: "Not found" });
    const token = generateDownloadToken(id);
    const appUrl = process.env.APP_URL || "http://localhost:8080";
    res.json({ token, url: `${appUrl}/api/hadar/dl/${token}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public: Download via signed token (for email links) ──────────────────────

router.get("/hadar/dl/:token", async (req, res) => {
  try {
    const payload = verifyDownloadToken(req.params.token);
    if (!payload) return res.status(403).json({ error: "Invalid or expired download link" });
    const [job] = await db.select().from(hadarVideoJobs).where(eq(hadarVideoJobs.id, payload.jobId));
    if (!job) return res.status(404).json({ error: "Video not found" });
    if (job.status !== "ready" || !job.outputUrl) {
      return res.status(403).json({ error: "Video is not ready yet" });
    }
    res.redirect(job.outputUrl);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Serve the final rendered MP4 (auth required) ─────────────────────────────

router.get("/hadar/video-jobs/:id/download", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    const [job] = await db
      .select()
      .from(hadarVideoJobs)
      .where(and(eq(hadarVideoJobs.id, id), eq(hadarVideoJobs.clerkUserId, userId)));
    if (!job) return res.status(404).json({ error: "Not found" });
    if (job.status !== "ready" || !job.outputUrl) {
      return res.status(403).json({ error: "Video is not ready yet" });
    }
    res.redirect(job.outputUrl);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
