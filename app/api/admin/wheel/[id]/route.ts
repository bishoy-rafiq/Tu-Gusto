import { NextRequest, NextResponse } from "next/server";
import { wheelApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";
import { readJson } from "@/lib/api-utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const { label, labelAr, code, color, weight, active } = parsed.body;

  const prize = await wheelApp.update(id, { label, labelAr, code, color, weight, active });
  if (!prize) {
    return NextResponse.json({ error: "Prize not found" }, { status: 404 });
  }
  return NextResponse.json(prize);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(_req);
  if (authError) return authError;

  const { id } = await params;
  await wheelApp.remove(id);
  return NextResponse.json({ ok: true });
}
