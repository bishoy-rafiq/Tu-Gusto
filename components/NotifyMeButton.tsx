"use client";

import { useState } from "react";
import { useToast } from "./ToastContext";

export default function NotifyMeButton({ productId, locale = "en" }: { productId: string; locale?: string }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const isAr = locale === "ar";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (isAr ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong. Try again."));
        setSending(false);
        return;
      }
    } catch {
      setError(isAr ? "خطأ في الاتصال، حاول مرة أخرى" : "Network error. Please try again.");
      setSending(false);
      return;
    }

    setSending(false);
    setSubmitted(true);
    toast("success", isAr ? "انت في القائمة!" : "You're on the list!", email);
  }

  if (submitted) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 text-center">
        <div className="w-10 h-10 rounded-full bg-emerald-500/15 mx-auto mb-3 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <p className="text-emerald-300 text-sm font-semibold mb-1">
          {isAr ? "انت في القائمة!" : "You're on the list!"}
        </p>
        <p className="text-emerald-300/70 text-xs">
          {isAr ? "هنبعتلك إيميل لما المنتج يرجع للمخزون." : "We'll email you when this product is back in stock."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream rounded-2xl border border-brand-rust/20 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-brand-rust/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-brand-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-brand-brown text-sm">
            {isAr ? "اطلب إشعار عند التوفر" : "Get notified when it's back"}
          </p>
          <p className="text-muted text-xs mt-0.5">
            {isAr ? "سنبعتلك إيميل مرة واحدة لما المنتج يرجع." : "We'll send you a one-time email when restocked."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        <div className="flex gap-2">
          <input
            required
            type="email"
            placeholder="your@email.com"
            className="input-modern flex-1 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending}
            className="btn-accent px-5 flex-shrink-0 disabled:opacity-50"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isAr ? "أبلغني" : "Notify Me"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
