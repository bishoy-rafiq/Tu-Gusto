import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getSessionEmail } from "@/application/auth";
import { supabase } from "@/infrastructure/persistence/supabase";
import { rateLimit } from "@/infrastructure/security";
import { readJson } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  // Prevent brute force on the current-password check.
  if (rateLimit(req, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const { currentPassword, newPassword } = parsed.body;

  const current = String(currentPassword ?? "");
  const next = String(newPassword ?? "");
  if (next.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const email = await getSessionEmail(req.cookies.get("admin_session")?.value);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the current password against Supabase Auth, then update.
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: current });
  if (error || !data.session) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  const { error: updateError } = await supabase.auth.updateUser({ password: next });
  if (updateError) {
    return NextResponse.json({ error: "Could not change password" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
