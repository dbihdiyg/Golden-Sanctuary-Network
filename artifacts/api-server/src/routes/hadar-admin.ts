import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { hadarDesigns, hadarOrders, hadarTemplates } from "@workspace/db/schema";
import { eq, desc, sql, count, sum } from "drizzle-orm";
import { objectStorageClient } from "../lib/objectStorage";
import { randomUUID } from "crypto";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// ─── Login: exchange ADMIN_PASSWORD for ADMIN_SECRET token ──────────────────
router.post("/hadar/admin/auth", (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password" });
  }
  res.json({ token: process.env.ADMIN_SECRET });
});

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const secret =
    req.headers["x-admin-secret"] ||
    req.headers.authorization?.replace(/^bearer\s+/i, "");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ─── Image upload ────────────────────────────────────────────────────────────
router.post("/hadar/admin/upload", adminAuth, upload.single("image"), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) return res.status(500).json({ error: "Object storage not configured" });

    const ext = req.file.originalname.split(".").pop() || "png";
    const fileName = `hadar-templates/${randomUUID()}.${ext}`;
    const bucket = objectStorageClient.bucket(bucketId);
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketId}/${fileName}`;
    res.json({ url: publicUrl, fileName });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Orders ──────────────────────────────────────────────────────────────────
router.get("/hadar/admin/orders", adminAuth, async (_req, res) => {
  try {
    const orders = await db
      .select({
        id: hadarOrders.id,
        clerkUserId: hadarOrders.clerkUserId,
        templateId: hadarOrders.templateId,
        status: hadarOrders.status,
        amount: hadarOrders.amount,
        currency: hadarOrders.currency,
        stripeSessionId: hadarOrders.stripeSessionId,
        stripePaymentIntent: hadarOrders.stripePaymentIntent,
        createdAt: hadarOrders.createdAt,
        designId: hadarOrders.designId,
        designName: hadarDesigns.designName,
        fieldValues: hadarDesigns.fieldValues,
        designStatus: hadarDesigns.status,
      })
      .from(hadarOrders)
      .leftJoin(hadarDesigns, eq(hadarOrders.designId, hadarDesigns.id))
      .orderBy(desc(hadarOrders.createdAt))
      .limit(200);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/hadar/admin/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db
      .update(hadarOrders)
      .set({ status })
      .where(eq(hadarOrders.id, Number(req.params.id)))
      .returning();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Stats ───────────────────────────────────────────────────────────────────
router.get("/hadar/admin/stats", adminAuth, async (_req, res) => {
  try {
    const [totalRes] = await db.select({ total: count() }).from(hadarOrders);
    const [paidRes] = await db
      .select({ total: count(), revenue: sum(hadarOrders.amount) })
      .from(hadarOrders)
      .where(eq(hadarOrders.status, "paid"));
    const [pendingRes] = await db
      .select({ total: count() })
      .from(hadarOrders)
      .where(eq(hadarOrders.status, "pending"));
    const [designsRes] = await db.select({ total: count() }).from(hadarDesigns);

    res.json({
      totalOrders: Number(totalRes.total),
      paidOrders: Number(paidRes.total),
      pendingOrders: Number(pendingRes.total),
      totalRevenue: Number(paidRes.revenue || 0),
      totalDesigns: Number(designsRes.total),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Templates ───────────────────────────────────────────────────────────────
router.get("/hadar/admin/templates", adminAuth, async (_req, res) => {
  try {
    const templates = await db
      .select()
      .from(hadarTemplates)
      .orderBy(desc(hadarTemplates.createdAt));
    res.json(templates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/hadar/admin/templates", adminAuth, async (req, res) => {
  try {
    const { slug, title, subtitle, category, style, price, imageUrl, slots } = req.body;
    if (!slug || !title) return res.status(400).json({ error: "slug and title required" });
    const [template] = await db
      .insert(hadarTemplates)
      .values({ slug, title, subtitle: subtitle || "", category: category || "", style: style || "", price: price || 4900, imageUrl: imageUrl || null, slots: slots || [] })
      .returning();
    res.json(template);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/hadar/admin/templates/:id", adminAuth, async (req, res) => {
  try {
    const { title, subtitle, category, style, price, imageUrl, slots, isActive } = req.body;
    const [template] = await db
      .update(hadarTemplates)
      .set({ title, subtitle, category, style, price, imageUrl, slots, isActive, updatedAt: new Date() })
      .where(eq(hadarTemplates.id, Number(req.params.id)))
      .returning();
    if (!template) return res.status(404).json({ error: "Not found" });
    res.json(template);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/hadar/admin/templates/:id", adminAuth, async (req, res) => {
  try {
    await db.delete(hadarTemplates).where(eq(hadarTemplates.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Public: get template by slug (for user editor) ──────────────────────────
router.get("/hadar/templates/:slug", async (req, res) => {
  try {
    const [template] = await db
      .select()
      .from(hadarTemplates)
      .where(eq(hadarTemplates.slug, req.params.slug));
    if (!template) return res.status(404).json({ error: "Not found" });
    res.json(template);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
