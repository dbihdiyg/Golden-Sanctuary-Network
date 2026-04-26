import { Router } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const router = Router();

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

router.post("/hadar/ai-text", async (req, res) => {
  const { names, eventType, date, style, extraNotes } = req.body;

  if (!names || !eventType) {
    return res.status(400).json({ error: "names and eventType are required" });
  }

  const styleDescriptions: Record<string, string> = {
    luxury: "יוקרתי ואלגנטי",
    chasidi: "חסידי ומסורתי",
    modern: "מודרני ונקי",
    classic: "קלאסי ומכובד",
    gold: "זהוב ומפואר",
    minimal: "מינימליסטי ועדין",
  };

  const styleDesc = styleDescriptions[style] || "מכובד";

  const prompt = `כתוב נוסח הזמנה חגיגי בעברית לאירוע "${eventType}" עבור: ${names}.
תאריך: ${date || "לפי תיאום"}.
סגנון: ${styleDesc}.
${extraNotes ? `הערות נוספות: ${extraNotes}` : ""}

הנוסח צריך להיות:
- בלשון חגיגית ומכובדת, מתאימה לציבור החרדי
- קצר ותמציתי (2-4 שורות)
- עם פנייה חמה ומזמינה
- לא יותר מ-80 מילים
- ללא תאריך עברי אם לא ניתן, פשוט השמט
כתוב רק את הנוסח, ללא הסברים.`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    return res.json({ text });
  } catch (err) {
    logger.error({ err }, "AI text generation failed");
    return res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
