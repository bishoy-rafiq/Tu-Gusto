import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { ordersApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";
import { OrderError } from "@/domain/errors";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;
  const orders = await ordersApp.listForAdmin();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const body = await req.json();

  try {
    const result = await ordersApp.createFromAdmin(body);
    return NextResponse.json({ orderId: result.orderId, bosta: result.bosta });
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
