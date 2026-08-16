"use client";

import { useCart } from "./CartContext";
import { useToast } from "./ToastContext";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function AddToCartButton({
  productId,
  name,
  nameAr = "",
  price,
  imageUrl,
  stock = 0,
  label = "Add to Cart",
  addedLabel = "Added",
  buyLabel = "Buy Now",
  locale: localeProp,
}: {
  productId: string;
  name: string;
  nameAr?: string;
  price: string;
  imageUrl: string;
  stock?: number;
  label?: string;
  addedLabel?: string;
  buyLabel?: string;
  locale?: string;
}) {
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const locale = localeProp ?? (params.locale as string);
  const isAr = locale === "ar";
  const displayName = isAr ? nameAr || name : name;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const outOfStock = stock <= 0;
  const unitPrice = parseFloat(price);
  const total = unitPrice * qty;

  const cartItem = items.find((i) => i.productId === productId);
  const inCart = cartItem?.quantity ?? 0;
  const remaining = Math.max(0, stock - inCart);
  const atLimit = remaining <= 0;

  useEffect(() => {
    if (qty > remaining && remaining > 0) setQty(remaining);
  }, [remaining, qty]);

  if (outOfStock) {
    return (
      <button disabled className="w-full py-3.5 rounded-xl border-2 border-border/40 bg-surface text-muted font-semibold text-[0.9375rem] cursor-not-allowed">
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          {isAr ? "نفذ" : "Sold Out"}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity + Total card */}
      <div className="rounded-2xl border border-coffee-steam/30 p-4 sm:p-5 space-y-3">
        {/* Stock hint */}
        {stock <= 10 && (
          <div className="flex items-center justify-between text-xs">
            {stock <= 5 ? (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {isAr ? `باقي ${remaining} فقط` : `Only ${remaining} left`}
              </span>
            ) : (
              <span className="text-muted">{isAr ? `${remaining} في المخزون` : `${remaining} in stock`}</span>
            )}
            {atLimit && (
              <span className="text-amber-600 font-medium">{isAr ? "تم الوصول للحد" : "Max reached"}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-brand-brown">{isAr ? "الكمية" : "Quantity"}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-border/50 bg-surface/50 flex items-center justify-center text-brand-brown hover:bg-surface hover:border-brand-rust/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>

            <div className="w-12 h-9 sm:w-14 sm:h-10 rounded-xl bg-surface/30 flex items-center justify-center">
              <span className="font-bold text-brand-brown text-base tabular-nums">{qty}</span>
            </div>

            <button
              onClick={() => setQty((q) => Math.min(remaining, q + 1))}
              disabled={qty >= remaining}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-border/50 bg-surface/50 flex items-center justify-center text-brand-brown hover:bg-surface hover:border-brand-rust/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/20">
          <span className="text-sm font-medium text-brand-brown">{isAr ? "الإجمالي" : "Total"}</span>
          <span className="font-bold text-brand-brown tabular-nums">{total.toFixed(2)} EGP</span>
        </div>
      </div>

      {/* Two buttons side by side */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Add to Cart */}
        <button
          disabled={atLimit}
          onClick={() => {
            if (atLimit) return;
            for (let i = 0; i < qty; i++) {
              addItem({ productId, name, nameAr, price, imageUrl, stock });
            }
            setAdded(true);
            setQty(1);
            toast("success", isAr ? "تمت الإضافة" : "Added to cart", displayName);
            setTimeout(() => setAdded(false), 2000);
          }}
          className={`w-full rounded-lg px-3 sm:px-6 py-3.5 text-sm sm:text-[0.9375rem] font-semibold transition-all duration-300 group ${
      atLimit
          ? "border-2 border-border/40 bg-surface text-muted cursor-not-allowed opacity-60"
          : "border-2 border-brand-rust text-brand-rust bg-transparent hover:bg-brand-rust hover:text-espresso"
      }`}
        >
          {added ? (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {addedLabel}
            </span>
          ) : atLimit ? (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              {isAr ? "الحد" : "Max"}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {label}
            </span>
          )}
        </button>

        {/* Buy Now */}
        <button
          disabled={atLimit || buying}
          onClick={() => {
            if (atLimit || buying) return;
            setBuying(true);
            for (let i = 0; i < qty; i++) {
              addItem({ productId, name, nameAr, price, imageUrl, stock });
            }
            toast("info", isAr ? "جاري التوجيه للدفع" : "Heading to checkout", displayName);
            setTimeout(() => {
              router.push(`/${locale}/checkout`);
            }, 300);
          }}
          className={`rounded-xl py-3.5 text-sm sm:text-[0.9375rem] font-semibold transition-all duration-300 ${
            atLimit
              ? "border-2 border-border/40 bg-surface text-muted cursor-not-allowed"
              : "border-2 border-brand-rust text-brand-rust bg-transparent hover:bg-brand-rust hover:text-espresso"
          }`}
        >
          {buying ? (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <div className="w-4 h-4 border-2 border-brand-rust border-t-transparent rounded-full animate-spin" />
              ...
            </span>
          ) : atLimit ? (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              {isAr ? "الحد" : "Max"}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              {buyLabel}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
