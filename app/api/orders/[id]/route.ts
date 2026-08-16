import { NextRequest, NextResponse } from "next/server";
import { ordersApp } from "@/infrastructure/composition";
import { OrderError } from "@/domain/errors";
import { readJson } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const email = req.nextUrl.searchParams.get("e") || "";
  const order = await ordersApp.getForCustomer(id, email);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const email = parsed.body.email || "";
  const locale = parsed.body.locale === "ar" ? "ar" : "en";

  const order = await ordersApp.getForCustomer(id, email);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    await ordersApp.cancelByCustomer(id, email, locale);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Could not cancel order" }, { status: 500 });
  }
}
