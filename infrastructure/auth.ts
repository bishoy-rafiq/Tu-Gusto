// Edge-safe admin session tokens (HMAC-SHA256 signed, no node-only APIs).
// The login password itself is verified by Supabase Auth; this module only
// signs/verifies the "logged in" session cookie.

export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "";
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufToB64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlToBuf(s: string): ArrayBuffer {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// Token format: "<b64url(email)>.<expiresAt>.<hmac-sha256(payload)>"
// Email is base64url-encoded so the "." delimiter is unambiguous.
export async function signSessionToken(
  email: string,
  ttlMs: number = 7 * 24 * 60 * 60 * 1000
): Promise<string> {
  const emailB64 = bufToB64url(new TextEncoder().encode(email));
  const exp = Date.now() + ttlMs;
  const payload = `${emailB64}.${exp}`;
  const key = await hmacKey(sessionSecret());
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${bufToB64url(sig)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !sessionSecret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [emailB64, expStr, sig] = parts;
  if (!emailB64 || !expStr || !sig) return false;

  let email: string;
  try {
    email = new TextDecoder().decode(b64urlToBuf(emailB64));
  } catch {
    return false;
  }
  if (!email) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  try {
    const key = await hmacKey(sessionSecret());
    return await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlToBuf(sig),
      new TextEncoder().encode(`${emailB64}.${expStr}`)
    );
  } catch {
    return false;
  }
}

// Returns the admin email embedded in a valid session token, or null.
export async function getSessionEmail(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [emailB64, expStr] = parts;
  const exp = Number(expStr);
  if (!emailB64 || !Number.isFinite(exp) || Date.now() > exp) return null;
  try {
    const email = new TextDecoder().decode(b64urlToBuf(emailB64));
    return email || null;
  } catch {
    return null;
  }
}
