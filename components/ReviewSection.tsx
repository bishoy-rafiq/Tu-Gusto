"use client";

import { useState, useEffect } from "react";
import { useToast } from "./ToastContext";

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
};

type ReviewData = {
  reviews: Review[];
  average: number;
  count: number;
};

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${star <= rating ? "text-brand-rust" : "text-muted/30"}`}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-medium text-muted w-3 text-right">{star}</span>
      <svg className="w-3 h-3 text-brand-rust flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
      <div className="flex-1 h-2 rounded-full bg-border/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-rust transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-muted/50 w-6 text-right tabular-nums">{count}</span>
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const bgColors = [
  "bg-brand-rust/10 text-brand-rust",
  "bg-amber-500/15 text-amber-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-blue-500/15 text-blue-300",
  "bg-purple-500/15 text-purple-300",
  "bg-pink-500/15 text-pink-300",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return bgColors[Math.abs(hash) % bgColors.length];
}

export default function ReviewSection({ productId, locale = "en" }: { productId: string; locale?: string }) {
  const isAr = locale === "ar";
  const { toast } = useToast();
  const [data, setData] = useState<ReviewData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [productId, submitted]);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.isAdmin))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId }),
      });

      setSubmitting(false);

      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
        setForm({ name: "", rating: 5, text: "" });
        toast("success", isAr ? "تم إرسال التقييم!" : "Review submitted!", "Thank you for sharing your experience.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast("error", isAr ? "فشل الإرسال" : "Couldn't submit", data.error || "Please try again.");
      }
    } catch {
      setSubmitting(false);
      toast("error", isAr ? "فشل الإرسال" : "Couldn't submit", isAr ? "خطأ في الاتصال، حاول مرة أخرى" : "Network error. Please try again.");
    }
  }

  async function handleDelete(reviewId: string) {
    setDeletingId(reviewId);
    const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    if (res.ok) {
      toast("success", isAr ? "تم حذف التقييم" : "Review deleted", reviewId);
      setData((prev) => {
        if (!prev) return prev;
        const reviews = prev.reviews.filter((r) => r.id !== reviewId);
        const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
        return { reviews, average: Math.round(avg * 10) / 10, count: reviews.length };
      });
    }
    setDeletingId(null);
  }

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data?.reviews.filter((r) => r.rating === star).length ?? 0,
  }));

  return (
    <div className="mt-16 pt-10 border-t border-border/30">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-brand-rust/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-brand-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-brand-brown">
            {isAr ? "تقييمات العملاء" : "Customer Reviews"}
          </h2>
          {data && data.count > 0 && (
            <p className="text-xs text-muted mt-0.5">
              {isAr ? `بناءً على ${data.count} تقييم` : `Based on ${data.count} ${data.count === 1 ? "review" : "reviews"}`}
            </p>
          )}
        </div>
      </div>

      {/* Rating summary + form row */}
      <div className="grid md:grid-cols-[200px_1fr] gap-8 mb-8">
        {/* Rating big number */}
        {data && data.count > 0 ? (
          <div className="flex flex-col items-center justify-center p-6 bg-brand-cream rounded-2xl border border-white/[0.06]">
            <span className="text-5xl font-display font-bold text-brand-brown tabular-nums">{data.average.toFixed(1)}</span>
            <StarRating rating={Math.round(data.average)} size={18} />
            <p className="text-xs text-muted mt-2">
              {data.count} {isAr ? (data.count === 1 ? "تقييم" : "تقييمات") : (data.count === 1 ? "review" : "reviews")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-brand-cream rounded-2xl border border-white/[0.06]">
            <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-muted/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted">
              {isAr ? "لا توجد تقييمات بعد" : "No reviews yet"}
            </p>
          </div>
        )}

        {/* Rating bars + write button */}
        <div className="flex flex-col justify-between">
          <div className="space-y-1.5">
            {counts.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={data?.count ?? 0} />
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-brand-rust/30 text-brand-rust text-sm font-semibold hover:bg-brand-rust/5 transition-colors"
          >
            {showForm ? (isAr ? "إلغاء" : "Cancel") : (isAr ? "اكتب تقييم" : "Write a Review")}
          </button>
        </div>
      </div>

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-brand-cream rounded-2xl border border-white/[0.06] p-6 mb-8">
          <h3 className="font-display text-lg font-semibold text-brand-brown mb-5">
            {isAr ? "شارك تجربتك" : "Share your experience"}
          </h3>
          <div className="space-y-4">
            {/* Name + Rating row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  {isAr ? "اسمك" : "Your Name"}
                </label>
                <input
                  required
                  placeholder={isAr ? "أحمد م." : "John D."}
                  className="input-modern"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  {isAr ? "التقييم" : "Rating"}
                </label>
                <div className="flex items-center gap-1 py-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="transition-transform hover:scale-125 active:scale-95"
                    >
                      <svg
                        className={`${star <= form.rating ? "text-brand-rust" : "text-muted/25 hover:text-brand-rust/40"} transition-colors`}
                        width={28}
                        height={28}
                        viewBox="0 0 24 24"
                        fill={star <= form.rating ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                {isAr ? "تقييمك" : "Your Review"}
              </label>
              <textarea
                required
                rows={3}
                placeholder={isAr ? "ماذا أعجبك أو لم يعجبك في هذا المنتج؟" : "What did you like or dislike about this product?"}
                className="input-modern resize-none"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-accent w-full disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isAr ? "جارٍ الإرسال..." : "Submitting..."}
                </span>
              ) : (
                isAr ? "إرسال التقييم" : "Submit Review"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Success message */}
      {submitted && !showForm && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-emerald-300 text-sm font-semibold">
              {isAr ? "تم إرسال التقييم!" : "Review submitted!"}
            </p>
            <p className="text-emerald-300/70 text-xs">
              {isAr ? "شكراً لمشاركة تجربتك." : "Thank you for sharing your experience."}
            </p>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {data && data.reviews.length > 0 && (
        <div className="space-y-3">
          {data.reviews.map((review) => (
            <div
              key={review.id}
              className="bg-brand-cream rounded-2xl p-5 border border-white/[0.06] hover:shadow-md hover:shadow-black/20 transition-shadow duration-300"
            >
              <div className="flex items-start gap-3.5">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${getColor(review.name)}`}>
                  {getInitials(review.name)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + date + rating */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-brand-brown text-sm">{review.name}</span>
                      <StarRating rating={review.rating} size={13} />
                    </div>
                    <span className="text-[11px] text-muted/50 flex-shrink-0">
                      {new Date(review.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Review text */}
                  <p className="text-muted text-sm leading-relaxed">{review.text}</p>

                  {/* Admin delete button */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-red-500/70 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {deletingId === review.id ? (
                        <div className="w-3 h-3 border-[1.5px] border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                      {isAr ? "حذف" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {data && data.reviews.length === 0 && !showForm && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <p className="text-muted text-sm font-medium mb-1">
            {isAr ? "لا توجد تقييمات بعد" : "No reviews yet"}
          </p>
          <p className="text-muted/50 text-xs">
            {isAr ? "كن أول من يشارك تجربته!" : "Be the first to share your experience!"}
          </p>
        </div>
      )}
    </div>
  );
}
