import { NextRequest, NextResponse } from "next/server";
import { ordersApp } from "@/infrastructure/composition";
import { findSeenRequest, rateLimit, rememberRequest } from "@/infrastructure/security";
import { OrderError } from "@/domain/errors";
import { readJson } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const {
    customerName,
    phone,
    address,
    city,
    items,
    discountCode,
    discountLabel,
    discountAmount,
    email,
    locale,
  } = parsed.body;

  // Prevent abuse: max 8 orders per 10 minutes per IP.
  if (rateLimit(req, 8, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  // Idempotency: the same checkout submit must never create a duplicate order.
  const idempotencyKey = req.headers.get("idempotency-key");
  if (idempotencyKey) {
    const seen = findSeenRequest(idempotencyKey);
    if (seen?.orderId) {
      return NextResponse.json({ orderId: seen.orderId, duplicate: true });
    }
  }

  try {
    const { orderId } = await ordersApp.submitCheckout(
      {
        customerName,
        phone,
        address,
        city,
        email,
        items,
        discountCode,
        discountLabel,
        discountAmount,
        requireEmail: true,
      },
      { locale: locale === "ar" ? "ar" : "en" }
    );

    if (idempotencyKey) {
      rememberRequest(idempotencyKey, orderId);
    }

    return NextResponse.json({ orderId });
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
