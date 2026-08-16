import { NextResponse } from "next/server";
import { wheelApp } from "@/infrastructure/composition";
export const dynamic = "force-dynamic";

export async function GET() {
  const prizes = await wheelApp.listActive();
  return NextResponse.json(prizes);
}
