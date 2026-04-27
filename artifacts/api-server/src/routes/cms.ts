import { Router } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { cmsAnnouncements, cmsGallery, cmsVideos, cmsPdfs, cmsEvents, cmsSpecialBanners, cmsFeaturedShiur, cmsCommunityEvents } from "@workspace/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { objectStorageClient } from "../lib/objectStorage";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "./admin";
import type { Request, Response } from "express";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

async function uploadToStorage(buffer: Buffer, mimetype: string, folder: string, ext: string): Promise<string> {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) throw new Error("Object storage not configured");
  const fileName = `${folder}/${randomUUID()}.${ext}`;
  const bucket = objectStorageClient.bucket(bucketId);
  const file = bucket.file(fileName);
  await file.save(buffer, { metadata: { contentType: mimetype } });
  return `/api/cms/media/${fileName}`;
}

router.use("/cms/media", async (req: Request, res: Response, next) => {
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
    res.setHeader("Content-Type", (metadata.contentType as string) || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");
    file.createReadStream().pipe(res);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// ═══════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS
// ═══════════════════════════════════════════════════════════════════

router.get("/cms/announcements", async (_req, res) => {
  try {
    const rows = await db.select().from(cmsAnnouncements)
      .where(eq(cmsAnnouncements.isActive, true))
      .orderBy(desc(cmsAnnouncements.isPinned), asc(cmsAnnouncements.sortOrder), desc(cmsAnnouncements.createdAt));
    const now = new Date();
    res.json(rows.filter(r => !r.expiresAt || r.expiresAt > now));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/cms/admin/announcements", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(cmsAnnouncements)
      .orderBy(desc(cmsAnnouncements.isPinned), asc(cmsAnnouncements.sortOrder), desc(cmsAnnouncements.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/cms/admin/announcements", requireAdmin, async (req, res) => {
  try {
    const { title, body, linkUrl, linkType, linkLabel, variant, isPinned, isActive, expiresAt, sortOrder,
            type, eventDate, locationText, imageUrl, ctaText, ctaUrl } = req.body;
    if (!body) return res.status(400).json({ error: "body required" });
    const [row] = await db.insert(cmsAnnouncements).values({
      title: title ?? null,
      body,
      linkUrl: linkUrl ?? null,
      linkType: linkType ?? null,
      linkLabel: linkLabel ?? null,
      variant: variant ?? "info",
      isPinned: isPinned ?? false,
      isActive: isActive ?? true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      sortOrder: sortOrder ?? 0,
      type: type ?? "regular",
      eventDate: eventDate ?? null,
      locationText: locationText ?? null,
      imageUrl: imageUrl ?? null,
      ctaText: ctaText ?? null,
      ctaUrl: ctaUrl ?? null,
    }).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put("/cms/admin/announcements/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, body, linkUrl, linkType, linkLabel, variant, isPinned, isActive, expiresAt, sortOrder,
            type, eventDate, locationText, imageUrl, ctaText, ctaUrl } = req.body;
    const [row] = await db.update(cmsAnnouncements).set({
      ...(title !== undefined && { title }),
      ...(body !== undefined && { body }),
      ...(linkUrl !== undefined && { linkUrl }),
      ...(linkType !== undefined && { linkType }),
      ...(linkLabel !== undefined && { linkLabel }),
      ...(variant !== undefined && { variant }),
      ...(isPinned !== undefined && { isPinned }),
      ...(isActive !== undefined && { isActive }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(type !== undefined && { type }),
      ...(eventDate !== undefined && { eventDate }),
      ...(locationText !== undefined && { locationText }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(ctaText !== undefined && { ctaText }),
      ...(ctaUrl !== undefined && { ctaUrl }),
      updatedAt: new Date(),
    }).where(eq(cmsAnnouncements.id, id)).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/cms/admin/announcements/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(cmsAnnouncements).where(eq(cmsAnnouncements.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════════════

router.get("/cms/gallery", async (_req, res) => {
  try {
    const rows = await db.select().from(cmsGallery)
      .where(eq(cmsGallery.isActive, true))
      .orderBy(asc(cmsGallery.sortOrder), desc(cmsGallery.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/cms/admin/gallery", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(cmsGallery)
      .orderBy(asc(cmsGallery.sortOrder), desc(cmsGallery.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/cms/admin/gallery", requireAdmin, upload.single("image"), async (req: any, res) => {
  try {
    const { title, tag, year, sortOrder } = req.body;
    let url = req.body.url;
    if (req.file) {
      const ext = req.file.originalname.split(".").pop()?.toLowerCase() || "jpg";
      url = await uploadToStorage(req.file.buffer, req.file.mimetype, "cms/gallery", ext);
    }
    if (!url) return res.status(400).json({ error: "url or image file required" });
    const [row] = await db.insert(cmsGallery).values({
      url,
      title: title ?? "",
      tag: tag ?? null,
      year: year ?? String(new Date().getFullYear()),
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    }).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put("/cms/admin/gallery/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, tag, year, isActive, sortOrder } = req.body;
    const [row] = await db.update(cmsGallery).set({
      ...(title !== undefined && { title }),
      ...(tag !== undefined && { tag }),
      ...(year !== undefined && { year }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
    }).where(eq(cmsGallery.id, id)).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/cms/admin/gallery/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(cmsGallery).where(eq(cmsGallery.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
// VIDEOS
// ═══════════════════════════════════════════════════════════════════

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

router.get("/cms/videos", async (_req, res) => {
  try {
    const rows = await db.select().from(cmsVideos)
      .where(eq(cmsVideos.isActive, true))
      .orderBy(asc(cmsVideos.sortOrder), desc(cmsVideos.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/cms/admin/videos", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(cmsVideos)
      .orderBy(asc(cmsVideos.sortOrder), desc(cmsVideos.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/cms/admin/videos", requireAdmin, async (req, res) => {
  try {
    const { youtubeUrl, title, description, category, dateLabel, sortOrder } = req.body;
    if (!youtubeUrl || !title) return res.status(400).json({ error: "youtubeUrl and title required" });
    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) return res.status(400).json({ error: "Could not parse YouTube ID from URL" });
    const [row] = await db.insert(cmsVideos).values({
      youtubeUrl,
      youtubeId,
      title,
      description: description ?? "",
      category: category ?? "שיעורים",
      dateLabel: dateLabel ?? "",
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    }).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put("/cms/admin/videos/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, category, dateLabel, isActive, sortOrder, youtubeUrl } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (dateLabel !== undefined) updates.dateLabel = dateLabel;
    if (isActive !== undefined) updates.isActive = isActive;
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);
    if (youtubeUrl !== undefined) {
      const youtubeId = extractYoutubeId(youtubeUrl);
      if (youtubeId) { updates.youtubeUrl = youtubeUrl; updates.youtubeId = youtubeId; }
    }
    const [row] = await db.update(cmsVideos).set(updates).where(eq(cmsVideos.id, id)).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/cms/admin/videos/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(cmsVideos).where(eq(cmsVideos.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
// PDFs
// ═══════════════════════════════════════════════════════════════════

router.get("/cms/pdfs", async (_req, res) => {
  try {
    const rows = await db.select().from(cmsPdfs)
      .where(eq(cmsPdfs.isActive, true))
      .orderBy(asc(cmsPdfs.sortOrder), desc(cmsPdfs.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/cms/admin/pdfs", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(cmsPdfs)
      .orderBy(asc(cmsPdfs.sortOrder), desc(cmsPdfs.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/cms/admin/pdfs", requireAdmin, upload.single("file"), async (req: any, res) => {
  try {
    const { title, dateLabel, description, sortOrder } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    let fileUrl = req.body.fileUrl ?? null;
    if (req.file) {
      fileUrl = await uploadToStorage(req.file.buffer, req.file.mimetype || "application/pdf", "cms/pdfs", "pdf");
    }
    const [row] = await db.insert(cmsPdfs).values({
      title,
      dateLabel: dateLabel ?? "",
      description: description ?? "",
      fileUrl,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    }).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put("/cms/admin/pdfs/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, dateLabel, description, isActive, sortOrder } = req.body;
    const [row] = await db.update(cmsPdfs).set({
      ...(title !== undefined && { title }),
      ...(dateLabel !== undefined && { dateLabel }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
    }).where(eq(cmsPdfs.id, id)).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/cms/admin/pdfs/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(cmsPdfs).where(eq(cmsPdfs.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════

router.get("/cms/events", async (_req, res) => {
  try {
    const rows = await db.select().from(cmsEvents)
      .where(eq(cmsEvents.isActive, true))
      .orderBy(asc(cmsEvents.sortOrder), desc(cmsEvents.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/cms/admin/events", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(cmsEvents)
      .orderBy(asc(cmsEvents.sortOrder), desc(cmsEvents.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/cms/admin/events", requireAdmin, async (req, res) => {
  try {
    const { title, dateLabel, dateActual, description, location, linkUrl, linkLabel, sortOrder } = req.body;
    if (!title || !dateLabel) return res.status(400).json({ error: "title and dateLabel required" });
    const [row] = await db.insert(cmsEvents).values({
      title,
      dateLabel,
      dateActual: dateActual ? new Date(dateActual) : null,
      description: description ?? "",
      location: location ?? null,
      linkUrl: linkUrl ?? null,
      linkLabel: linkLabel ?? null,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    }).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put("/cms/admin/events/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, dateLabel, dateActual, description, location, linkUrl, linkLabel, isActive, sortOrder } = req.body;
    const [row] = await db.update(cmsEvents).set({
      ...(title !== undefined && { title }),
      ...(dateLabel !== undefined && { dateLabel }),
      ...(dateActual !== undefined && { dateActual: dateActual ? new Date(dateActual) : null }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(linkUrl !== undefined && { linkUrl }),
      ...(linkLabel !== undefined && { linkLabel }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
    }).where(eq(cmsEvents.id, id)).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/cms/admin/events/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(cmsEvents).where(eq(cmsEvents.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
// SPECIAL BANNERS
// ═══════════════════════════════════════════════════════════════════

router.get("/cms/special-banners", async (_req, res) => {
  try {
    const rows = await db.select().from(cmsSpecialBanners)
      .where(eq(cmsSpecialBanners.isActive, true))
      .orderBy(asc(cmsSpecialBanners.sortOrder), desc(cmsSpecialBanners.createdAt));
    const now = new Date();
    res.json(rows.filter(r => !r.expiresAt || r.expiresAt > now));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/cms/admin/special-banners", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(cmsSpecialBanners)
      .orderBy(asc(cmsSpecialBanners.sortOrder), desc(cmsSpecialBanners.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/cms/admin/special-banners", requireAdmin, upload.single("audio"), async (req: any, res) => {
  try {
    const { label, labelIcon, dateLabel, headline, subtitle, bodyText, footerText,
            youtubeId, audioLabel, audioSublabel, expiresAt, sortOrder } = req.body;
    if (!headline) return res.status(400).json({ error: "headline required" });
    let audioUrl = req.body.audioUrl ?? null;
    if (req.file) {
      const ext = req.file.originalname.split(".").pop()?.toLowerCase() || "mp3";
      audioUrl = await uploadToStorage(req.file.buffer, req.file.mimetype || "audio/mpeg", "cms/audio", ext);
    }
    const [row] = await db.insert(cmsSpecialBanners).values({
      label: label ?? "הודעה מיוחדת",
      labelIcon: labelIcon ?? "flame",
      dateLabel: dateLabel ?? "",
      headline,
      subtitle: subtitle ?? "",
      bodyText: bodyText ?? "",
      footerText: footerText ?? "",
      youtubeId: youtubeId || null,
      audioUrl,
      audioLabel: audioLabel ?? "",
      audioSublabel: audioSublabel ?? "",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    }).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put("/cms/admin/special-banners/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { label, labelIcon, dateLabel, headline, subtitle, bodyText, footerText,
            youtubeId, audioUrl, audioLabel, audioSublabel, expiresAt, isActive, sortOrder } = req.body;
    const updates: any = {};
    if (label !== undefined) updates.label = label;
    if (labelIcon !== undefined) updates.labelIcon = labelIcon;
    if (dateLabel !== undefined) updates.dateLabel = dateLabel;
    if (headline !== undefined) updates.headline = headline;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (bodyText !== undefined) updates.bodyText = bodyText;
    if (footerText !== undefined) updates.footerText = footerText;
    if (youtubeId !== undefined) updates.youtubeId = youtubeId || null;
    if (audioUrl !== undefined) updates.audioUrl = audioUrl || null;
    if (audioLabel !== undefined) updates.audioLabel = audioLabel;
    if (audioSublabel !== undefined) updates.audioSublabel = audioSublabel;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updates.isActive = isActive;
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);
    const [row] = await db.update(cmsSpecialBanners).set(updates).where(eq(cmsSpecialBanners.id, id)).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/cms/admin/special-banners/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(cmsSpecialBanners).where(eq(cmsSpecialBanners.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
// FEATURED SHIUR
// ═══════════════════════════════════════════════════════════════════

router.get("/cms/featured-shiur", async (_req, res) => {
  try {
    const rows = await db.select().from(cmsFeaturedShiur)
      .where(eq(cmsFeaturedShiur.isActive, true))
      .orderBy(asc(cmsFeaturedShiur.sortOrder), desc(cmsFeaturedShiur.createdAt))
      .limit(1);
    res.json(rows[0] ?? null);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/cms/admin/featured-shiur", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(cmsFeaturedShiur)
      .orderBy(asc(cmsFeaturedShiur.sortOrder), desc(cmsFeaturedShiur.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/cms/admin/featured-shiur", requireAdmin, upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]), async (req: Request, res: Response) => {
  try {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const { title, subtitle, rabbiName, parasha, durationLabel, audioUrl: bodyAudioUrl, thumbnailUrl: bodyThumbUrl } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    let audioUrl = bodyAudioUrl || null;
    let thumbnailUrl = bodyThumbUrl || null;

    if (files?.audio?.[0]) {
      const f = files.audio[0];
      const ext = f.originalname.split(".").pop() || "mp3";
      audioUrl = await uploadToStorage(f.buffer, f.mimetype, "cms/audio", ext);
    }
    if (files?.thumbnail?.[0]) {
      const f = files.thumbnail[0];
      const ext = f.originalname.split(".").pop() || "jpg";
      thumbnailUrl = await uploadToStorage(f.buffer, f.mimetype, "cms/images", ext);
    }

    const [row] = await db.insert(cmsFeaturedShiur).values({
      title, subtitle: subtitle ?? "", rabbiName: rabbiName ?? 'הרב שניאור גרוסמן שליט"א',
      parasha: parasha ?? "", durationLabel: durationLabel ?? "",
      audioUrl, thumbnailUrl,
    }).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put("/cms/admin/featured-shiur/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, subtitle, rabbiName, parasha, durationLabel, audioUrl, thumbnailUrl, isActive, sortOrder } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (rabbiName !== undefined) updates.rabbiName = rabbiName;
    if (parasha !== undefined) updates.parasha = parasha;
    if (durationLabel !== undefined) updates.durationLabel = durationLabel;
    if (audioUrl !== undefined) updates.audioUrl = audioUrl || null;
    if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl || null;
    if (isActive !== undefined) updates.isActive = isActive;
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);
    const [row] = await db.update(cmsFeaturedShiur).set(updates).where(eq(cmsFeaturedShiur.id, id)).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/cms/admin/featured-shiur/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(cmsFeaturedShiur).where(eq(cmsFeaturedShiur.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
// COMMUNITY EVENTS (event banners with image)
// ═══════════════════════════════════════════════════════════════════

router.get("/cms/community-events", async (_req, res) => {
  try {
    const rows = await db.select().from(cmsCommunityEvents)
      .where(eq(cmsCommunityEvents.isActive, true))
      .orderBy(asc(cmsCommunityEvents.sortOrder), desc(cmsCommunityEvents.createdAt));
    const now = new Date();
    res.json(rows.filter(r => !r.expiresAt || r.expiresAt > now));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/cms/admin/community-events", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(cmsCommunityEvents)
      .orderBy(asc(cmsCommunityEvents.sortOrder), desc(cmsCommunityEvents.createdAt));
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/cms/admin/community-events", requireAdmin, upload.single("image"), async (req: Request, res: Response) => {
  try {
    const { title, subtitle, description, eventDate, eventTime, location, ctaText, ctaLink, imageUrl: bodyImageUrl, expiresAt } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    let imageUrl = bodyImageUrl || null;
    if (req.file) {
      const ext = req.file.originalname.split(".").pop() || "jpg";
      imageUrl = await uploadToStorage(req.file.buffer, req.file.mimetype, "cms/images", ext);
    }

    const [row] = await db.insert(cmsCommunityEvents).values({
      title, subtitle: subtitle ?? "", description: description ?? "",
      eventDate: eventDate ?? "", eventTime: eventTime ?? "",
      location: location ?? "", imageUrl,
      ctaText: ctaText ?? "הצטרפו אלינו", ctaLink: ctaLink ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put("/cms/admin/community-events/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, subtitle, description, eventDate, eventTime, location, imageUrl,
            ctaText, ctaLink, expiresAt, isActive, sortOrder } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (description !== undefined) updates.description = description;
    if (eventDate !== undefined) updates.eventDate = eventDate;
    if (eventTime !== undefined) updates.eventTime = eventTime;
    if (location !== undefined) updates.location = location;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl || null;
    if (ctaText !== undefined) updates.ctaText = ctaText;
    if (ctaLink !== undefined) updates.ctaLink = ctaLink || null;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updates.isActive = isActive;
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);
    const [row] = await db.update(cmsCommunityEvents).set(updates).where(eq(cmsCommunityEvents.id, id)).returning();
    res.json(row);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/cms/admin/community-events/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(cmsCommunityEvents).where(eq(cmsCommunityEvents.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
