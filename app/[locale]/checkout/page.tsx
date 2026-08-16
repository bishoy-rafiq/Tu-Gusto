"use client";

import { useCart } from "@/components/CartContext";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { CITIES, getDeliveryFee } from "@/domain/pricing";
import type { CityDelivery } from "@/domain/entities";
import Link from "next/link";
import Image from "next/image";

type WonPrize = { label: string; code: string };

export default function CheckoutPage() {
  const { items, total, clearCart, hydrated, removeItem } = useCart();
  const params = useParams();
  const locale = params.locale as string;
  const [dict, setDict] = useState<any>(null);
  const displayName = (item: { name: string; nameAr?: string }) =>
    locale === "ar" ? item.nameAr || item.name : item.name;
  const [form, setForm] = useState({ customerName: "", phone: "", email: "", address: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wonPrize, setWonPrize] = useState<WonPrize | null>(null);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [placed, setPlaced] = useState<{ orderId: string } | null>(null);
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `ck_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    import(`@/dictionaries/${locale}.json`).then((m) => setDict(m.default));
  }, [locale]);

  useEffect(() => {
    const saved = localStorage.getItem("wheel-prize");
    if (saved) {
      try {
        const prize: WonPrize = JSON.parse(saved);
        setWonPrize(prize);
        const match = prize.label.match(/(\d+)\s*[%٪]/);
        if (match) {
          setDiscountPercent(Math.min(parseInt(match[1], 10), 100));
          setDiscountApplied(true);
        }
      } catch {}
    }
  }, []);

  const deliveryFee = useMemo(() => {
    return form.city ? getDeliveryFee(form.city) : 0;
  }, [form.city]);

  const discountAmount = useMemo(() => {
    if (!discountApplied || discountPercent === 0) return 0;
    return Math.min(total * (discountPercent / 100), total);
  }, [discountApplied, discountPercent, total]);

  const finalTotal = Math.max(0, total + deliveryFee - discountAmount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.customerName.trim() || !form.phone.trim() || !form.email.trim() || !form.address.trim() || !form.city) {
      setError(locale === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          ...form,
          items,
          deliveryFee,
          discountCode: discountApplied ? wonPrize?.code : null,
          discountLabel: discountApplied ? wonPrize?.label : null,
          discountAmount,
          locale,
        }),
      });

      if (res.ok) {
        if (discountApplied) {
          localStorage.removeItem("wheel-prize");
        }
        clearCart();
        const data = await res.json().catch(() => ({}));
        setPlaced({ orderId: data.orderId || "" });
        setLoading(false);
      } else {
        const data = await res.json().catch(() => ({}));
        const serverError: string = data.error || "";
        if (/Insufficient stock for/i.test(serverError)) {
          const removed: string[] = [];
          items.forEach((item) => {
            if (serverError.includes(item.name)) {
              removeItem(item.productId);
              removed.push(displayName(item));
            }
          });
          if (removed.length > 0) {
            setError(
              locale === "ar"
                ? `المنتجات التالية غير متوفرة حالياً وأزلناها من سلتك: ${removed.join("، ")}`
                : `We removed these out-of-stock items from your cart: ${removed.join(", ")}`
            );
            setLoading(false);
            return;
          }
        }
        setError(serverError || (locale === "ar" ? "حدث خطأ، يرجى المحاولة مرة أخرى" : "Something went wrong. Please try again."));
        setLoading(false);
      }
    } catch {
      setError(locale === "ar" ? "خطأ في الاتصال" : "Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!dict || !hydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-7 h-7 border-2 border-brand-rust border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (placed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 mx-auto mb-6 flex items-center justify-center animate-reveal-scale">
            <svg className="w-10 h-10 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-semibold text-brand-brown mb-3 animate-reveal delay-1">
            {dict.success.title}
          </h1>
          <p className="text-muted text-sm mb-8 animate-reveal delay-2">
            {dict.success.text}
          </p>
          <div className="space-y-3 animate-reveal delay-3">
            {placed.orderId && (
              <Link
                href={`/${locale}/orders/${placed.orderId}?e=${encodeURIComponent(form.email)}`}
                className="btn-accent w-full text-center"
              >
                {locale === "ar" ? "تتبع طلبي" : "Track my order"}
              </Link>
            )}
            <Link href={`/${locale}/products`} className="btn-primary w-full text-center">
              {dict.success.continue}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-surface mx-auto mb-5 flex items-center justify-center">
            <svg className="w-10 h-10 text-muted/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-display font-semibold text-brand-brown mb-2">
            {locale === "ar" ? "سلتك فارغة" : "Your cart is empty"}
          </h1>
          <p className="text-muted text-sm mb-6">
            {locale === "ar" ? "أضف بعض المنتجات أولاً" : "Add some products before checking out"}
          </p>
          <Link href={`/${locale}/products`} className="btn-primary w-full">
            {locale === "ar" ? "تصفح المنتجات" : "Browse Products"}
          </Link>
        </div>
      </main>
    );
  }

  const selectedCity = CITIES.find((c) => c.name === form.city);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden pt-32 pb-12 md:pt-32 md:pb-16 bg-espresso">
        <div className="absolute top-0 left-1/4 w-[350px] h-[350px] rounded-full bg-caramel/[0.05] -translate-y-1/2 blur-[70px] pointer-events-none" />
        <div className="max-w-5xl  mx-auto px-section-x relative z-10">
          <div className="divider mb-2 animate-reveal" />
          <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase mb-4 block animate-reveal">
            {locale === "ar" ? "إتمام الطلب" : "Checkout"}
          </span>
          <h1 className="text-heading text-brand-brown font-display animate-reveal delay-1">
            {dict.checkout.title}
          </h1>
          <p className="text-muted mt-1.5 text-sm animate-reveal delay-2">{dict.checkout.subtitle}</p>
        </div>
      </section>

      <section className="pt-section pb-32 lg:pb-12 px-section-x relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-5" id="checkout-form">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 flex items-center gap-3">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <div className="card-elevated p-6 md:p-8">
                  <h2 className="font-display font-semibold text-brand-brown mb-6 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-brand-rust/10 text-brand-rust text-xs font-bold flex items-center justify-center">1</span>
                    {locale === "ar" ? "المعلومات الشخصية" : "Contact Details"}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-brown mb-1.5">{dict.checkout.name}</label>
                      <input
                        required
                        placeholder={dict.checkout.name}
                        className="input-modern"
                        value={form.customerName}
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-brown mb-1.5">{dict.checkout.phone}</label>
                      <input
                        required
                        placeholder={dict.checkout.phone}
                        className="input-modern"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-brown mb-1.5">
                        {locale === "ar" ? "البريد الإلكتروني" : "Email"}
                      </label>
                      <input
                        required
                        type="email"
                        placeholder={locale === "ar" ? "example@email.com" : "you@example.com"}
                        className="input-modern"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-elevated p-6 md:p-8">
                  <h2 className="font-display font-semibold text-brand-brown mb-6 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-brand-rust/10 text-brand-rust text-xs font-bold flex items-center justify-center">2</span>
                    {locale === "ar" ? "العنوان" : "Delivery Address"}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-brown mb-1.5">{dict.checkout.address}</label>
                      <input
                        required
                        placeholder={dict.checkout.address}
                        className="input-modern"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-brown mb-1.5">{dict.checkout.city}</label>
                      <select
                        required
                        className="input-modern appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238A7E72%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_16px_center] bg-no-repeat pr-12 rtl:bg-[left_16px_center] rtl:pl-12 rtl:pr-4"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                      >
                        <option value="" disabled>{locale === "ar" ? "اختر مدينتك" : "Select your city"}</option>
                        {CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {locale === "ar" ? c.nameAr : c.name} — {c.fee} EGP
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="fixed bottom-0 inset-x-0 z-40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[#1A0F08] via-[#1A0F08]/95 to-transparent lg:hidden">
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={loading || !form.city}
                      className="btn-accent w-full text-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {dict.checkout.placing}
                        </span>
                      ) : dict.checkout.placeOrder}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-5">
              <div className="card-elevated p-7 sticky top-28">
                <h2 className="font-display font-semibold text-brand-brown mb-5">
                  {locale === "ar" ? "ملخص الطلب" : "Order Summary"}
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-5 max-h-56 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-surface rounded-lg relative flex-shrink-0 overflow-hidden">
                        <Image src={item.imageUrl} alt={displayName(item)} fill className="object-cover" sizes="44px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-brown truncate" dir={locale === "ar" ? "rtl" : "ltr"}>{displayName(item)}</p>
                        <p className="text-xs text-muted">× {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-brand-brown">{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">{locale === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span className="text-brand-brown font-medium">{total.toFixed(2)} EGP</span>
                  </div>

                  {form.city && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">
                        {locale === "ar" ? "الشحن إلى" : "Delivery to"} {locale === "ar" ? selectedCity?.nameAr : form.city}
                      </span>
                      <span className="text-brand-brown font-medium">{deliveryFee.toFixed(2)} EGP</span>
                    </div>
                  )}

                  {discountApplied && (
                    <div className="flex justify-between text-sm bg-emerald-500/10 -mx-2 px-3 py-2 rounded-lg">
                      <span className="text-emerald-300 font-medium text-xs flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        {wonPrize?.label}
                      </span>
                      <span className="text-emerald-300 font-medium text-sm">-{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-border/40">
                    <span className="font-semibold text-brand-brown">{locale === "ar" ? "الإجمالي" : "Total"}</span>
                    <span className="text-xl font-bold text-brand-brown">{finalTotal.toFixed(2)} EGP</span>
                  </div>
                </div>

                {!form.city && (
                  <p className="text-[11px] text-muted text-center mt-3">
                    {locale === "ar" ? "اختر المدينة لحساب رسوم التوصيل" : "Select a city to calculate delivery"}
                  </p>
                )}

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading || !form.city}
                  className="btn-accent w-full text-center mt-6 hidden lg:block disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {dict.checkout.placing}
                    </span>
                  ) : dict.checkout.placeOrder}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
