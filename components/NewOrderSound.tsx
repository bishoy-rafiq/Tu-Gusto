"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "./ToastContext";
import { useAdminI18n } from "@/app/admin/i18n";
import { playOrderSound } from "./orderSound";

type Order = {
  id: string;
  customerName: string;
  totalAmount: string;
};

export default function NewOrderSound() {
  const { toast } = useToast();
  const { t } = useAdminI18n();
  const [soundOn, setSoundOn] = useState(true);
  const known = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const soundOnRef = useRef(true);
  soundOnRef.current = soundOn;

  useEffect(() => {
    try {
      if (localStorage.getItem("order-sound") === "off") setSoundOn(false);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("order-sound", soundOn ? "on" : "off");
    } catch {}
  }, [soundOn]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) return;
        const orders: Order[] = await res.json();
        if (cancelled) return;

        if (!initialized.current) {
          initialized.current = true;
          orders.forEach((o) => known.current.add(o.id));
          return;
        }

        for (const o of orders) {
          if (known.current.has(o.id)) continue;
          known.current.add(o.id);
          if (soundOnRef.current) playOrderSound();
          toast("success", t("sound.newOrder").replace("{id}", o.id.slice(-6).toUpperCase()), `${o.customerName} — ${o.totalAmount} EGP`);
        }
      } catch {}
    }

    const first = setTimeout(poll, 1500);
    const timer = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [toast, t]);

  return (
    <button
      onClick={() => setSoundOn((s) => !s)}
      title={soundOn ? t("sound.onTitle") : t("sound.offTitle")}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        soundOn ? "glass-chip text-brand-tan hover:border-brand-rust/40" : "bg-white/[0.04] text-muted hover:text-brand-tan"
      }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
      {soundOn ? t("sound.on") : t("sound.off")}
    </button>
  );
}
