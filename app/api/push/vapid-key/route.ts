import { NextResponse } from "next/server";

export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json(
      { error: "VAPID keys not configured. Run: node scripts/generate-vapid-keys.js" },
      { status: 500 }
    );
  }

  return NextResponse.json({ publicKey });
}
