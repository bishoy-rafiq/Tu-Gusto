"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  imageUrl: string;
  images: string[];
  name: string;
  stock?: number;
  locale?: string;
};

function SoldOutOverlay({ locale = "en" }: { locale?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div className="relative bg-red-600 text-white font-display font-bold text-lg md:text-xl tracking-wide px-8 py-3 rounded-xl -rotate-12 shadow-2xl shadow-red-600/30">
        {locale === "ar" ? "نفذ" : "SOLD OUT"}
      </div>
    </div>
  );
}

function LowStockBadge({ stock, locale = "en" }: { stock: number; locale?: string }) {
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-amber-500 text-white text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        {locale === "ar" ? `باقي ${stock} فقط` : `Only ${stock} left`}
      </div>
    </div>
  );
}

export default function ProductGallery({ imageUrl, images, name, stock = 0, locale = "en" }: Props) {
  const allImages = [imageUrl, ...images].filter(Boolean);
  const [active, setActive] = useState(0);
  const outOfStock = stock <= 0;
  const isAr = locale === "ar";

  if (allImages.length <= 1) {
    return (
      <div className="aspect-square bg-brand-cream rounded-[2rem] overflow-hidden relative shadow-lg shadow-black/30 border border-white/[0.06] animate-reveal">
        <Image
          src={allImages[0] || imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover ${outOfStock ? "grayscale-[30%]" : ""}`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/[0.25] to-transparent pointer-events-none" />
        {outOfStock && <SoldOutOverlay locale={locale} />}
        {!outOfStock && stock <= 5 && <LowStockBadge stock={stock} locale={locale} />}
      </div>
    );
  }

  return (
    <div className="animate-reveal">
      {/* Main image */}
      <div className="aspect-square bg-brand-cream rounded-[2rem] overflow-hidden relative shadow-lg shadow-black/30 border border-white/[0.06] mb-4">
        <Image
          src={allImages[active]}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-opacity duration-300 ${outOfStock ? "grayscale-[30%]" : ""}`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/[0.25] to-transparent pointer-events-none" />
        {outOfStock && <SoldOutOverlay locale={locale} />}
        {!outOfStock && stock <= 5 && <LowStockBadge stock={stock} locale={locale} />}

        {/* Image counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-espresso/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full z-10">
            {active + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                i === active
                  ? "border-brand-rust shadow-md shadow-brand-rust/20"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                sizes="80px"
                className={`object-cover ${outOfStock ? "grayscale-[30%]" : ""}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
