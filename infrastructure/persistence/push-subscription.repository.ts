import { supabase } from "./supabase";
import type { PushSubscription } from "@/domain/entities";
import type {
  PushSubscriptionInput,
  PushSubscriptionRepository,
} from "@/domain/repositories";

export const supabasePushSubscriptionRepository: PushSubscriptionRepository = {
  async save(sub: PushSubscriptionInput) {
    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", sub.endpoint)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("push_subscriptions")
        .update({ p256dh: sub.p256dh, auth: sub.auth })
        .eq("id", existing.id);
    } else {
      await supabase.from("push_subscriptions").insert(sub);
    }
  },

  async removeByEndpoint(endpoint) {
    await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  },

  async removeById(id) {
    await supabase.from("push_subscriptions").delete().eq("id", id);
  },

  async listAll() {
    const { data } = await supabase.from("push_subscriptions").select("*");
    return (data ?? []) as PushSubscription[];
  },
};
