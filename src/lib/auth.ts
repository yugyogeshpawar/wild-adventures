export const ADMIN_COOKIE_NAME = "admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24; // 24 hours

const SECRET = process.env.ADMIN_SESSION_SECRET || "wild-adventures-luxury-secret-key-2026";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

/**
 * Validate username and password against environment configuration.
 */
export function validateCredentials(password: string, username?: string): boolean {
  const validPassword = password === ADMIN_PASSWORD;
  const validUsername = !username || username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
  return validPassword && validUsername;
}

function strToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64url");
  }
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64url: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64url, "base64url").toString("utf-8");
  }
  let b64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return decodeURIComponent(escape(atob(b64)));
}

async function sign(data: string, secretKey: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    strToBuffer(secretKey) as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, strToBuffer(data) as BufferSource);
  return bufferToHex(signature);
}

export async function createSessionToken(username = "admin"): Promise<string> {
  const exp = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = JSON.stringify({ username, exp });
  const encodedPayload = toBase64Url(payload);
  const signature = await sign(encodedPayload, SECRET);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<{ username: string } | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSignature = await sign(encodedPayload, SECRET);
    if (signature !== expectedSignature) return null;

    const payloadJson = fromBase64Url(encodedPayload);
    const payload = JSON.parse(payloadJson);

    if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return null;
    }

    return { username: payload.username || "admin" };
  } catch {
    return null;
  }
}
