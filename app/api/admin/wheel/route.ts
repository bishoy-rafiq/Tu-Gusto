import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { wheelApp } from "@/infrastructure/composition";
import { requireAdmin } from "@/application/auth";
import { readJson } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;
  const prizes = await wheelApp.listAll();
  return NextResponse.json(prizes);
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const { label, labelAr, code, color, weight } = parsed.body;

  if (!label || !code) {
    return NextResponse.json({ error: "Label and code are required" }, { status: 400 });
  }

  try {
    const prize = await wheelApp.create({
      label,
      labelAr: labelAr || "",
      code,
      color: color || "#C0392B",
      weight: weight || 1,
    });
    return NextResponse.json(prize);
  } catch {
    return NextResponse.json({ error: "Could not create prize" }, { status: 500 });
  }
}
