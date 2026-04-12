import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./admin.js";

const router = Router();

router.post("/subscribe", async (req, res) => {
  const { name, phone, email, studied, contact_person, updates } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "שם חובה" });

  const { rows } = await pool.query(
    `INSERT INTO newsletter_subscribers (name, phone, email, studied, contact_person, updates)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [name.trim(), phone || null, email || null, studied || null, contact_person || null, updates || []]
  );
  res.json({ ok: true, id: rows[0].id });
});

router.get("/subscribers", requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, phone, email, studied, contact_person, updates, joined_at, is_active, notes
     FROM newsletter_subscribers ORDER BY joined_at DESC`
  );
  res.json(rows);
});

router.patch("/subscribers/:id", requireAdmin, async (req, res) => {
  const { is_active, notes } = req.body;
  const { id } = req.params;
  await pool.query(
    `UPDATE newsletter_subscribers SET is_active = COALESCE($1, is_active), notes = COALESCE($2, notes) WHERE id = $3`,
    [is_active ?? null, notes ?? null, id]
  );
  res.json({ ok: true });
});

router.delete("/subscribers/:id", requireAdmin, async (req, res) => {
  await pool.query(`DELETE FROM newsletter_subscribers WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

export default router;
