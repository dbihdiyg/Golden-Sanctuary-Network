import { Router } from "express";
import { getAuth } from "@clerk/express";
import { pool } from "@workspace/db";

const router = Router();

const ADMIN_IDS = (process.env["ADMIN_CLERK_USER_IDS"] ?? "").split(",").filter(Boolean);

function requireAdmin(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  if (ADMIN_IDS.length > 0 && !ADMIN_IDS.includes(auth.userId)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  req.userId = auth.userId;
  next();
}

router.get("/admin/questions", requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM rabbi_questions ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.patch("/admin/questions/:id", requireAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query(
      `UPDATE rabbi_questions SET status=$1 WHERE id=$2`,
      [status, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/admin/contacts", requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM contact_submissions ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const [q, c, p] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM rabbi_questions`),
      pool.query(`SELECT COUNT(*) FROM contact_submissions`),
      pool.query(`SELECT COUNT(*) FROM community_posts`),
    ]);
    return res.json({
      questions: Number(q.rows[0].count),
      contacts: Number(c.rows[0].count),
      posts: Number(p.rows[0].count),
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
