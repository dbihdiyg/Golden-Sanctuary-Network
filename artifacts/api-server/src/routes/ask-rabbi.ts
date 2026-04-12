import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

const TO_EMAIL = "O462272103@GMAIL.COM";

function createTransporter() {
  const user = process.env["GMAIL_USER"] ?? TO_EMAIL;
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

router.post("/ask-rabbi", async (req, res) => {
  const { name, contact, topic, question } = req.body ?? {};

  if (!name || !question) {
    return res.status(400).json({ error: "שם ושאלה הם שדות חובה" });
  }

  const transporter = createTransporter();
  if (!transporter) {
    return res.status(503).json({ error: "שירות המייל אינו מוגדר עדיין" });
  }

  const htmlBody = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #d4a62a;">שאלה חדשה לרבני הקהילה</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px; font-weight:bold;">שם:</td><td style="padding:8px;">${name}</td></tr>
        <tr><td style="padding:8px; font-weight:bold;">אימייל / טלפון:</td><td style="padding:8px;">${contact || "לא צוין"}</td></tr>
        <tr><td style="padding:8px; font-weight:bold;">נושא:</td><td style="padding:8px;">${topic || "לא צוין"}</td></tr>
      </table>
      <h3 style="margin-top:16px;">השאלה:</h3>
      <p style="background:#f5f5f5; padding:16px; border-radius:8px; white-space:pre-wrap;">${question}</p>
      <hr style="margin-top:24px;"/>
      <p style="color:#888; font-size:12px;">נשלח מאתר בוגרי מאירים</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"בוגרי מאירים" <${process.env["GMAIL_USER"] ?? TO_EMAIL}>`,
      to: TO_EMAIL,
      subject: `שאלה חדשה מ${name}${topic ? ` — ${topic}` : ""}`,
      html: htmlBody,
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "שגיאה בשליחת המייל. נסה שנית." });
  }
});

export default router;
