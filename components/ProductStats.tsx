"use client";

import { useEffect, useState } from "react";

function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      className={filled ? "text-brand-rust" : "text-muted/30"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

type Props = {
  productId: string;
  initialViews: number;
  locale?: string;
};

export default function ProductStats({ productId, initialViews, locale = "en" }: Props) {
  const [views, setViews] = useState(initialViews);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const isAr = locale === "ar";

  useEffect(() => {
    fetch(`/api/products/stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
      .then((r) => r.json())
      .then((d) => d.views && setViews(d.views))
      .catch(() => {});
  }, [productId]);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => setRating({ average: d.average || 0, count: d.count || 0 }))
      .catch(() => {});
  }, [productId]);

  const reviewWord = rating.count === 1
    ? (isAr ? "تقييم" : "Review")
    : (isAr ? "تقييمات" : "Reviews");

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 mt-4 mb-6">
      {/* Views */}
      <div className="flex items-center gap-1.5 text-muted/60">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-xs font-medium">{views} {isAr ? "مشاهدة" : "Views"}</span>
      </div>

      <div className="w-px h-3.5 bg-border/50" />

      {/* Rating */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} filled={s <= Math.round(rating.average)} />
          ))}
        </div>
        <span className="text-xs font-medium text-muted/60">
          {rating.average > 0 ? rating.average.toFixed(1) : "0.0"} ({rating.count} {reviewWord})
        </span>
      </div>
    </div>
  );
}
