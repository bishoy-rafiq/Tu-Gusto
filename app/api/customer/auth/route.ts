import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/api-utils";
import { supabaseCustomerRepository } from "@/infrastructure/persistence/customer.repository";
import { supabaseCustomerOtpRepository } from "@/infrastructure/persistence/customer-otp.repository";
import { supabaseCustomerNotificationRepository } from "@/infrastructure/persistence/customer-notification.repository";
import { createCustomerUseCases } from "@/application/customers";
import { sendCustomerOtpEmail } from "@/infrastructure/notifications/customer-email";
import { signCustomerToken } from "@/infrastructure/customer-auth";

const customerApp = createCustomerUseCases({
  customers: supabaseCustomerRepository,
  otps: supabaseCustomerOtpRepository,
  notifications: supabaseCustomerNotificationRepository,
  sendOtpEmail: sendCustomerOtpEmail,
  signToken: signCustomerToken,
});

export async function POST(req: NextRequest) {
  const parsed = await readJson(req);
  if (!parsed.ok) return parsed.error;
  const { email, code } = parsed.body as { email?: string; code?: string };

  if (code && email) {
    const result = await customerApp.verifyOtp(email, code);
    if (!result) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }
    const res = NextResponse.json({ customer: result.customer });
    res.cookies.set("customer_session", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  }

  if (email) {
    const result = await customerApp.requestOtp(email);
    return NextResponse.json({ sent: result.sent });
  }

  return NextResponse.json({ error: "Email required" }, { status: 400 });
}
