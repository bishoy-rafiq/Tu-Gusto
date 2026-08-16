import { NextRequest, NextResponse } from "next/server";
import { ordersApp } from "@/infrastructure/composition";
import { OrderError } from "@/domain/errors";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "")
    .trim()
    .replace(/^#/, "")
    .toLowerCase();
  const email = (req.nextUrl.searchParams.get("e") || "").trim().toLowerCase();

  try {
    const order = await ordersApp.lookup(q, email);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
