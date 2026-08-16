import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, getSessionEmail } from "@/application/auth";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminSession(req);
  const email = isAdmin ? await getSessionEmail(req.cookies.get("admin_session")?.value) : null;
  return NextResponse.json({ isAdmin, email });
}
