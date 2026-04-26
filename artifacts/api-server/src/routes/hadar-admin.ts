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

// ─── Public: list all active templates ───────────────────────────────────────
router.get("/hadar/public-templates", async (_req, res) => {
  try {
    const templates = await db
      .select()
      .from(hadarTemplates)
      .where(eq(hadarTemplates.isActive, true))
      .orderBy(hadarTemplates.id);
    res.json(templates);
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

// ─── Admin: seed default templates ────────────────────────────────────────────
const DEFAULT_SEEDS = [
  { slug: "kiddush-classic",  title: "שבת שבתון",         subtitle: "הזמנה לקידוש",        category: "הזמנות לקידוש",   style: "זהב",        price: 2900,  imageUrl: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" },
  { slug: "wedding-luxury",   title: "יום שמחתנו",         subtitle: "הזמנה לחתונה",        category: "הזמנות לחתונה",   style: "יוקרתי",    price: 7900,  imageUrl: null },
  { slug: "bar-mitzvah",      title: "כי הגיע הזמן",       subtitle: "מודעה לבר מצווה",     category: "מודעות לאירועים", style: "קלאסי",     price: 4900,  imageUrl: null },
  { slug: "torah-class",      title: "עמוד ישיבה",          subtitle: "מודעה לשיעור תורה",  category: "מודעות לישיבות",  style: "מינימליסטי", price: 1900,  imageUrl: null },
  { slug: "parasha",          title: "פרשת השבוע",         subtitle: "עיצוב לשבת",          category: "מודעות לאירועים", style: "מודרני",    price: 2500,  imageUrl: "linear-gradient(135deg, #331520 0%, #1a0b10 100%)" },
  { slug: "charity",          title: "יד עוזרת",            subtitle: "פוסטר גיוס תרומות",  category: "מודעות לאירועים", style: "חסידי",     price: 3900,  imageUrl: null },
  { slug: "housewarming",     title: "בית חדש שמחה חדשה", subtitle: "הזמנה לחנוכת הבית",  category: "הזמנות לקידוש",   style: "זהב",        price: 3500,  imageUrl: "linear-gradient(135deg, #172554 0%, #082f49 100%)" },
  { slug: "yeshiva-event",    title: "ערב עיון",            subtitle: "מודעה לאירוע ישיבה", category: "מודעות לישיבות",  style: "קלאסי",     price: 2900,  imageUrl: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" },
  { slug: "wedding-video",    title: "ברוכים הבאים",       subtitle: "קליפ וידאו לחתונה",   category: "תבניות וידאו",    style: "יוקרתי",    price: 12000, imageUrl: null },
  { slug: "passover",         title: "ליל הסדר",           subtitle: "עיצוב לחג הפסח",      category: "עיצובים לחגים",   style: "מינימליסטי", price: 4500,  imageUrl: "linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)" },
  { slug: "brit-milah",       title: "שמחת הברית",         subtitle: "הזמנה לברית מילה",   category: "הזמנות לקידוש",   style: "זהב",        price: 5500,  imageUrl: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)" },
  { slug: "kol-kore",         title: "קול קורא",            subtitle: "פוסטר לאסיפה חשובה", category: "מודעות לישיבות",  style: "חסידי",     price: 2200,  imageUrl: "linear-gradient(135deg, #022c22 0%, #450a0a 100%)" },
];

router.post("/hadar/admin/seed", adminAuth, async (_req, res) => {
  try {
    const existing = await db.select({ id: hadarTemplates.id }).from(hadarTemplates);
    if (existing.length > 0) {
      return res.json({ message: "already_seeded", count: existing.length });
    }
    const seeded = await db
      .insert(hadarTemplates)
      .values(DEFAULT_SEEDS.map(t => ({ ...t, slots: [], isActive: true })))
      .returning();
    res.json({ seeded: seeded.length, templates: seeded });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: quick patch (price / isActive / title) ────────────────────────────
router.patch("/hadar/admin/templates/:id", adminAuth, async (req, res) => {
  try {
    const allowed = ["price", "isActive", "title", "subtitle", "category", "style"] as const;
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (key in req.body) patch[key] = req.body[key];
    }
    patch.updatedAt = new Date();
    const [updated] = await db
      .update(hadarTemplates)
      .set(patch)
      .where(eq(hadarTemplates.id, Number(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
