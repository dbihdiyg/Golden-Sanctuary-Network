import { Router } from "express";

const router = Router();

const CHANNEL_ID = "UCdDqqlcExi8gVxHMI4mKpSA";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const KNOWN_SHORTS = new Set([
  "YyjYaoD_eeM",
  "dw-0tv1JCDY",
  "WJR3UNFD-AA",
  "jtECZkvt_WY",
  "fa2zbBBpJto",
]);

function detectCategory(title: string, id: string): string {
  if (KNOWN_SHORTS.has(id)) return "shorts";
  const t = title;
  if (/שיעור|הרצאה|לימוד|דרשה|פרש|פרשת|תורה/.test(t)) return "שיעורים";
  if (/מפגש|כינוס|אירוע|טקס|חגיגה|ריקוד/.test(t)) return "מפגשים";
  if (/שירה|נגינה|מוסיקה|ניגון/.test(t)) return "מוסיקה";
  return "כללי";
}

function parseRSS(xml: string) {
  const entries: { id: string; title: string; category: string; thumbnail: string; published: string }[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const idMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = block.match(/<title>([^<]+)<\/title>/);
    const pubMatch = block.match(/<published>([^<]+)<\/published>/);
    if (!idMatch || !titleMatch) continue;
    const id = idMatch[1].trim();
    const title = titleMatch[1].trim().replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
    const published = pubMatch ? pubMatch[1].trim() : "";
    entries.push({
      id,
      title,
      category: detectCategory(title, id),
      thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      published,
    });
  }
  return entries;
}

let cache: { ts: number; data: unknown } | null = null;
const CACHE_MS = 10 * 60 * 1000;

router.get("/youtube", async (_req, res) => {
  try {
    if (cache && Date.now() - cache.ts < CACHE_MS) {
      return res.json(cache.data);
    }
    const resp = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!resp.ok) throw new Error(`RSS fetch failed: ${resp.status}`);
    const xml = await resp.text();
    const videos = parseRSS(xml);
    const data = { videos, fetchedAt: new Date().toISOString() };
    cache = { ts: Date.now(), data };
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
