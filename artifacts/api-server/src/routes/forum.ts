import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/forum/categories", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT fc.*, COUNT(ft.id)::int AS thread_count
      FROM forum_categories fc
      LEFT JOIN forum_threads ft ON ft.category_id = fc.id
      GROUP BY fc.id
      ORDER BY fc.sort_order ASC
    `);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/forum/threads", async (req, res) => {
  const { categoryId, page = "1", limit = "20" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const params: any[] = [parseInt(limit), offset];
    let where = "";
    if (categoryId) {
      where = "WHERE ft.category_id = $3";
      params.push(parseInt(categoryId));
    }
    const result = await pool.query(`
      SELECT ft.*, fc.name AS category_name, fc.emoji AS category_emoji, fc.color AS category_color
      FROM forum_threads ft
      LEFT JOIN forum_categories fc ON fc.id = ft.category_id
      ${where}
      ORDER BY ft.is_pinned DESC, ft.last_activity_at DESC
      LIMIT $1 OFFSET $2
    `, params);
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM forum_threads${categoryId ? " WHERE category_id = $1" : ""}`,
      categoryId ? [parseInt(categoryId)] : []
    );
    return res.json({ threads: result.rows, total: parseInt(countRes.rows[0].count) });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/forum/threads/:id", async (req, res) => {
  try {
    await pool.query(`UPDATE forum_threads SET view_count = view_count + 1 WHERE id = $1`, [req.params.id]);
    const threadRes = await pool.query(`
      SELECT ft.*, fc.name AS category_name, fc.emoji AS category_emoji, fc.color AS category_color
      FROM forum_threads ft
      LEFT JOIN forum_categories fc ON fc.id = ft.category_id
      WHERE ft.id = $1
    `, [req.params.id]);
    if (!threadRes.rows[0]) return res.status(404).json({ error: "Thread not found" });

    const repliesRes = await pool.query(`
      SELECT * FROM forum_replies WHERE thread_id = $1 ORDER BY created_at ASC
    `, [req.params.id]);

    const userId = req.headers["x-user-id"] as string | undefined;
    let threadLiked = false;
    let likedReplies: number[] = [];

    if (userId) {
      const tl = await pool.query(`SELECT 1 FROM forum_thread_likes WHERE thread_id=$1 AND user_clerk_id=$2`, [req.params.id, userId]);
      threadLiked = tl.rows.length > 0;

      if (repliesRes.rows.length > 0) {
        const replyIds = repliesRes.rows.map(r => r.id);
        const rl = await pool.query(
          `SELECT reply_id FROM forum_reply_likes WHERE reply_id = ANY($1) AND user_clerk_id=$2`,
          [replyIds, userId]
        );
        likedReplies = rl.rows.map(r => r.reply_id);
      }
    }

    return res.json({ thread: threadRes.rows[0], replies: repliesRes.rows, threadLiked, likedReplies });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/forum/threads", async (req, res) => {
  const { categoryId, title, content, imageUrl, authorClerkId, authorName, authorImage } = req.body;
  if (!title?.trim() || !content?.trim() || !authorClerkId) {
    return res.status(400).json({ error: "חסרים שדות חובה" });
  }
  try {
    const result = await pool.query(`
      INSERT INTO forum_threads (category_id, title, content, image_url, author_clerk_id, author_name, author_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [categoryId || null, title.trim(), content.trim(), imageUrl || null, authorClerkId, authorName, authorImage || null]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/forum/threads/:id/replies", async (req, res) => {
  const { content, imageUrl, authorClerkId, authorName, authorImage } = req.body;
  if (!content?.trim() || !authorClerkId) {
    return res.status(400).json({ error: "חסרים שדות חובה" });
  }
  try {
    const result = await pool.query(`
      INSERT INTO forum_replies (thread_id, content, image_url, author_clerk_id, author_name, author_image)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [req.params.id, content.trim(), imageUrl || null, authorClerkId, authorName, authorImage || null]);

    await pool.query(`
      UPDATE forum_threads SET reply_count = reply_count + 1, last_activity_at = NOW() WHERE id = $1
    `, [req.params.id]);

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/forum/threads/:id/like", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "נדרש userId" });
  try {
    const existing = await pool.query(
      `SELECT 1 FROM forum_thread_likes WHERE thread_id=$1 AND user_clerk_id=$2`,
      [req.params.id, userId]
    );
    if (existing.rows.length > 0) {
      await pool.query(`DELETE FROM forum_thread_likes WHERE thread_id=$1 AND user_clerk_id=$2`, [req.params.id, userId]);
      await pool.query(`UPDATE forum_threads SET like_count = GREATEST(like_count - 1, 0) WHERE id=$1`, [req.params.id]);
      return res.json({ liked: false });
    } else {
      await pool.query(`INSERT INTO forum_thread_likes VALUES ($1,$2) ON CONFLICT DO NOTHING`, [req.params.id, userId]);
      await pool.query(`UPDATE forum_threads SET like_count = like_count + 1 WHERE id=$1`, [req.params.id]);
      return res.json({ liked: true });
    }
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/forum/replies/:id/like", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "נדרש userId" });
  try {
    const existing = await pool.query(
      `SELECT 1 FROM forum_reply_likes WHERE reply_id=$1 AND user_clerk_id=$2`,
      [req.params.id, userId]
    );
    if (existing.rows.length > 0) {
      await pool.query(`DELETE FROM forum_reply_likes WHERE reply_id=$1 AND user_clerk_id=$2`, [req.params.id, userId]);
      await pool.query(`UPDATE forum_replies SET like_count = GREATEST(like_count - 1, 0) WHERE id=$1`, [req.params.id]);
      return res.json({ liked: false });
    } else {
      await pool.query(`INSERT INTO forum_reply_likes VALUES ($1,$2) ON CONFLICT DO NOTHING`, [req.params.id, userId]);
      await pool.query(`UPDATE forum_replies SET like_count = like_count + 1 WHERE id=$1`, [req.params.id]);
      return res.json({ liked: true });
    }
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
