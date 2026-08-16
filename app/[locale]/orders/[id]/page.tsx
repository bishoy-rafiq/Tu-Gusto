"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ToastContext";

type ManageOrder = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  status: string;
  bostaTrackingId: string | null;
  deliveryFee: string;
  discountCode: string | null;
  discountAmount: string;
  totalAmount: string;
  createdAt: string;
  items: {
    product: { name: string; name_ar?: string | null };
    quantity: number;
    priceAtPurchase: string;
  }[];
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  confirmed: "bg-blue-500/15 text-blue-300 ring-blue-500/25",
  shipped: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/25",
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
  cancelled: "bg-red-500/15 text-red-300 ring-red-500/25",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغى",
};

export default function ManageOrderPage() {
  const { locale, id } = useParams();
  const { toast } = useToast();
  const isAr = locale === "ar";

  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<ManageOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get("e");
    if (e) {
      setEmail(e);
      fetchOrder(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrder(emailToUse: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}?e=${encodeURIComponent(emailToUse)}`);
      if (!res.ok) {
        setError(isAr ? "لم نتمكن من العثور على الطلب. تحقق من البريد الإلكتروني." : "We couldn't find this order. Check the email.");
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError(isAr ? "خطأ في الاتصال" : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder() {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "cancel", locale }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (isAr ? "تعذر إلغاء الطلب" : "Couldn't cancel the order"));
        return;
      }
      setOrder((o) => (o ? { ...o, status: "cancelled" } : o));
      setConfirmCancel(false);
      toast("info", isAr ? "تم الإلغاء" : "Cancelled", isAr ? "تم إلغاء طلبك." : "Your order was cancelled.");
    } catch {
      setError(isAr ? "خطأ في الاتصال" : "Network error.");
    } finally {
      setCancelling(false);
    }
  }

  const canCancel = order?.status === "pending";

  return (
    <main className="min-h-screen">
      <section className="bg-espresso pt-32 pb-12 md:pt-32 md:pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-caramel/[0.05] -translate-y-1/2 blur-[70px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-section-x relative z-10">
          <div className="divider mb-2" />
          <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase mb-4 block">
            {isAr ? "إدارة الطلب" : "Manage Your Order"}
          </span>
          <h1 className="text-heading text-brand-brown font-display">
            {isAr ? "طلبك" : "Your order"}
          </h1>
          <p className="text-muted mt-1.5 text-sm">
            {isAr ? "تابع حالة طلبك أو ألغِه" : "Track your order or cancel it"}
          </p>
        </div>
      </section>

      <section className="py-section px-section-x relative z-10">
        <div className="max-w-2xl mx-auto space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 text-sm text-red-300">{error}</div>
          )}

          {!order && !loading && (
            <div className="card-elevated p-8">
              <h2 className="font-display font-semibold text-brand-brown mb-2">
                {isAr ? "أدخل بريدك الإلكتروني" : "Enter your email"}
              </h2>
              <p className="text-muted text-sm mb-5">
                {isAr ? "نستخدم البريد الإلكتروني لتأكيد أن هذا طلبك." : "We use your email to verify this is your order."}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!email.trim()) {
                    setError(isAr ? "أدخل بريدك الإلكتروني" : "Enter your email");
                    return;
                  }
                  fetchOrder(email.trim());
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  required
                  placeholder={isAr ? "example@email.com" : "you@example.com"}
                  className="input-modern flex-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="btn-accent">
                  {isAr ? "عرض طلبي" : "View my order"}
                </button>
              </form>
              <div className="mt-6 pt-5 border-t border-border/40">
                <Link href={`/${locale}`} className="text-sm text-brand-rust hover:text-brand-tan transition-colors">
                  ← {isAr ? "العودة إلى المتجر" : "Back to store"}
                </Link>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-20 flex justify-center">
              <div className="w-7 h-7 border-2 border-brand-rust border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {order && (
            <>
              {/* Summary */}
              <div className="card-elevated p-6 md:p-8">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">
                      {isAr ? "رقم الطلب" : "Order number"}
                    </p>
                    <p className="text-brand-gold font-mono font-semibold text-lg">#{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ring-1 ring-inset capitalize ${statusStyles[order.status] || statusStyles.pending}`}>
                    {isAr ? (statusLabels[order.status] || order.status) : order.status}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-brand-brown">{isAr ? item.product.name_ar || item.product.name : item.product.name} <span className="text-muted">× {item.quantity}</span></span>
                      <span className="text-brand-brown font-medium">{Number(item.priceAtPurchase) * item.quantity} EGP</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/40 mt-4 pt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">{isAr ? "التوصيل إلى" : "Delivery to"} {order.city}</span>
                    <span className="text-brand-brown">{Number(order.deliveryFee)} EGP</span>
                  </div>
                  {order.discountCode && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{order.discountCode}</span>
                      <span>-{Number(order.discountAmount)} EGP</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-brand-brown text-base pt-2 border-t border-border/40">
                    <span>{isAr ? "الإجمالي" : "Total"}</span>
                    <span>{Number(order.totalAmount).toLocaleString()} EGP</span>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-border/40 space-y-1 text-sm">
                  <p className="text-brand-brown">{order.customerName} · {order.phone}</p>
                  <p className="text-muted">{order.address}</p>
                </div>
              </div>

              {/* Cancel */}
              {canCancel ? (
                <div className="card-elevated p-6 md:p-8">
                  <h2 className="font-display font-semibold text-brand-brown mb-1">
                    {isAr ? "إلغاء الطلب" : "Cancel order"}
                  </h2>
                  <p className="text-muted text-sm mb-5">
                    {isAr ? "يمكنك إلغاء طلبك طالما لم يبدأ تجهيزه." : "You can cancel your order while it's still pending."}
                  </p>
                  <button
                    onClick={cancelOrder}
                    disabled={cancelling}
                    className={`w-full px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                      confirmCancel
                        ? "bg-red-500 text-white hover:bg-red-400"
                        : "bg-red-500/10 text-red-300 ring-1 ring-red-500/25 hover:bg-red-500/20"
                    }`}
                  >
                    {cancelling ? (isAr ? "جارٍ الإلغاء..." : "Cancelling...") : confirmCancel ? (isAr ? "تأكيد الإلغاء؟" : "Confirm cancel?") : isAr ? "إلغاء الطلب" : "Cancel order"}
                  </button>
                  {confirmCancel && (
                    <p className="text-xs text-red-300/80 mt-3">
                      {isAr ? "انقر مرة أخرى للتأكيد. سيتم إلغاء الطلب وإعادة المنتجات للمخزون." : "Click again to confirm. The order will be cancelled and items returned to stock."}
                    </p>
                  )}
                </div>
              ) : (
                <div className="card-elevated p-6 text-center">
                  <p className="text-muted text-sm">
                    {order.status === "cancelled"
                      ? isAr ? "تم إلغاء هذا الطلب." : "This order has been cancelled."
                      : isAr ? "هذا الطلب لم يعد قابلاً للإلغاء لأنه قيد التجهيز أو التوصيل." : "This order can no longer be cancelled — it's being processed or shipped."}
                  </p>
                  <Link href={`/${locale}`} className="btn-primary w-full mt-5">
                    {isAr ? "تصفح المنتجات" : "Browse products"}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
