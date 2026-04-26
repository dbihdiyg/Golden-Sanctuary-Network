/**
 * HMAC-signed expiring download URLs for secure video delivery.
 *
 * Token format: base64url({ jobId, exp }) + "." + HMAC-SHA256 signature
 * Recipients can download without being logged in, but only if they have the link.
 * Links expire after TOKEN_TTL_HOURS hours.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.DOWNLOAD_LINK_SECRET || process.env.ADMIN_SECRET || "hadar-dev-secret";
const TOKEN_TTL_HOURS = parseInt(process.env.DOWNLOAD_LINK_TTL_HOURS ?? "48", 10);

function b64url(buf: Buffer | string): string {
  const s = typeof buf === "string" ? Buffer.from(buf) : buf;
  return s.toString("base64url");
}

function fromB64url(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

export function generateDownloadToken(jobId: number): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_HOURS * 3600;
  const payload = b64url(JSON.stringify({ jobId, exp }));
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export interface TokenPayload {
  jobId: number;
  exp: number;
}

export function verifyDownloadToken(token: string): TokenPayload | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expectedSig = createHmac("sha256", SECRET).update(payload).digest("base64url");
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expectedSig, "base64url");
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    const parsed = JSON.parse(fromB64url(payload)) as TokenPayload;
    if (Math.floor(Date.now() / 1000) > parsed.exp) return null; // expired
    return parsed;
  } catch {
    return null;
  }
}

export function getDownloadUrl(jobId: number, baseUrl: string): string {
  const token = generateDownloadToken(jobId);
  return `${baseUrl}/api/hadar/dl/${token}`;
}
