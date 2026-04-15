import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./admin";

const router = Router();

function detectBrowser(ua: string): string {
  if (!ua) return "unknown";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari";
  if (/MSIE|Trident/.test(ua)) return "IE";
  return "Other";
}

router.post("/analytics/visit", async (req, res) => {
  const { session_id, device_type, page, referrer } = req.body ?? {};
  if (!session_id || !["mobile", "desktop"].includes(device_type)) {
    return res.status(400).json({ error: "invalid params" });
  }
  const browser = detectBrowser(req.headers["user-agent"] ?? "");
  const safePage = typeof page === "string" ? page.slice(0, 200) : "/";
  const safeReferrer = typeof referrer === "string" ? referrer.slice(0, 500) : null;

  try {
    const existing = await pool.query(
      `SELECT 1 FROM page_visits WHERE session_id = $1 LIMIT 1`,
      [session_id]
    );
    const isNew = existing.rowCount === 0;

    await pool.query(
      `INSERT INTO page_visits (session_id, device_type, page, browser, referrer, is_new_visitor)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [session_id, device_type, safePage, browser, safeReferrer, isNew]
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
    const [
      totalVisits,
      deviceBreakdown,
      activeNow,
      fullscreenCount,
      visitsByDay30,
      peakHours,
      topPages,
      browserBreakdown,
      todayYesterday,
      newVsReturning,
      recentVisits,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM page_visits`),

      pool.query(`
        SELECT device_type, COUNT(*) as count
        FROM page_visits GROUP BY device_type
      `),

      pool.query(`
        SELECT COUNT(*) as count, device_type
        FROM active_sessions
        WHERE last_seen > NOW() - INTERVAL '10 minutes'
        GROUP BY device_type
      `),

      pool.query(`SELECT COUNT(*) FROM fullscreen_events`),

      pool.query(`
        SELECT DATE_TRUNC('day', visited_at) AS day, COUNT(*) AS visits
        FROM page_visits
        WHERE visited_at > NOW() - INTERVAL '30 days'
        GROUP BY day ORDER BY day ASC
      `),

      pool.query(`
        SELECT EXTRACT(HOUR FROM visited_at)::int AS hour, COUNT(*) AS visits
        FROM page_visits
        GROUP BY hour ORDER BY hour ASC
      `),

      pool.query(`
        SELECT page, COUNT(*) AS visits
        FROM page_visits
        WHERE page IS NOT NULL
        GROUP BY page
        ORDER BY visits DESC
        LIMIT 10
      `),

      pool.query(`
        SELECT browser, COUNT(*) AS visits
        FROM page_visits
        WHERE browser IS NOT NULL
        GROUP BY browser
        ORDER BY visits DESC
      `),

      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE) AS today,
          COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE - INTERVAL '1 day'
            AND visited_at < CURRENT_DATE) AS yesterday
        FROM page_visits
      `),

      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE is_new_visitor = TRUE) AS new_visitors,
          COUNT(*) FILTER (WHERE is_new_visitor = FALSE) AS returning_visitors
        FROM page_visits
      `),

      pool.query(`
        SELECT page, device_type, browser, visited_at
        FROM page_visits
        ORDER BY visited_at DESC
        LIMIT 20
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

    const todayRow = todayYesterday.rows[0];
    const nvRow = newVsReturning.rows[0];

    const hoursMap: Record<number, number> = {};
    for (const row of peakHours.rows) {
      hoursMap[row.hour] = Number(row.visits);
    }
    const peakHoursArr = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      visits: hoursMap[h] ?? 0,
    }));

    return res.json({
      total_visits: Number(totalVisits.rows[0].count),
      desktop_visits: deviceMap["desktop"] ?? 0,
      mobile_visits: deviceMap["mobile"] ?? 0,
      active_now: totalActive,
      active_desktop: activeMap["desktop"] ?? 0,
      active_mobile: activeMap["mobile"] ?? 0,
      fullscreen_count: Number(fullscreenCount.rows[0].count),
      visits_by_day: visitsByDay30.rows.map(r => ({
        day: r.day,
        visits: Number(r.visits),
      })),
      peak_hours: peakHoursArr,
      top_pages: topPages.rows.map(r => ({
        page: r.page || "/",
        visits: Number(r.visits),
      })),
      browser_breakdown: browserBreakdown.rows.map(r => ({
        browser: r.browser,
        visits: Number(r.visits),
      })),
      today_visits: Number(todayRow?.today ?? 0),
      yesterday_visits: Number(todayRow?.yesterday ?? 0),
      new_visitors: Number(nvRow?.new_visitors ?? 0),
      returning_visitors: Number(nvRow?.returning_visitors ?? 0),
      recent_visits: recentVisits.rows.map(r => ({
        page: r.page || "/",
        device_type: r.device_type,
        browser: r.browser,
        visited_at: r.visited_at,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
