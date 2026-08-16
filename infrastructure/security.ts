import type { NextRequest } from "next/server";

// In-memory rate limiting + idempotency.
// Note: per-instance memory. Good for a single-host deployment; for
// multi-instance serverless, move to Redis (e.g. Upstash) instead.

const buckets = new Map<string, number[]>();
const seenKeys = new Map<string, { at: number; orderId?: string }>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(
  req: NextRequest,
  max: number,
  windowMs: number,
  keySuffix = ""
): boolean {
  const now = Date.now();
  const key = clientIp(req) + (keySuffix ? `:${keySuffix}` : "");
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (arr.length >= max) {
    buckets.set(key, arr);
    return true; // limited
  }

  arr.push(now);
  buckets.set(key, arr);
  return false;
}

export function rememberRequest(
  key: string,
  orderId?: string,
  ttlMs = 10 * 60 * 1000
) {
  const now = Date.now();
  for (const [k, v] of seenKeys) {
    if (now - v.at > ttlMs) seenKeys.delete(k);
  }
  seenKeys.set(key, { at: now, orderId });
}

export function findSeenRequest(key: string): { orderId?: string } | null {
  const entry = seenKeys.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > 10 * 60 * 1000) {
    seenKeys.delete(key);
    return null;
  }
  return { orderId: entry.orderId };
}
