import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/infrastructure/security";
import { readJson } from "@/lib/api-utils";
import { supabaseProductRepository } from "@/infrastructure/persistence/product.repository";
import { adminRestockRequestEmail } from "@/infrastructure/notifications/smtp";

export async function POST(req: NextRequest) {
  // Prevent abuse: max 3 requests per 10 minutes per IP.
  if (rateLimit(req, 3, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const { productId, email } = parsed.body;

  if (!productId || typeof productId !== "string" || productId.length > 64) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  if (
    !email ||
    typeof email !== "string" ||
    email.length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  ) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const product = await supabaseProductRepository.getById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.stock > 0) {
    return NextResponse.json({ error: "Product is in stock" }, { status: 400 });
  }

  try {
    await adminRestockRequestEmail({
      productName: product.nameAr || product.name,
      customerEmail: email,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save request" }, { status: 500 });
  }
}
