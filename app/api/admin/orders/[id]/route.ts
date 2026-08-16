import { NextRequest, NextResponse } from "next/server";
import { ordersApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";
import { OrderError } from "@/domain/errors";
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

  try {
    const { order, whatsappLink } = await ordersApp.updateFromAdmin(id, parsed.body);

    if (whatsappLink) {
      return NextResponse.json({ ...order, _whatsappLink: whatsappLink });
    }
    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(_req);
  if (authError) return authError;

  const { id } = await params;

  try {
    await ordersApp.removeFromAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Could not delete order" }, { status: 500 });
  }
}
