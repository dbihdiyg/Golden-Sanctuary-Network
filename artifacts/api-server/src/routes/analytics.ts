import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./admin";

const router = Router();

router.post("/analytics/visit", async (req, res) => {
  const { session_id, device_type } = req.body ?? {};
  if (!session_id || !["mobile", "desktop"].includes(device_type)) {
    return res.status(400).json({ error: "invalid params" });
  }
  try {
    await pool.query(
      `INSERT INTO page_visits (session_id, device_type) VALUES ($1, $2)`,
      [session_id, device_type]
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/analytics/heartbeat", async (req, res) => {
  const { session_id, device_type } = req.body ?? {};
  if (!session_id || !["mobile", "desktop"].includes(device_type)) {
    return res.status(400).json({ error: "invalid params" });
  }
  try {
    await pool.query(
      `INSERT INTO active_sessions (session_id, device_type, last_seen)
       VALUES ($1, $2, NOW())
       ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW(), device_type = $2`,
      [session_id, device_type]
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/analytics/fullscreen", async (req, res) => {
  const { session_id } = req.body ?? {};
  if (!session_id) return res.status(400).json({ error: "invalid params" });
  try {
    await pool.query(
      `INSERT INTO fullscreen_events (session_id) VALUES ($1)`,
      [session_id]
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/admin/analytics", requireAdmin, async (_req, res) => {
  try {
    const [totalVisits, deviceBreakdown, activeNow, fullscreenCount, visitsByDay] =
      await Promise.all([
        pool.query(`SELECT COUNT(*) FROM page_visits`),
        pool.query(`
          SELECT device_type, COUNT(*) as count
          FROM page_visits
          GROUP BY device_type
        `),
        pool.query(`
          SELECT COUNT(*) as count, device_type
          FROM active_sessions
          WHERE last_seen > NOW() - INTERVAL '2 minutes'
          GROUP BY device_type
        `),
        pool.query(`SELECT COUNT(*) FROM fullscreen_events`),
        pool.query(`
          SELECT
            DATE_TRUNC('day', visited_at) AS day,
            COUNT(*) AS visits
          FROM page_visits
          WHERE visited_at > NOW() - INTERVAL '7 days'
          GROUP BY day
          ORDER BY day ASC
        `),
      ]);

    const deviceMap: Record<string, number> = {};
    for (const row of deviceBreakdown.rows) {
      deviceMap[row.device_type] = Number(row.count);
    }

    const activeMap: Record<string, number> = {};
    let totalActive = 0;
    for (const row of activeNow.rows) {
      activeMap[row.device_type] = Number(row.count);
      totalActive += Number(row.count);
    }

    return res.json({
      total_visits: Number(totalVisits.rows[0].count),
      desktop_visits: deviceMap["desktop"] ?? 0,
      mobile_visits: deviceMap["mobile"] ?? 0,
      active_now: totalActive,
      active_desktop: activeMap["desktop"] ?? 0,
      active_mobile: activeMap["mobile"] ?? 0,
      fullscreen_count: Number(fullscreenCount.rows[0].count),
      visits_by_day: visitsByDay.rows.map(r => ({
        day: r.day,
        visits: Number(r.visits),
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
