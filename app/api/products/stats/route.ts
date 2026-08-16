import { NextRequest, NextResponse } from "next/server";
import { productsApp } from "@/infrastructure/composition";

export async function POST(req: NextRequest) {
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const views = await productsApp.incrementViews(productId);
  return NextResponse.json({ views });
}
