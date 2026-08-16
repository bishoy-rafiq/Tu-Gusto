"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function FindOrderPage() {
  const { locale } = useParams();
  const router = useRouter();
  const isAr = locale === "ar";

  const [orderNo, setOrderNo] = useState("");
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!orderNo.trim() || !email.trim()) {
      setError(isAr ? "أدخل رقم الطلب والبريد الإلكتروني" : "Enter your order number and email");
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/orders/lookup?q=${encodeURIComponent(orderNo.trim())}&e=${encodeURIComponent(email.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (isAr ? "لم نتمكن من العثور على الطلب" : "We couldn't find your order"));
        return;
      }
      const order = await res.json();
      router.push(`/${locale}/orders/${order.id}?e=${encodeURIComponent(email.trim())}`);
    } catch {
      setError(isAr ? "خطأ في الاتصال" : "Network error");
    } finally {
      setSearching(false);
    }
  }

  return (
    <main className="min-h-screen">
      <section className="bg-espresso pt-28 pb-12 md:pt-32 md:pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-caramel/[0.05] -translate-y-1/2 blur-[70px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-section-x relative z-10">
          <div className="divider mb-2" />
          <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase mb-4 block">
            {isAr ? "متابعة الطلب" : "Track Your Order"}
          </span>
          <h1 className="text-heading text-brand-brown font-display">
            {isAr ? "ابحث عن طلبك" : "Find your order"}
          </h1>
          <p className="text-muted mt-1.5 text-sm">
            {isAr ? "أدخل رقم طلبك (مثل #6C8913) والبريد الإلكتروني الذي استخدمته في الطلب" : "Enter your order number (e.g. #6C8913) and the email you ordered with"}
          </p>
        </div>
      </section>

      <section className="py-section px-section-x relative z-10">
        <div className="max-w-xl mx-auto">
          <div className="card-elevated p-8">
            <form onSubmit={search} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 text-sm text-red-300">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1.5">
                  {isAr ? "رقم الطلب" : "Order number"}
                </label>
                <input
                  required
                  placeholder="#6C8913"
                  className="input-modern"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                />
                <p className="text-xs text-muted mt-1.5">
                  {isAr ? "ستجده في رسالة تأكيد الطلب" : "You'll find it in your order confirmation email"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1.5">
                  {isAr ? "البريد الإلكتروني" : "Email"}
                </label>
                <input
                  required
                  type="email"
                  placeholder={isAr ? "example@email.com" : "you@example.com"}
                  className="input-modern"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" disabled={searching} className="btn-accent w-full disabled:opacity-50">
                {searching
                  ? (isAr ? "جارٍ البحث..." : "Searching...")
                  : (isAr ? "البحث عن طلبي" : "Find my order")}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link href={`/${locale}`} className="text-sm text-brand-rust hover:text-brand-tan transition-colors">
                ← {isAr ? "العودة إلى المتجر" : "Back to store"}
              </Link>
              <p className="text-xs text-muted">
                {isAr ? "هل لديك مشكلة؟ راسلنا" : "Need help? Contact us"}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-brand-cream rounded-2xl border border-white/[0.06] p-5 text-sm text-muted leading-relaxed">
            {isAr ? (
              <>
                بعد العثور على طلبك، يمكنك <strong className="text-brand-brown">تعديل تفاصيل التوصيل</strong> أو{" "}
                <strong className="text-brand-brown">إلغاء الطلب</strong> طالما كان لا يزال قيد الانتظار.
              </>
            ) : (
              <>
                Once your order is found, you can <strong className="text-brand-brown">edit the delivery details</strong> or{" "}
                <strong className="text-brand-brown">cancel the order</strong> while it's still pending.
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
