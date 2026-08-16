"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "./CartContext";
import { useToast } from "./ToastContext";
import StockBadge from "./StockBadge";

export default function ProductCard({
  product,
  locale,
  dict,
  featured = false,
}: {
  product: any;
  locale: string;
  dict: any;
  featured?: boolean;
}) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);
  const isAr = locale === "ar";

  const current = parseFloat(product.price);
  const original = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const hasDiscount = original !== null && original > current;
  const percent = hasDiscount ? Math.round(((original! - current) / original!) * 100) : 0;

  const soldOut = product.stock <= 0;
  const categoryLabel = dict.categories?.[product.category] ?? product.category;
  const displayName = isAr ? product.nameAr || product.name : product.name;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr || "",
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setAdded(true);
    toast("success", dict.products?.added || "Added to cart", displayName);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group relative flex flex-col bg-brand-cream rounded-3xl border border-white/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_28px_70px_rgba(0,0,0,0.5)] hover:border-brand-rust/30 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-[#211A13]">
        <Image
          src={product.imageUrl}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {hasDiscount && (
          <span className="absolute top-2.5 start-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-rust text-espresso text-[10px] sm:text-[11px] font-bold shadow-lg shadow-brand-rust/40 tabular-nums">
            −{percent}%
          </span>
        )}

        <span className="absolute top-2.5 end-2.5 px-2 py-0.5 rounded-full bg-espresso/70 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-semibold tracking-[0.08em] uppercase text-brand-tan max-w-[55%] truncate">
          {categoryLabel}
        </span>

        <button
          onClick={quickAdd}
          disabled={soldOut}
          aria-label={isAr ? "أضف إلى السلة" : "Add to cart"}
          className={`absolute bottom-2.5 left-2.5 right-2.5 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] sm:py-2.5 font-semibold flex items-center justify-center gap-2 backdrop-blur-md transition-all duration-300 active:scale-[0.97] ${
            soldOut
              ? "bg-black/30 text-brand-brown/40 cursor-not-allowed"
              : added
              ? "bg-brand-rust text-espresso shadow-lg shadow-brand-rust/40"
              : "bg-surface/90 text-brand-brown hover:bg-brand-rust hover:text-espresso shadow-lg"
          }`}
        >
          {soldOut ? (
            isAr ? "نفذ" : "Sold Out"
          ) : added ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {dict.products?.added || "Added"}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {dict.products?.add || "Add"}
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col flex-1 p-3.5 sm:p-4 md:p-5">
        {featured && (
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase text-brand-rust mb-1.5 truncate">
            {dict.home?.bestseller}
          </span>
        )}
        <h3 className="font-medium text-brand-brown text-[13px] sm:text-[15px] leading-snug group-hover:text-brand-rust transition-colors duration-300 line-clamp-2 min-h-[2.5em]" dir={isAr ? "rtl" : "ltr"}>
          {displayName}
        </h3>
        <div className="mt-auto pt-2.5 sm:pt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span className="font-bold text-brand-brown tabular-nums text-[13px] sm:text-base">
              {current.toFixed(0)} <span className="text-[10px] sm:text-xs font-semibold">EGP</span>
            </span>
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs text-muted/40 line-through tabular-nums">
                {original!.toFixed(0)}
              </span>
            )}
          </div>
          <StockBadge stock={product.stock} locale={locale} />
        </div>
      </div>
    </Link>
  );
}
