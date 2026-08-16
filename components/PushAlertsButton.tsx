"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "./ToastContext";
import { useAdminI18n } from "@/app/admin/i18n";

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return !!((window.navigator as any).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches;
}

export default function PushAlertsButton() {
  const { toast } = useToast();
  const { t } = useAdminI18n();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [iosStandalone, setIosStandalone] = useState(false);

  const ios = isIOS();
  const pushApiAvailable = typeof window !== "undefined" && "PushManager" in window;

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    if (isIOS()) {
      setIosStandalone(isStandalone());
    }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, []);

  const subscribe = useCallback(async () => {
    if (isIOS()) {
      if (!("PushManager" in window)) {
        toast("info", t("push.iosTitle"), t("push.iosRequires"));
        return;
      }
      if (!isStandalone()) {
        toast("info", t("push.iosTitle"), t("push.iosHint"));
        return;
      }
    }

    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const res = await fetch("/api/push/vapid-key");
      const { publicKey } = await res.json();
      if (!publicKey) throw new Error("no-vapid");

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      const save = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!save.ok) throw new Error("save-failed");

      setSubscribed(true);
      toast("success", t("push.enabled"), t("push.enabledMsg"));
    } catch (err) {
      toast(
        "error",
        t("push.couldnEnable"),
        (err as Error).message === "no-vapid"
          ? t("push.noVapid")
          : t("push.permission")
      );
    } finally {
      setBusy(false);
    }
  }, [toast, t]);

  const unsubscribe = useCallback(async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast("info", t("push.disabled"), t("push.disabledMsg"));
    } catch {
      toast("error", t("push.couldnDisable"), t("common.tryAgain"));
    } finally {
      setBusy(false);
    }
  }, [toast, t]);

  if (supported === null) {
    return <div className="w-36 h-10 rounded-xl bg-surface animate-pulse" />;
  }
  if (!supported) return null;

  const needsIosSetup = ios && (!pushApiAvailable || !iosStandalone);

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={busy}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60 ${
          subscribed
            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25 hover:bg-emerald-500/25"
            : "glass-chip text-brand-tan hover:border-brand-rust/40"
        }`}
      >
        {busy ? (
          <div className="w-4 h-4 border-2 border-brand-rust border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M10 6h4" />
          </svg>
        )}
        {subscribed ? t("push.on") : t("push.enable")}
      </button>

      {needsIosSetup && (
        <span className="text-[11px] text-muted max-w-[240px] leading-snug">
          {pushApiAvailable
            ? t("push.iosHint")
            : t("push.iosRequires")}
        </span>
      )}
    </div>
  );
}
