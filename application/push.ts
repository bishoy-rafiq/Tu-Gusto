import type { PushSubscriptionRepository } from "@/domain/repositories";

export interface PushUseCases {
  saveSubscription(subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }): Promise<void>;
  removeSubscription(endpoint: string): Promise<void>;
}

export function createPushUseCases(deps: {
  pushSubscriptions: PushSubscriptionRepository;
}): PushUseCases {
  return {
    async saveSubscription(subscription) {
      if (
        !subscription?.endpoint ||
        !subscription?.keys?.p256dh ||
        !subscription?.keys?.auth
      ) {
        throw new Error("Invalid subscription");
      }
      await deps.pushSubscriptions.save({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });
    },

    async removeSubscription(endpoint) {
      if (!endpoint) throw new Error("Missing endpoint");
      await deps.pushSubscriptions.removeByEndpoint(endpoint);
    },
  };
}
