import { Router } from "express";
import OpenAI from "openai";
import { pool } from "@workspace/db";
import { requireAdmin } from "./admin.js";

const router = Router();

function getOpenAI() {
  return new OpenAI({
    baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
    apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? "dummy",
  });
}

const SYSTEM_PROMPT = `אתה "רוחניק" — עוזר וירטואלי חם ואוהב של קהילת בוגרי מאירים.
תפקידך לתת חיזוקים, השראה ותמיכה לבוגרים על בסיס תורה, חסידות ומוסר.
תדבר תמיד בעברית בסגנון חם, ידידותי ומעודד.

כללים חשובים:
1. אתה מוגבל אך ורק לנושאי: תורה, חסידות, מוסר, אמונה, תפילה, שבת, יהדות, קהילת מאירים ועדכוני הקהילה.
2. אם שואלים אותך על נושא שאינו קשור לתורה, יהדות או הקהילה — ענה בנימוס שאתה לא יכול לעזור בנושא זה, והצע לדבר על תורה וחסידות.
3. תן חיזוקים ממשיים עם ציטוטים מהתורה, חסידות, תהילים, או אמרות חז"ל.
4. אם המשתמש מביע עניין להצטרף לרשימת התפוצה של הקהילה — שאל לשמו ולטלפון/מייל שלו ואמר לו שיצרת לו רישום. בסוף הבקשה, הוסף בדיוק:
   [REGISTER:שם=X,טלפון=Y,מייל=Z]
   כאשר X, Y, Z הם הפרטים שנמסרו (השאר ריק אם לא נמסר).
5. שמור על גבולות — אל תיתן ייעוץ רפואי, משפטי, פיננסי.
6. אתה יכול לספר על הקהילה: מאירים היא קהילת בוגרי ישיבה מגדל העמק, פעילה בתורה ובחסד.
7. דבר קצר, חם וממוקד — משפטים קצרים עדיפים.`;

router.post("/chat", async (req, res) => {
  const { session_id, message } = req.body;
  if (!session_id || !message?.trim()) {
    return res.status(400).json({ error: "חסרים פרטים" });
  }

  await pool.query(
    `INSERT INTO chatbot_sessions (session_id) VALUES ($1) ON CONFLICT (session_id) DO UPDATE SET last_message_at = NOW()`,
    [session_id]
  );

  await pool.query(
    `INSERT INTO chatbot_messages (session_id, role, content) VALUES ($1, 'user', $2)`,
    [session_id, message.trim()]
  );

  const historyRes = await pool.query(
    `SELECT role, content FROM chatbot_messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT 30`,
    [session_id]
  );

  const chatMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...historyRes.rows.map((r: { role: string; content: string }) => ({
      role: r.role as "user" | "assistant",
      content: r.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const openai = getOpenAI();
  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 800,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        const visible = content.replace(/\[REGISTER:[^\]]*\]/g, "");
        if (visible) {
          res.write(`data: ${JSON.stringify({ content: visible })}\n\n`);
        }
      }
    }

    const match = fullResponse.match(/\[REGISTER:([^\]]*)\]/);
    if (match) {
      const parts = Object.fromEntries(
        match[1].split(",").map((p: string) => p.split("="))
      );
      const name = parts["שם"]?.trim() || "";
      const phone = parts["טלפון"]?.trim() || null;
      const email = parts["מייל"]?.trim() || null;
      if (name) {
        await pool.query(
          `INSERT INTO newsletter_subscribers (name, phone, email, updates, notes)
           VALUES ($1, $2, $3, $4, 'נרשם דרך הצ''אטבוט')
           ON CONFLICT DO NOTHING`,
          [name, phone, email, ["עדכוני קהילה"]]
        );
        await pool.query(
          `UPDATE chatbot_sessions SET user_name = $1, phone = $2, registered_at = NOW() WHERE session_id = $3`,
          [name, phone, session_id]
        );
      }
    }

    const cleanResponse = fullResponse.replace(/\[REGISTER:[^\]]*\]/g, "").trim();
    await pool.query(
      `INSERT INTO chatbot_messages (session_id, role, content) VALUES ($1, 'assistant', $2)`,
      [session_id, cleanResponse]
    );

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "שגיאה בחיבור לשרת" })}\n\n`);
    res.end();
  }
});

router.get("/sessions", requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT s.session_id, s.user_name, s.phone, s.registered_at, s.started_at, s.last_message_at,
            COUNT(m.id) AS message_count
     FROM chatbot_sessions s
     LEFT JOIN chatbot_messages m ON m.session_id = s.session_id
     GROUP BY s.session_id, s.user_name, s.phone, s.registered_at, s.started_at, s.last_message_at
     ORDER BY s.last_message_at DESC`
  );
  res.json(rows);
});

router.get("/sessions/:id/messages", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT role, content, created_at FROM chatbot_messages WHERE session_id = $1 ORDER BY created_at ASC`,
    [req.params.id]
  );
  res.json(rows);
});

export default router;
