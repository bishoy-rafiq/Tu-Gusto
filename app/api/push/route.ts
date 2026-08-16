import { NextRequest, NextResponse } from "next/server";
import { pushApp } from "@/infrastructure/composition";
import { readJson } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;

  try {
    await pushApp.saveSubscription(parsed.body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const { endpoint } = parsed.body;

  try {
    await pushApp.removeSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }
}
