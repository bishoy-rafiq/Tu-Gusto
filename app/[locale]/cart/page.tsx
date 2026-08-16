"use client";

import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/ToastContext";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, hydrated } = useCart();
  const { toast } = useToast();
  const params = useParams();
  const locale = params.locale as string;
  const [dict, setDict] = useState<any>(null);
  const displayName = (item: { name: string; nameAr?: string }) =>
    locale === "ar" ? item.nameAr || item.name : item.name;

  useEffect(() => {
    import(`@/dictionaries/${locale}.json`).then((m) => setDict(m.default));
  }, [locale]);

  useEffect(() => {
    if (!hydrated) return;
    const stale = items.filter((i) => i.stock <= 0);
    if (stale.length > 0) {
      stale.forEach((i) => removeItem(i.productId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!dict || !hydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-7 h-7 border-2 border-brand-rust border-t-transparent rounded-full animate-spin" />
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
          <h1 className="text-xl font-display font-semibold text-brand-brown mb-2">{dict.cart.empty}</h1>
          <p className="text-muted text-sm mb-6">
            {locale === "ar" ? "لم تقم بإضافة أي منتجات بعد" : "Looks like you haven't added anything yet"}
          </p>
          <Link href={`/${locale}/products`} className="btn-primary w-full">
            {dict.cart.browse}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden pt-28 pb-12 md:pt-32 md:pb-16 bg-brand-warm">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-caramel/[0.025] -translate-y-1/3 translate-x-1/3 blur-[70px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="divider mb-2 animate-reveal" />
          <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase mb-4 block animate-reveal">
            {locale === "ar" ? "سلة التسوق" : "Your Bag"}
          </span>
          <h1 className="text-heading text-brand-brown font-display animate-reveal delay-1">
            {dict.cart.title}
          </h1>
          <p className="text-muted mt-1.5 text-sm animate-reveal delay-2">
            {items.length} {locale === "ar" ? "منتجات" : "items"}
          </p>
        </div>
      </section>

      {/* Cart content */}
      <section className="py-section px-section-x relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => {
                const soldOut = item.stock <= 0;
                return (
                <div
                  key={item.productId}
                  className={`flex items-center gap-5 bg-brand-cream rounded-2xl p-5 border shadow-xs transition-all duration-400 hover:shadow-md ${
                    soldOut ? "border-red-500/30 opacity-70" : "border-white/[0.06]"
                  }`}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-surface rounded-xl relative flex-shrink-0 overflow-hidden">
                    <Image src={item.imageUrl} alt={displayName(item)} fill className={`object-cover ${soldOut ? "grayscale" : ""}`} sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-brand-brown truncate" dir={locale === "ar" ? "rtl" : "ltr"}>{displayName(item)}</h3>
                    <p className="text-brand-rust font-semibold text-sm mt-0.5">{item.price} EGP</p>
                    {soldOut && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-300 font-semibold mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {locale === "ar" ? "نفذ — سيتم إزالته" : "Sold Out — will be removed"}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`flex items-center gap-0.5 bg-surface rounded-lg px-0.5 py-0.5 ${soldOut ? "pointer-events-none" : ""}`}>
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          disabled={soldOut}
                          className="w-7 h-7 rounded-md hover:bg-surface-hover transition-colors duration-300 flex items-center justify-center text-muted hover:text-brand-brown text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="w-7 text-center font-semibold text-sm text-brand-brown">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={soldOut || (item.stock > 0 && item.quantity >= item.stock)}
                          className="w-7 h-7 rounded-md hover:bg-surface-hover transition-colors duration-300 flex items-center justify-center text-muted hover:text-brand-brown text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      {!soldOut && item.quantity >= item.stock && (
                        <span className="text-[10px] text-amber-300 font-medium">{locale === "ar" ? "الحد الأقصى" : "Max stock"}</span>
                      )}
                      <button
                        onClick={() => {
                          removeItem(item.productId);
                          toast("info", locale === "ar" ? "تمت الإزالة" : "Removed", displayName(item));
                        }}
                        className="text-muted/30 hover:text-brand-rust transition-colors duration-300 p-1.5 rounded-lg hover:bg-red-500/10"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className={`font-semibold tabular-nums ${soldOut ? "text-muted line-through" : "text-brand-brown"}`}>{(parseFloat(item.price) * item.quantity).toFixed(2)} EGP</p>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-4">
              <div className="card-elevated p-7 sticky top-28">
                <h2 className="font-display font-semibold text-brand-brown mb-5">
                  {locale === "ar" ? "ملخص الطلب" : "Order Summary"}
                </h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">{locale === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span className="text-brand-brown font-medium">{total.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">{locale === "ar" ? "الشحن" : "Shipping"}</span>
                    <span className="text-muted text-xs">{locale === "ar" ? "يُحسب عند الدفع" : "Calculated at checkout"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 flex justify-between items-center mb-5">
                  <span className="font-semibold text-brand-brown">{dict.cart.total}</span>
                  <span className="text-lg font-bold text-brand-brown">{total.toFixed(2)} EGP</span>
                </div>

                <Link href={`/${locale}/checkout`} className="btn-accent w-full text-center">
                  {dict.cart.checkout}
                </Link>

                <Link href={`/${locale}/products`} className="btn-ghost w-full text-center mt-2.5 text-sm">
                  {locale === "ar" ? "← متابعة التسوق" : "← Continue Shopping"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
