import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { statsApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;
  const stats = await statsApp.get();
  return NextResponse.json(stats);
}
