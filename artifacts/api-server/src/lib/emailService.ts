import nodemailer from "nodemailer";
import { logger } from "./logger";

const BRAND_NAME = "הדר — עיצוב דיגיטלי";
const BRAND_COLOR = "#D6A84F";
const NAVY = "#0B1833";

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

function baseTemplate(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin:0; padding:0; background:#f4f0e8; font-family: Arial, sans-serif; direction:rtl; }
    .wrapper { max-width:600px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
    .header { background:${NAVY}; padding:28px 32px; text-align:center; }
    .header h1 { color:${BRAND_COLOR}; margin:0; font-size:22px; letter-spacing:.5px; }
    .header p { color:rgba(255,255,255,.5); margin:4px 0 0; font-size:13px; }
    .body { padding:32px; color:#222; line-height:1.6; }
    .cta { display:inline-block; margin:24px 0 0; padding:13px 28px; background:${BRAND_COLOR}; color:${NAVY}; font-weight:bold; border-radius:50px; text-decoration:none; font-size:15px; }
    .footer { background:#f9f5ed; padding:18px 32px; text-align:center; font-size:12px; color:#999; border-top:1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${BRAND_NAME}</h1>
      <p>עיצוב דיגיטלי לאירועים חרדיים</p>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">הודעה זו נשלחה על ידי ${BRAND_NAME}. &copy; ${new Date().getFullYear()} כל הזכויות שמורות.</div>
  </div>
</body>
</html>`;
}

export async function sendVideoReadyEmail(opts: {
  to: string;
  name: string;
  videoTitle: string;
  jobId: number;
  downloadUrl: string;
}): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    logger.warn("[EmailService] Email not configured (GMAIL_USER/GMAIL_APP_PASSWORD missing) — skipping video-ready notification");
    return;
  }

  const greet = opts.name ? `שלום ${opts.name},` : "שלום,";
  const body = `
    <p>${greet}</p>
    <p>הסרטון שלך <strong>"${opts.videoTitle}"</strong> מוכן!</p>
    <p>תוכלו להוריד את הסרטון המוכן ישירות מהלינק למטה:</p>
    <a class="cta" href="${opts.downloadUrl}">הורדת הסרטון</a>
    <p style="margin-top:24px; color:#666; font-size:13px;">הלינק בתוקף לזמן מוגבל. שמרו את הסרטון למכשירכם בהקדם.</p>
    <p style="color:#666; font-size:13px;">מספר הזמנה: <strong>#${opts.jobId}</strong></p>
  `;

  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.GMAIL_USER}>`,
    to: opts.to,
    subject: `🎬 הסרטון שלך מוכן — ${opts.videoTitle}`,
    html: baseTemplate(body),
  });

  logger.info(`[EmailService] Video-ready email sent to ${opts.to} for job #${opts.jobId}`);
}

export async function sendVideoFailedEmail(opts: {
  to: string;
  name: string;
  videoTitle: string;
  jobId: number;
  supportUrl: string;
}): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    logger.warn("[EmailService] Email not configured — skipping video-failed notification");
    return;
  }

  const greet = opts.name ? `שלום ${opts.name},` : "שלום,";
  const body = `
    <p>${greet}</p>
    <p>מצטערים לעדכן שאירעה תקלה בעיבוד הסרטון שלך <strong>"${opts.videoTitle}"</strong>.</p>
    <p>הצוות שלנו יבדוק את הבעיה ויצור איתך קשר בהקדם. ניתן גם לפנות ישירות לתמיכה:</p>
    <a class="cta" href="${opts.supportUrl}">פנייה לתמיכה</a>
    <p style="margin-top:24px; color:#666; font-size:13px;">מספר הזמנה: <strong>#${opts.jobId}</strong></p>
  `;

  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.GMAIL_USER}>`,
    to: opts.to,
    subject: `תקלה בעיבוד הסרטון — ${opts.videoTitle}`,
    html: baseTemplate(body),
  });

  logger.info(`[EmailService] Video-failed email sent to ${opts.to} for job #${opts.jobId}`);
}

export async function sendAdminVideoFailedAlert(opts: {
  jobId: number;
  videoTitle: string;
  error: string;
}): Promise<void> {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
  if (!transporter || !adminEmail) return;

  await transporter.sendMail({
    from: `"${BRAND_NAME} System" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: `[HADAR] Render Failed — Job #${opts.jobId}`,
    html: `<pre>Job #${opts.jobId}: ${opts.videoTitle}\n\nError:\n${opts.error}</pre>`,
  });
}
