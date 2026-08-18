import { supabase } from "./supabase";
import type { CustomerNotification } from "@/domain/customer-entities";
import type { CustomerNotificationRepository } from "@/domain/customer-repositories";

export const supabaseCustomerNotificationRepository: CustomerNotificationRepository = {
  async save(customerId, sub) {
    const { data: existing } = await supabase
      .from("customer_notifications")
      .select("id")
      .eq("endpoint", sub.endpoint)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("customer_notifications")
        .update({ customerId, p256dh: sub.p256dh, auth: sub.auth })
        .eq("id", existing.id);
    } else {
      await supabase.from("customer_notifications").insert({ customerId, ...sub });
    }
  },

  async removeByEndpoint(endpoint) {
    await supabase.from("customer_notifications").delete().eq("endpoint", endpoint);
  },

  async removeByCustomerId(customerId) {
    await supabase.from("customer_notifications").delete().eq("customerId", customerId);
  },

  async listAll() {
    const { data } = await supabase.from("customer_notifications").select("*");
    return (data ?? []) as CustomerNotification[];
  },

  async listByCustomerId(customerId) {
    const { data } = await supabase.from("customer_notifications").select("*").eq("customerId", customerId);
    return (data ?? []) as CustomerNotification[];
  },
};
