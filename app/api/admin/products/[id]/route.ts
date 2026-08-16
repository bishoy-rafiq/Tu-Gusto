import { NextRequest, NextResponse } from "next/server";
import { productsApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";
import { readJson } from "@/lib/api-utils";

function isFiniteNonNegative(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const body = parsed.body;

  if ("price" in body && !isFiniteNonNegative(body.price)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }
  if ("stock" in body && (!Number.isInteger(body.stock) || body.stock < 0)) {
    return NextResponse.json({ error: "Invalid stock" }, { status: 400 });
  }
  if ("originalPrice" in body && body.originalPrice !== null && !isFiniteNonNegative(body.originalPrice)) {
    return NextResponse.json({ error: "Invalid original price" }, { status: 400 });
  }
  if ("name" in body && !String(body.name ?? "").trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if ("slug" in body && !String(body.slug ?? "").trim()) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const product = await productsApp.update(id, {
    name: body.name,
    nameAr: body.nameAr,
    slug: body.slug,
    description: body.description,
    descriptionAr: body.descriptionAr,
    price: body.price,
    originalPrice: body.originalPrice,
    category: body.category,
    imageUrl: body.imageUrl,
    images: body.images,
    stock: body.stock,
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(_req);
  if (authError) return authError;

  const { id } = await params;
  await productsApp.remove(id);
  return NextResponse.json({ ok: true });
}
