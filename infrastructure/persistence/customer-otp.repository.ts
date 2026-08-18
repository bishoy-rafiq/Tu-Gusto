import { supabase } from "./supabase";
import type { CustomerOtp } from "@/domain/customer-entities";
import type { CustomerOtpRepository } from "@/domain/customer-repositories";

export const supabaseCustomerOtpRepository: CustomerOtpRepository = {
  async save(email, code, expiresAt) {
    await supabase.from("customer_otps").insert({
      email: email.toLowerCase().trim(),
      code,
      expiresAt: expiresAt.toISOString(),
    });
  },

  async getValid(email, code) {
    const { data } = await supabase
      .from("customer_otps")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("code", code)
      .eq("used", false)
      .gt("expiresAt", new Date().toISOString())
      .order("createdAt", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data ?? null) as CustomerOtp | null;
  },

  async markUsed(id) {
    await supabase.from("customer_otps").update({ used: true }).eq("id", id);
  },

  async cleanup() {
    await supabase.from("customer_otps").delete().lt("expiresAt", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  },
};
