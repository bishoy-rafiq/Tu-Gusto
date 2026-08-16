import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, verifyAdminLogin } from "@/application/auth";
import { rateLimit } from "@/infrastructure/security";
import { readJson } from "@/lib/api-utils";
import { supabaseSettingsRepository } from "@/infrastructure/persistence/settings.repository";

export async function POST(req: NextRequest) {
  // Prevent brute force: max 5 attempts per 15 minutes per IP.
  if (rateLimit(req, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const { email, password } = parsed.body;

  const emailNorm = String(email ?? "").trim().toLowerCase();
  const ok = await verifyAdminLogin(emailNorm, String(password ?? ""));
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Notifications (new orders, restock requests, tests) go to the admin user's
  // email automatically — no manual settings needed.
  try {
    await supabaseSettingsRepository.setAdminEmail(emailNorm);
  } catch {
    // Non-fatal: fall back to ADMIN_EMAIL env for notifications.
  }

  const token = await createAdminSession(emailNorm);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
