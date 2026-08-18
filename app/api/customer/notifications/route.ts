import { NextRequest, NextResponse } from "next/server";
import { getCustomerEmailFromToken } from "@/infrastructure/customer-auth";
import { supabaseCustomerRepository } from "@/infrastructure/persistence/customer.repository";
import { supabaseCustomerNotificationRepository } from "@/infrastructure/persistence/customer-notification.repository";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("customer_session")?.value;
  const email = await getCustomerEmailFromToken(token);
  if (!email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const parsed = await req.json().catch(() => null);
  if (!parsed?.endpoint || !parsed?.keys?.p256dh || !parsed?.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const customer = await supabaseCustomerRepository.getByEmail(email);
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabaseCustomerNotificationRepository.save(customer.id, {
    endpoint: parsed.endpoint,
    p256dh: parsed.keys.p256dh,
    auth: parsed.keys.auth,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const parsed = await req.json().catch(() => null);
  if (!parsed?.endpoint) {
    return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
  }
  await supabaseCustomerNotificationRepository.removeByEndpoint(parsed.endpoint);
  return NextResponse.json({ ok: true });
}
