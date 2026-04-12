import { Router } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { pool } from "@workspace/db";

const router = Router();

function getAdminSecret(): string {
  return process.env["ADMIN_SECRET"] ?? "fallback-secret-change-me";
}

function computeToken(password: string): string {
  return createHmac("sha256", getAdminSecret()).update(password).digest("hex");
}

function getExpectedToken(): string {
  const password = process.env["ADMIN_PASSWORD"] ?? "";
  return computeToken(password);
}

function validateToken(token: string): boolean {
  const expected = getExpectedToken();
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"] as string | undefined;
  const token = auth?.replace("Bearer ", "").trim() ?? "";
  if (!token || !validateToken(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.post("/admin/login", (req, res) => {
  const { password } = req.body ?? {};
  if (!password) return res.status(400).json({ error: "נדרשת סיסמה" });

  const adminPassword = process.env["ADMIN_PASSWORD"] ?? "";
  if (!adminPassword) return res.status(503).json({ error: "לא הוגדרה סיסמת מנהל" });

  let match = false;
  try {
    match = timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));
  } catch {
    match = false;
  }

  if (!match) {
    return res.status(401).json({ error: "סיסמה שגויה" });
  }

  const token = computeToken(adminPassword);
  return res.json({ token });
});

router.get("/admin/verify", requireAdmin, (_req, res) => {
  return res.json({ valid: true });
});

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
