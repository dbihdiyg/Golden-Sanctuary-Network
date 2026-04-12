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

router.get("/my-profile", requireAuth, async (req: any, res) => {
  try {
    const [postsRes, reactionsRes, questionsRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM community_posts WHERE clerk_user_id=$1`, [req.userId]),
      pool.query(
        `SELECT COUNT(*) FROM post_reactions r
         JOIN community_posts p ON p.id = r.post_id
         WHERE p.clerk_user_id=$1 AND r.clerk_user_id != $1`,
        [req.userId]
      ),
      pool.query(`SELECT COUNT(*) FROM rabbi_questions WHERE clerk_user_id=$1`, [req.userId]),
    ]);

    const posts = await pool.query(
      `SELECT p.*, COALESCE(json_agg(r) FILTER (WHERE r.id IS NOT NULL), '[]') AS reactions
       FROM community_posts p
       LEFT JOIN post_reactions r ON r.post_id = p.id
       WHERE p.clerk_user_id=$1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.userId]
    );

    return res.json({
      posts_count: Number(postsRes.rows[0].count),
      reactions_received: Number(reactionsRes.rows[0].count),
      questions_count: Number(questionsRes.rows[0].count),
      my_posts: posts.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/leaderboard", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.clerk_user_id,
        p.user_name,
        p.user_image,
        p.cohort,
        COUNT(DISTINCT p.id) AS posts_count,
        COUNT(r.id) AS reactions_received
      FROM community_posts p
      LEFT JOIN post_reactions r ON r.post_id = p.id AND r.clerk_user_id != p.clerk_user_id
      GROUP BY p.clerk_user_id, p.user_name, p.user_image, p.cohort
      ORDER BY (COUNT(DISTINCT p.id) + COUNT(r.id)) DESC
      LIMIT 8
    `);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/community-stats", async (_req, res) => {
  try {
    const [members, posts, reactions] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT clerk_user_id) FROM community_posts`),
      pool.query(`SELECT COUNT(*) FROM community_posts`),
      pool.query(`SELECT COUNT(*) FROM post_reactions`),
    ]);
    return res.json({
      members: Number(members.rows[0].count),
      posts: Number(posts.rows[0].count),
      reactions: Number(reactions.rows[0].count),
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
