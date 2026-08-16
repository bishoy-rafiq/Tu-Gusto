self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

let audioCtx = null;

function playChime(url) {
  return fetch(url)
    .then((r) => r.arrayBuffer())
    .then((data) => {
      const AC = self.AudioContext || self.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx.decodeAudioData(data).then((audioBuffer) => {
        const src = audioCtx.createBufferSource();
        src.buffer = audioBuffer;
        src.connect(audioCtx.destination);
        src.start();
      });
    })
    .catch(() => {});
}

self.addEventListener("push", (e) => {
  const data = e.data?.json() || { title: "New Notification", body: "" };
  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: "/icon-192.png",
    data: data.data || {},
  };
  if (data.sound) options.sound = data.sound;

  const tasks = [self.registration.showNotification(data.title, options)];
  if (data.sound) tasks.push(playChime(data.sound));

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
