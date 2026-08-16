import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, signSessionToken } from "@/infrastructure/auth";
import { supabase } from "@/infrastructure/persistence/supabase";

export { getSessionEmail } from "@/infrastructure/auth";

export async function verifyAdminSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_session")?.value;
  return verifySessionToken(token);
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const ok = await verifyAdminSession(req);
  if (ok) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Verify credentials against Supabase Auth (email + password).
export async function verifyAdminLogin(email: string, password: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  } catch {
    return false;
  }
}

export async function createAdminSession(email: string): Promise<string> {
  return signSessionToken(email);
}
