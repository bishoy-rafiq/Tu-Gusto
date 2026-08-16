import { NextRequest, NextResponse } from "next/server";
import { reviewsApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;
  const { id } = await params;

  try {
    await reviewsApp.remove(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}
