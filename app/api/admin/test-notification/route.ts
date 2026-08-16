import { NextRequest, NextResponse } from "next/server";
import { notificationPort, settingsApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;
  const { adminEmail } = await settingsApp.get();
  const results = await notificationPort.sendTest({ adminEmail });
  return NextResponse.json(results);
}
