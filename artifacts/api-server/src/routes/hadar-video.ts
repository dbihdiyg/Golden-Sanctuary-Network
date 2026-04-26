import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import multer from "multer";
import { db } from "@workspace/db";
import { hadarVideoTemplates, hadarVideoJobs } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { objectStorageClient } from "../lib/objectStorage";
import { randomUUID } from "node:crypto";
import { getUncachableStripeClient } from "../stripeClient";
import { logger } from "../lib/logger";
import type { Request, Response, NextFunction } from "express";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

const VIDEO_PRICE_AGOROT = 4900; // ₪49

// ── Admin auth middleware ────────────────────────────────────────────────────
function adminAuth(req: Request, res: Response, next: NextFunction) {
  const secret =
    req.headers["x-admin-secret"] ||
    req.headers.authorization?.replace(/^bearer\s+/i, "");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ── Storage helper ───────────────────────────────────────────────────────────
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
// ADMIN — CRUD
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
    const { slug, title, description, category, price, fields, overlays, videoDuration, videoWidth, videoHeight } = req.body;
    if (!slug || !title) return res.status(400).json({ error: "slug and title required" });
    const [created] = await db
      .insert(hadarVideoTemplates)
      .values({
        slug,
        title,
        description: description ?? "",
        category: category ?? "",
        price: price ?? VIDEO_PRICE_AGOROT,
        fields: fields ?? [],
        overlays: overlays ?? [],
        videoDuration: videoDuration ?? 15,
        videoWidth: videoWidth ?? 1920,
        videoHeight: videoHeight ?? 1080,
      })
      .returning();
    res.json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/hadar/admin/video-templates/:id", adminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, category, price, fields, overlays, videoDuration, videoWidth, videoHeight, isActive } = req.body;
    const [updated] = await db
      .update(hadarVideoTemplates)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price }),
        ...(fields !== undefined && { fields }),
        ...(overlays !== undefined && { overlays }),
        ...(videoDuration !== undefined && { videoDuration }),
        ...(videoWidth !== undefined && { videoWidth }),
        ...(videoHeight !== undefined && { videoHeight }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(hadarVideoTemplates.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload base video (large file — up to 500 MB)
router.post("/hadar/admin/video-templates/:id/upload-video", adminAuth, upload.single("video"), async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { type } = req.body; // "base" | "preview"
    const ext = req.file.originalname.split(".").pop()?.toLowerCase() || "mp4";
    const url = await uploadVideoToStorage(req.file.buffer, req.file.mimetype, "hadar-videos/templates", ext);
    const field = type === "preview" ? { previewVideoUrl: url } : type === "thumb" ? { previewImageUrl: url } : { baseVideoUrl: url };
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

// ════════════════════════════════════════════════════════════════════════════
// USER — Create video job + Stripe checkout
// ════════════════════════════════════════════════════════════════════════════

router.post("/hadar/video-checkout", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { templateSlug, fieldValues } = req.body as {
      templateSlug: string;
      fieldValues: Record<string, string>;
    };

    const [template] = await db
      .select()
      .from(hadarVideoTemplates)
      .where(eq(hadarVideoTemplates.slug, templateSlug));
    if (!template) return res.status(404).json({ error: "Template not found" });

    // Create job in pending_payment state
    const [job] = await db
      .insert(hadarVideoJobs)
      .values({
        clerkUserId: userId,
        templateId: template.id,
        fieldValues: fieldValues ?? {},
        status: "pending_payment",
        pricePaid: template.price,
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
    });

    // Link the session
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
    res.json(job);
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
    // Redirect to the media proxy URL which serves the file from object storage
    res.redirect(job.outputUrl);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin list all jobs
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

export default router;
