import { supabase } from "@/infrastructure/persistence/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

let webPush: typeof import("web-push") | null = null;

async function getWebPush() {
  if (webPush) return webPush;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    const mod = await import("web-push");
    mod.setVapidDetails(
      `mailto:${process.env.ADMIN_EMAIL || "admin@atugusto.com"}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    webPush = mod;
    return webPush;
  }
  return null;
}

export async function sendPushToCustomers(payload: {
  title: string;
  body: string;
  url?: string;
}) {
  const wp = await getWebPush();
  if (!wp) return;

  const { data } = await supabase
    .from("customer_notifications")
    .select("*");
  const subs = (data ?? []) as { id: string; endpoint: string; p256dh: string; auth: string }[];

  for (const sub of subs) {
    try {
      await wp.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          sound: `${SITE_URL}/sounds/order-chime.mp3`,
          data: { url: payload.url || SITE_URL },
        })
      );
    } catch {
      try {
        await supabase.from("customer_notifications").delete().eq("id", sub.id);
      } catch {}
    }
  }
}
