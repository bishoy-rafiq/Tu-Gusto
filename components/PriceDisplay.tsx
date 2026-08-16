export default function PriceDisplay({
  price,
  originalPrice,
}: {
  price: string;
  originalPrice?: string | null;
}) {
  const current = parseFloat(price);
  const original = originalPrice ? parseFloat(originalPrice) : null;
  const hasDiscount = original !== null && original > current;
  const savings = hasDiscount ? original - current : 0;
  const percent = hasDiscount ? Math.round((savings / original) * 100) : 0;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <p className="text-3xl font-bold text-brand-brown tabular-nums">
        {current.toFixed(0)} EGP
      </p>

      {hasDiscount && (
        <>
          <p className="text-lg font-medium text-muted/40 line-through tabular-nums">
            {original!.toFixed(0)} EGP
          </p>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/25">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
            </svg>
            Save {percent}%
          </span>
        </>
      )}
    </div>
  );
}
