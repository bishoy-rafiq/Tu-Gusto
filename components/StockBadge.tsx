export default function StockBadge({ stock, locale = "en" }: { stock: number; locale?: string }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-500/10 text-red-300 text-[10px] sm:text-xs font-semibold border border-red-500/25 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        {locale === "ar" ? "نفذ من المخزون" : "Out of Stock"}
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/10 text-amber-300 text-[10px] sm:text-xs font-semibold border border-amber-500/25 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {locale === "ar" ? `باقي ${stock} فقط` : `Only ${stock} left`}
      </span>
    );
  }

  return null;
}
