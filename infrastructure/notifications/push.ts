import { supabasePushSubscriptionRepository } from "@/infrastructure/persistence/push-subscription.repository";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

let webPush: typeof import("web-push") | null = null;

async function getWebPush() {
  if (webPush) return webPush;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    const mod = await import("web-push");
    mod.setVapidDetails(
      `mailto:${ADMIN_EMAIL || "admin@atugusto.com"}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    webPush = mod;
    return webPush;
  }
  return null;
}

export async function sendPushToAdmin(payload: {
  title: string;
  body: string;
  url?: string;
}) {
  const wp = await getWebPush();
  if (!wp) return;

  const subscriptions = await supabasePushSubscriptionRepository.listAll();

  for (const sub of subscriptions) {
    try {
      await wp.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          sound: `${SITE_URL}/sounds/order-chime.mp3`,
          data: { url: payload.url || `${SITE_URL}/admin/orders` },
        })
      );
    } catch {
      // Subscription expired or invalid — remove it
      try {
        await supabasePushSubscriptionRepository.removeById(sub.id);
      } catch {}
    }
  }
}

export async function pushNewOrderNotification(order: {
  id: string;
  customerName: string;
  totalAmount: string | number;
  items: { product: { name: string }; quantity: number }[];
}) {
  const itemsSummary = order.items
    .map((i) => `${i.product.name} ×${i.quantity}`)
    .join(", ");
  await sendPushToAdmin({
    title: `🛒 New Order #${order.id.slice(-6).toUpperCase()}`,
    body: `${order.customerName} — ${order.totalAmount} EGP\n${itemsSummary}`,
  });
}
