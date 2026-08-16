"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const secure =
      location.protocol === "https:" ||
      ["localhost", "127.0.0.1"].includes(location.hostname);
    if (!secure) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
