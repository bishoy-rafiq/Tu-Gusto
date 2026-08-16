import { NextRequest, NextResponse } from "next/server";
import { settingsApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;
  const settings = await settingsApp.get();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;
  let body: { adminEmail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const settings = await settingsApp.updateAdminEmail(body.adminEmail ?? "");
    return NextResponse.json(settings);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
