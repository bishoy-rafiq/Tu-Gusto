import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/api-utils";
import { supabaseCustomerRepository } from "@/infrastructure/persistence/customer.repository";
import { sendPushToCustomers } from "@/infrastructure/notifications/customer-push";
import { sendBulkEmail } from "@/infrastructure/notifications/customer-email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const BRAND = {
  espresso: "#141009",
  gold: "#C6A05C",
  surface: "#251E16",
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;

  const { type, title, body, url } = parsed.body as {
    type: "product" | "offer";
    title?: string;
    body?: string;
    url?: string;
  };

  if (!title || !body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  const customers = await supabaseCustomerRepository.listAll();
  const notifyType = type === "product" ? "notifyProducts" : "notifyOffers";
  const recipients = customers.filter((c) => c[notifyType] && c.email);

  // Push notifications
  await sendPushToCustomers({
    title,
    body,
    url: url || SITE_URL,
  });

  // Email notifications
  const emails = recipients.map((c) => c.email);
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;background:${BRAND.espresso}">
      <div style="background:${BRAND.espresso};padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">Tu Gusto</h1>
        <p style="color:${BRAND.gold};margin:6px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase">${esc(title)}</p>
      </div>
      <div style="padding:24px;background:#1E1812;border:1px solid #2E261C;text-align:center;border-radius:0 0 12px 12px">
        <p style="color:#F1E8DB;font-size:15px;margin:0 0 16px">${esc(body)}</p>
        <a href="${esc(url || SITE_URL)}" style="display:inline-block;background:${BRAND.gold};color:${BRAND.espresso};padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">${type === "product" ? "Shop Now" : "View Offer"}</a>
        <p style="color:#6B5D4D;font-size:11px;margin:20px 0 0">Tu Gusto — Premium Coffee Experience</p>
      </div>
    </div>`;

  await sendBulkEmail(emails, title, html);

  return NextResponse.json({ ok: true, push: true, emails: emails.length });
}
