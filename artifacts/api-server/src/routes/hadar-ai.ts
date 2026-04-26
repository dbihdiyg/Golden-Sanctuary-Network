import { Router } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const router = Router();

function getOpenAI() {
  // Prefer the Replit AI Integration proxy (no key required); fall back to direct key
  if (process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("No OpenAI credentials configured");
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

// ── AI Image Generation ───────────────────────────────────────────────────────
router.post("/hadar/generate-image", async (req, res) => {
  const { prompt, size = "1024x1024" } = req.body as {
    prompt?: string;
    size?: "1024x1024" | "1536x1024" | "1024x1536";
  };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const validSizes = ["1024x1024", "1536x1024", "1024x1536"];
  const imgSize = validSizes.includes(size) ? size : "1024x1024";

  // Translate/enhance the Hebrew prompt for better image generation
  const enhancedPrompt = `${prompt.trim()}, high quality, elegant, suitable for a Jewish event invitation card, detailed illustration`;

  try {
    const openai = getOpenAI();
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      size: imgSize as "1024x1024",
      n: 1,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      return res.status(500).json({ error: "No image data returned" });
    }
    return res.json({ b64_json: b64, prompt: enhancedPrompt });
  } catch (err: any) {
    logger.error({ err }, "AI image generation failed");
    return res.status(500).json({ error: err?.message ?? "Image generation failed" });
  }
});

export default router;
