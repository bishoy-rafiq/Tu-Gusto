import { NextRequest, NextResponse } from "next/server";

export async function readJson(
  req: NextRequest
): Promise<
  | { ok: true; body: any }
  | { ok: false; error: NextResponse }
> {
  try {
    const body = await req.json();
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }
}
