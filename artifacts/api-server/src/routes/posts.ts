import { Router } from "express";
import { getAuth } from "@clerk/express";
import { pool } from "@workspace/db";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = auth.userId;
  next();
}

router.get("/posts", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        COALESCE(json_agg(r) FILTER (WHERE r.id IS NOT NULL), '[]') AS reactions
      FROM community_posts p
      LEFT JOIN post_reactions r ON r.post_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/posts", requireAuth, async (req: any, res) => {
  const { content, user_name, user_image, cohort } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "תוכן ריק" });
  try {
    const result = await pool.query(
      `INSERT INTO community_posts (clerk_user_id, user_name, user_image, cohort, content)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.userId, user_name || "בוגר", user_image || null, cohort || null, content.trim()]
    );
    return res.json({ ...result.rows[0], reactions: [] });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/posts/:id/react", requireAuth, async (req: any, res) => {
  const postId = Number(req.params.id);
  const emoji = req.body.emoji || "❤️";
  try {
    const existing = await pool.query(
      `SELECT id FROM post_reactions WHERE post_id=$1 AND clerk_user_id=$2`,
      [postId, req.userId]
    );
    if (existing.rows.length > 0) {
      await pool.query(`DELETE FROM post_reactions WHERE post_id=$1 AND clerk_user_id=$2`, [postId, req.userId]);
      return res.json({ removed: true });
    } else {
      await pool.query(
        `INSERT INTO post_reactions (post_id, clerk_user_id, emoji) VALUES ($1,$2,$3)`,
        [postId, req.userId, emoji]
      );
      return res.json({ added: true });
    }
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.delete("/posts/:id", requireAuth, async (req: any, res) => {
  const postId = Number(req.params.id);
  try {
    await pool.query(
      `DELETE FROM community_posts WHERE id=$1 AND clerk_user_id=$2`,
      [postId, req.userId]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/my-questions", requireAuth, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM rabbi_questions WHERE clerk_user_id=$1 ORDER BY created_at DESC`,
      [req.userId]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
