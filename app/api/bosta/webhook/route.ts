import { NextRequest, NextResponse } from "next/server";
import { ordersApp } from "@/infrastructure/composition";
import { timingSafeEqualString } from "@/infrastructure/auth";

export async function POST(req: NextRequest) {
  const secret = process.env.BOSTA_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 401 });
  }
  const header =
    req.headers.get("authorization") ||
    req.headers.get("x-bosta-secret") ||
    req.headers.get("x-webhook-secret");
  if (!header || !timingSafeEqualString(header, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const result = await ordersApp.handleBostaWebhook(body);

  if (result.notFound) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: result.ok });
}
