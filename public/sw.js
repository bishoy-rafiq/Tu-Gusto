self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

let audioCtx = null;
let audioBuffer = null;

function getAudioContext() {
  if (audioCtx) return audioCtx;
  try {
    const AC = self.AudioContext || self.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    return audioCtx;
  } catch {
    return null;
  }
}

async function preloadSound(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.arrayBuffer();
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    audioBuffer = await ctx.decodeAudioData(data);
  } catch {}
}

async function playChime(url) {
  try {
    if (!audioBuffer) {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.arrayBuffer();
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") await ctx.resume();
      audioBuffer = await ctx.decodeAudioData(data);
    }

    const ctx = getAudioContext();
    if (!ctx || !audioBuffer) return;
    if (ctx.state === "suspended") await ctx.resume();

    const src = ctx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(ctx.destination);
    src.start(0);
  } catch {}
}

self.addEventListener("push", (e) => {
  const data = e.data?.json() || { title: "New Notification", body: "" };
  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    data: data.data || {},
    tag: data.tag || "order-notification",
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
  };

  if (data.sound) {
    options.sound = data.sound;
  }

  const tasks = [self.registration.showNotification(data.title, options)];

  if (data.sound) {
    tasks.push(playChime(data.sound).catch(() => {}));
  }

  e.waitUntil(Promise.all(tasks));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/admin/orders";

  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
