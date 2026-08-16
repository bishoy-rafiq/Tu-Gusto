import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { reviewsApp } from "@/infrastructure/composition";
import { rateLimit } from "@/infrastructure/security";
import { readJson } from "@/lib/api-utils";
import { supabaseProductRepository } from "@/infrastructure/persistence/product.repository";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const result = await reviewsApp.listForProduct(productId);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const { productId, name, rating, text } = parsed.body;

  if (!productId || !name || !rating || !text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const product = await supabaseProductRepository.getById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Prevent spam: per-product limit so shared/NAT IPs aren't blocked
  // (10 reviews per 10 minutes for the same product per IP).
  if (rateLimit(req, 10, 10 * 60 * 1000, `review:${productId}`)) {
    return NextResponse.json({ error: "Too many reviews. Try again later." }, { status: 429 });
  }

  const cleanName = String(name).trim();
  const cleanText = String(text).trim();

  if (cleanName.length < 2 || cleanName.length > 60) {
    return NextResponse.json({ error: "Name must be 2-60 characters" }, { status: 400 });
  }
  if (cleanText.length < 2 || cleanText.length > 1000) {
    return NextResponse.json({ error: "Review must be 2-1000 characters" }, { status: 400 });
  }

  const cleanRating = Number(rating);
  if (!Number.isInteger(cleanRating) || cleanRating < 1 || cleanRating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  try {
    const review = await reviewsApp.add({
      productId,
      name: cleanName,
      rating: cleanRating,
      text: cleanText,
    });
    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }
}
