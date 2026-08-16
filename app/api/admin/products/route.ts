import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { productsApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";
import { readJson } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;
  const products = await productsApp.listAll();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const {
    name,
    nameAr,
    slug,
    description,
    descriptionAr,
    price,
    originalPrice,
    category,
    imageUrl,
    images,
    stock,
  } = parsed.body;

  if (!name || !slug || !price || !category || !imageUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const product = await productsApp.create({
      name,
      nameAr: nameAr || "",
      slug,
      description: description || "",
      descriptionAr: descriptionAr || "",
      price,
      originalPrice: originalPrice || null,
      category,
      imageUrl,
      images: images || [],
      stock: stock || 0,
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Could not create product" }, { status: 500 });
  }
}
