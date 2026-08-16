import { NextRequest, NextResponse } from "next/server";
import { ordersApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";
import { readJson } from "@/lib/api-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const { action } = parsed.body;

  const result = await ordersApp.bostaAction(id, action);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.order);
}
