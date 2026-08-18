import { NextRequest, NextResponse } from "next/server";
import { getCustomerEmailFromToken } from "@/infrastructure/customer-auth";
import { supabaseCustomerRepository } from "@/infrastructure/persistence/customer.repository";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("customer_session")?.value;
  const email = await getCustomerEmailFromToken(token);
  if (!email) {
    return NextResponse.json({ customer: null });
  }
  const customer = await supabaseCustomerRepository.getByEmail(email);
  if (!customer) return NextResponse.json({ customer: null });
  return NextResponse.json({
    customer: {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      notifyProducts: customer.notifyProducts,
      notifyOffers: customer.notifyOffers,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("customer_session")?.value;
  const email = await getCustomerEmailFromToken(token);
  if (!email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const parsed = await req.json().catch(() => null);
  if (!parsed) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const customer = await supabaseCustomerRepository.getByEmail(email);
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed: Record<string, any> = {};
  if (parsed.name !== undefined) allowed.name = String(parsed.name).slice(0, 100);
  if (parsed.phone !== undefined) allowed.phone = String(parsed.phone).slice(0, 30);
  if (parsed.address !== undefined) allowed.address = String(parsed.address).slice(0, 300);
  if (parsed.city !== undefined) allowed.city = String(parsed.city).slice(0, 100);
  if (parsed.notifyProducts !== undefined) allowed.notifyProducts = Boolean(parsed.notifyProducts);
  if (parsed.notifyOffers !== undefined) allowed.notifyOffers = Boolean(parsed.notifyOffers);

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const updated = await supabaseCustomerRepository.update(customer.id, allowed);
  return NextResponse.json({ customer: updated });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("customer_session", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
