import { Router } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { pool } from "@workspace/db";

const router = Router();

function computeToken(password: string): string {
  const secret = process.env["ADMIN_SECRET"] ?? "fallback-secret-change-me";
  return createHmac("sha256", secret).update(password).digest("hex");
}
function validateToken(token: string): boolean {
  const adminPassword = process.env["ADMIN_PASSWORD"] ?? "";
  if (!adminPassword) return false;
  const expected = computeToken(adminPassword);
  try { return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex")); }
  catch { return false; }
}
function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"] as string | undefined;
  const token = auth?.replace("Bearer ", "").trim() ?? "";
  if (!token || !validateToken(token)) return res.status(401).json({ error: "Unauthorized" });
  next();
}

router.post("/media-submissions", async (req, res) => {
  const { userClerkId, userName, userImage, type, fileData, videoUrl, title, description, category } = req.body;
  if (!userClerkId || !type || !title?.trim()) {
    return res.status(400).json({ error: "חסרים שדות חובה" });
  }
  if (type === "photo" && !fileData) return res.status(400).json({ error: "חסרת תמונה" });
  if (type === "video" && !videoUrl) return res.status(400).json({ error: "חסרת קישור לסרטון" });
  try {
    const result = await pool.query(`
      INSERT INTO media_submissions (user_clerk_id, user_name, user_image, type, file_data, video_url, title, description, category)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, submitted_at
    `, [userClerkId, userName, userImage || null, type, fileData || null, videoUrl || null, title.trim(), description || null, category || "general"]);
    return res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/media-submissions/mine", async (req, res) => {
  const { userId } = req.query as Record<string, string>;
  if (!userId) return res.status(400).json({ error: "נדרש userId" });
  try {
    const result = await pool.query(
      `SELECT id, type, title, description, category, status, admin_note, submitted_at FROM media_submissions WHERE user_clerk_id=$1 ORDER BY submitted_at DESC`,
      [userId]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/media-submissions", requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_name, user_image, type, title, description, category, status, admin_note, submitted_at,
       CASE WHEN type='photo' THEN LEFT(file_data, 100) ELSE null END as file_preview,
       video_url FROM media_submissions ORDER BY submitted_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/media-submissions/:id/full", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM media_submissions WHERE id=$1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Not found" });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.patch("/media-submissions/:id", requireAdmin, async (req, res) => {
  const { status, adminNote, tag, year } = req.body;
  try {
    await pool.query(
      `UPDATE media_submissions SET status=$1, admin_note=$2 WHERE id=$3`,
      [status, adminNote || null, req.params.id]
    );
    if (status === "approved") {
      const sub = await pool.query(`SELECT * FROM media_submissions WHERE id=$1`, [req.params.id]);
      const s = sub.rows[0];
      if (s && s.type === "photo" && s.file_data) {
        const currentYear = new Date().getFullYear().toString();
        await pool.query(
          `INSERT INTO approved_photos (submission_id, title, description, image_data, tag, year, submitted_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
          [s.id, s.title, s.description || null, s.file_data, tag || s.category || "קהילה", year || currentYear, s.user_name]
        );
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/approved-photos", async (_req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM approved_photos ORDER BY approved_at DESC`);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
