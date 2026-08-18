"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type SavedOrder = {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  items: { name: string; nameAr?: string; price: string; quantity: number; imageUrl: string }[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  finalTotal: number;
  date: string;
};

export default function FindOrderPage() {
  const { locale } = useParams();
  const router = useRouter();
  const isAr = locale === "ar";

  const [orderNo, setOrderNo] = useState("");
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("atugusto-orders");
      if (raw) setSavedOrders(JSON.parse(raw));
    } catch {}
  }, []);

  function removeSavedOrder(orderId: string) {
    const updated = savedOrders.filter((o) => o.orderId !== orderId);
    setSavedOrders(updated);
    try { localStorage.setItem("atugusto-orders", JSON.stringify(updated)); } catch {}
  }

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

  const displayName = (item: { name: string; nameAr?: string }) =>
    isAr ? item.nameAr || item.name : item.name;

  return (
    <main className="min-h-screen">
      <section className="bg-espresso pt-32 pb-12 md:pt-32 md:pb-16 relative overflow-hidden">
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
                <strong className="text-brand-brown">cancel the order</strong> while it&apos;s still pending.
              </>
            )}
          </div>

          {savedOrders.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-brand-rust/40" />
                <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase">
                  {isAr ? "طلباتي المحفوظة" : "My Saved Orders"}
                </span>
                <span className="w-8 h-px bg-brand-rust/40" />
              </div>

              <div className="space-y-3">
                {savedOrders.map((order) => (
                  <div key={order.orderId} className="card-elevated p-5 relative">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-brand-brown font-semibold text-sm">
                          #{order.orderId.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-muted text-xs mt-0.5">
                          {new Date(order.date).toLocaleDateString(isAr ? "ar-EG" : "en-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-brand-brown font-bold text-sm tabular-nums">{order.finalTotal.toFixed(2)} EGP</p>
                        <p className="text-muted text-[11px]">{order.items.length} {isAr ? "منتجات" : "items"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="w-10 h-10 rounded-lg bg-surface flex-shrink-0 overflow-hidden">
                          <img src={item.imageUrl} alt={displayName(item)} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <span className="text-muted text-xs flex-shrink-0">+{order.items.length - 4}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                      {order.orderId && (
                        <Link
                          href={`/${locale}/orders/${order.orderId}?e=${encodeURIComponent(order.email)}`}
                          className="text-xs text-brand-rust hover:text-brand-tan transition-colors font-medium"
                        >
                          {isAr ? "تتبع" : "Track"} →
                        </Link>
                      )}
                      <button
                        onClick={() => removeSavedOrder(order.orderId)}
                        className="text-xs text-muted hover:text-red-400 transition-colors ml-auto"
                      >
                        {isAr ? "حذف" : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
