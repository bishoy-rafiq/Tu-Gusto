"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastContext";
import { useAdminI18n } from "@/app/admin/i18n";
import PushAlertsButton from "@/components/PushAlertsButton";
import { CITIES, getDeliveryFee } from "@/domain/pricing";

type Product = {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string;
};

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: string;
  product: { name: string } | null;
};

type Order = {
  id: string;
  customerName: string;
  customerEmail: string | null;
  phone: string;
  address: string;
  city: string;
  status: string;
  bostaTrackingId: string | null;
  totalAmount: string;
  deliveryFee: string;
  discountCode: string | null;
  discountLabel: string | null;
  discountAmount: string;
  createdAt: string;
  items: OrderItem[];
};

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  confirmed: "bg-blue-500/15 text-blue-300 ring-blue-500/25",
  shipped: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/25",
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
  cancelled: "bg-red-500/15 text-red-300 ring-red-500/25",
};

const adminInput =
  "w-full border border-white/[0.1] rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand-rust/30 transition text-brand-tan";

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const { t, statusLabel } = useAdminI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [bostaAction, setBostaAction] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; order: Order }>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    setOrders(await res.json());
  }

  useEffect(() => {
    loadOrders();
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((p) => setProducts(p))
      .catch(() => {});
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast("error", t("orders.couldnStatus"), t("common.tryAgain"));
      return;
    }
    const data = await res.json();
    loadOrders();
    toast("success", t("orders.statusUpdated"), t("orders.setTo").replace("{s}", statusLabel(status)));

    if (data._whatsappLink) {
      setWhatsappLink(data._whatsappLink);
      setTimeout(() => setWhatsappLink(null), 10000);
    }
  }

  async function updateTracking(id: string, bostaTrackingId: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bostaTrackingId }),
    });
    if (!res.ok) {
      toast("error", t("orders.couldnTracking"), t("common.tryAgain"));
      return;
    }
    loadOrders();
    toast(bostaTrackingId ? "success" : "info", bostaTrackingId ? t("orders.trackingAdded") : t("orders.trackingRemoved"), id);
  }

  async function deleteOrder(o: Order) {
    if (deleteConfirmId !== o.id) {
      setDeleteConfirmId(o.id);
      return;
    }
    setDeleting(o.id);
    const res = await fetch(`/api/admin/orders/${o.id}`, { method: "DELETE" });
    setDeleting(null);
    setDeleteConfirmId(null);
    if (!res.ok) {
      toast("error", t("orders.couldnDelete"), t("common.tryAgain"));
      return;
    }
    loadOrders();
    toast("info", t("orders.deleted"), `#${o.id.slice(-6).toUpperCase()}`);
  }

  const q = search.trim().replace(/^#/, "").toLowerCase();
  const byStatus = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const filtered = q
    ? byStatus.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          (o.customerEmail || "").toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q)
      )
    : byStatus;

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-brand-tan font-semibold">{t("orders.title")}</h1>
          <p className="text-sm text-muted mt-1">{t("orders.totalCount").replace("{n}", orders.length.toString())}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModal({ mode: "create" })}
            className="btn-gold !px-4 !py-2.5 !rounded-xl !text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t("orders.newOrder")}
          </button>
          <PushAlertsButton />

          <button
            onClick={async () => {
              const res = await fetch("/api/admin/test-notification", { method: "POST" });
              const data = await res.json();
              const parts: string[] = [];
              if (data.push) parts.push(t("orders.pushSent"));
              if (data.email) parts.push(t("orders.emailSent"));
              if (parts.length > 0) {
                toast("success", t("orders.testSent"), parts.join(" + "));
              } else {
                toast("info", t("orders.nothingConfigured"), [data.pushDetail, data.emailDetail].filter(Boolean).join(" · "));
              }
            }}
            className="glass-chip inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-tan hover:border-brand-rust/40 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M10 6h4" />
            </svg>
            {t("orders.testNotification")}
          </button>
        </div>
      </div>

      {/* WhatsApp Banner */}
      {whatsappLink && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <p className="text-sm text-emerald-300 font-medium">{t("orders.whatsappBanner")}</p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 text-espresso px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5"
          >
            {t("orders.sendWhatsapp")}
          </a>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("orders.searchPlaceholder")}
            className="w-full border border-white/[0.1] rounded-xl pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand-rust/30 transition text-brand-tan placeholder:text-muted/70"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === "all" ? "btn-gold !px-4 !py-2 !rounded-xl !text-sm" : "glass-chip text-muted hover:border-brand-rust/30"
            }`}
          >
            {t("orders.all")} ({orders.length})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === s ? "btn-gold !px-4 !py-2 !rounded-xl !text-sm" : "glass-chip text-muted hover:border-brand-rust/30"
              }`}
            >
              {statusLabel(s)} ({counts[s] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted">{t("orders.none")}</p>
          </div>
        )}

        {filtered.map((o) => (
          <div key={o.id} className="bg-card rounded-2xl border border-white/[0.06] overflow-hidden transition-all hover:border-brand-rust/20 hover:shadow-lg hover:shadow-black/20">
            {/* Order Row */}
            <div
              className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-surface/40 transition-colors"
              onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor] ${o.status === "pending" ? "bg-amber-400 text-amber-400" : o.status === "confirmed" ? "bg-blue-400 text-blue-400" : o.status === "shipped" ? "bg-indigo-400 text-indigo-400" : o.status === "delivered" ? "bg-emerald-400 text-emerald-400" : "bg-red-400 text-red-400"}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-brand-rust/80 bg-brand-rust/10 rounded-md px-1.5 py-0.5">
                      #{o.id.slice(-6).toUpperCase()}
                    </span>
                    <p className="font-medium text-brand-tan text-sm">{o.customerName}</p>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ring-1 ring-inset ${statusStyles[o.status] || statusStyles.pending}`}>
                      {statusLabel(o.status)}
                    </span>
                    {o.bostaTrackingId && (
                      <span
                        title={`Bosta tracking ${o.bostaTrackingId}`}
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ring-1 ring-inset flex items-center gap-1 ${
                          o.status === "delivered"
                            ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25"
                            : o.status === "cancelled"
                              ? "bg-red-500/15 text-red-300 ring-red-500/25"
                              : "bg-brand-rust/10 text-brand-rust ring-brand-rust/25"
                        }`}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                        </svg>
                        {t("orders.bosta")}
                      </span>
                    )}
                    {o.discountCode && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/25">
                        {o.discountLabel || o.discountCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {o.city} · {new Date(o.createdAt).toLocaleDateString("en-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4 rtl:ml-0 rtl:mr-4">
                <a
                  href={`https://wa.me/${o.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-emerald-400/70 hover:text-emerald-400 p-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
                  title={t("orders.whatsapp")}
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <select
                  value={o.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="border border-white/[0.1] rounded-xl px-3 py-1.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand-rust/30 transition text-brand-tan"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
                <span className="text-sm font-bold text-brand-tan tabular-nums">{Number(o.totalAmount).toLocaleString()}</span>
                <svg className={`w-4 h-4 text-muted transition-transform ${expandedId === o.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === o.id && (
              <div className="px-5 pb-5 pt-2 border-t border-white/[0.06] space-y-3">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-muted uppercase tracking-wider">{t("orders.contact")}</p>
                    <p className="text-brand-tan">{o.phone}</p>
                    {o.customerEmail && <p className="text-muted">{o.customerEmail}</p>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted uppercase tracking-wider">{t("orders.address")}</p>
                    <p className="text-brand-tan">{o.address}, {o.city}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">{t("orders.items")}</p>
                  <div className="bg-surface/50 rounded-xl p-3 space-y-1.5">
                    {o.items.map((i) => (
                      <div key={i.id} className="flex items-center justify-between text-sm">
                        <span className="text-brand-tan">{i.product?.name ?? t("orders.unknownProduct")}</span>
                        <span className="text-muted">× {i.quantity} — {i.priceAtPurchase} EGP</span>
                      </div>
                    ))}
                    <div className="border-t border-white/[0.08] pt-1.5 mt-1.5 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">{t("common.delivery")}</span>
                        <span className="text-brand-tan">{Number(o.deliveryFee)} EGP</span>
                      </div>
                      {o.discountCode && (
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                            {t("orders.wheelPrize").replace("{label}", o.discountLabel || o.discountCode)}
                          </span>
                          <span className="text-emerald-400 font-medium">-{Number(o.discountAmount)} EGP</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold pt-1">
                        <span className="text-brand-tan">{t("common.total")}</span>
                        <span className="text-brand-tan">{Number(o.totalAmount).toLocaleString()} EGP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="text-xs text-muted uppercase tracking-wider">{t("orders.bostaTracking")}</label>
                  <input
                    defaultValue={o.bostaTrackingId || ""}
                    onBlur={(e) => updateTracking(o.id, e.target.value)}
                    placeholder={t("orders.addTracking")}
                    className="border border-white/[0.1] rounded-xl px-3 py-1.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand-rust/30 transition flex-1 max-w-xs text-brand-tan"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {o.bostaTrackingId && (
                    <span className="text-xs text-muted">
                      {t("orders.bosta")}: <span className="text-brand-tan">{statusLabel(o.status)}</span>
                    </span>
                  )}
                  {o.bostaTrackingId && (
                    <a
                      href={`https://bosta.co/tracking-shipments/${o.bostaTrackingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-rust underline underline-offset-2 hover:text-brand-tan"
                    >
                      {o.bostaTrackingId}
                    </a>
                  )}
                  {!o.bostaTrackingId ? (
                    <button
                      disabled={bostaAction === o.id}
                      onClick={async () => {
                        setBostaAction(o.id);
                        const res = await fetch(`/api/admin/orders/${o.id}/bosta`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "create" }),
                        });
                        setBostaAction(null);
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          toast("error", t("orders.couldnBosta"), data.error || t("orders.checkApiKey"));
                          return;
                        }
                        loadOrders();
                        toast("success", t("orders.sentToBosta"), t("orders.deliveryCreated"));
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-brand-rust/10 text-brand-rust ring-1 ring-brand-rust/25 hover:bg-brand-rust/20 transition disabled:opacity-50"
                    >
                      {bostaAction === o.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-brand-rust border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                        </svg>
                      )}
                      {t("orders.sendToBosta")}
                    </button>
                  ) : (
                    <button
                      disabled={bostaAction === o.id}
                      onClick={async () => {
                          setBostaAction(o.id);
                          const res = await fetch(`/api/admin/orders/${o.id}/bosta`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "cancel" }),
                          });
                          setBostaAction(null);
                          if (!res.ok) {
                            const data = await res.json().catch(() => ({}));
                            toast("error", t("orders.couldnCancelBosta"), data.error || t("common.tryAgain"));
                            return;
                          }
                          loadOrders();
                          toast("info", t("orders.bostaCancelled"), t("orders.requestSent"));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-500/10 text-red-300 ring-1 ring-red-500/25 hover:bg-red-500/20 transition disabled:opacity-50"
                      >
                        {bostaAction === o.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {t("orders.cancelInBosta")}
                      </button>
                  )}
                </div>

                {/* Edit / Delete */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                  {o.status !== "cancelled" && (
                    <button
                      onClick={() => setModal({ mode: "edit", order: o })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-brand-rust/10 text-brand-rust ring-1 ring-brand-rust/25 hover:bg-brand-rust/20 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      {t("common.edit")}
                    </button>
                  )}
                  <button
                    disabled={deleting === o.id}
                    onClick={() => deleteOrder(o)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition disabled:opacity-50 ${
                      deleteConfirmId === o.id
                        ? "bg-red-500 text-white hover:bg-red-400"
                        : "bg-red-500/10 text-red-300 ring-1 ring-red-500/25 hover:bg-red-500/20"
                    }`}
                  >
                    {deleting === o.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    )}
                    {deleteConfirmId === o.id ? t("orders.confirmDelete") : t("common.delete")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <OrderModal
          products={products}
          mode={modal.mode}
          order={modal.mode === "edit" ? modal.order : null}
          toast={toast}
          onClose={() => setModal(null)}
          onSaved={() => {
            loadOrders();
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

/* ───────────────────────── Order create/edit modal ───────────────────────── */

type ModalProps = {
  products: Product[];
  mode: "create" | "edit";
  order: Order | null;
  toast: (type: "success" | "error" | "info", title: string, description?: string) => void;
  onClose: () => void;
  onSaved: () => void;
};

function OrderModal({ products, mode, order, toast, onClose, onSaved }: ModalProps) {
  const { t } = useAdminI18n();
  const [form, setForm] = useState(() => {
    if (mode === "edit" && order) {
      return {
        customerName: order.customerName,
        phone: order.phone,
        email: order.customerEmail || "",
        address: order.address,
        city: order.city,
        discountCode: order.discountCode || "",
        discountLabel: order.discountLabel || "",
        discountAmount: order.discountAmount || "0",
        sendToBosta: true,
        items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };
    }
    return {
      customerName: "",
      phone: "",
      email: "",
      address: "",
      city: "Cairo",
      discountCode: "",
      discountLabel: "",
      discountAmount: "0",
      sendToBosta: true,
      items: [] as { productId: string; quantity: number }[],
    };
  });
  const [addProductId, setAddProductId] = useState("");
  const [saving, setSaving] = useState(false);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const subtotal = form.items.reduce((s, it) => s + (Number(productMap.get(it.productId)?.price) || 0) * it.quantity, 0);
  const fee = getDeliveryFee(form.city);
  const discount = Math.min(subtotal, Math.max(0, Number(form.discountAmount) || 0));
  const total = subtotal + fee - discount;

  function updateItem(index: number, patch: Partial<{ productId: string; quantity: number }>) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  }

  function addItem() {
    if (!addProductId) return;
    setForm((f) => ({ ...f, items: [...f.items, { productId: addProductId, quantity: 1 }] }));
    setAddProductId("");
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        customerName: form.customerName,
        phone: form.phone,
        email: form.email.trim() || null,
        address: form.address,
        city: form.city,
        items: form.items,
        discountCode: form.discountCode.trim() || null,
        discountLabel: form.discountLabel.trim() || null,
        discountAmount: form.discountAmount,
      };

      const res =
        mode === "create"
          ? await fetch("/api/admin/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payload, sendToBosta: form.sendToBosta }),
            })
          : await fetch(`/api/admin/orders/${order!.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast("error", t("om.couldnSave"), data.error || t("common.tryAgain"));
        return;
      }
      if (mode === "create") {
        toast("success", t("om.created"), `#${data.orderId.slice(-6).toUpperCase()}`);
        if (data.bosta?.error) {
          toast("error", t("om.bostaSkipped"), data.bosta.error);
        } else if (data.bosta?.trackingNumber) {
          toast("success", t("orders.sentToBosta"), t("om.tracking").replace("{n}", data.bosta.trackingNumber));
        }
      } else {
        toast("success", t("om.updated"), `#${order!.id.slice(-6).toUpperCase()}`);
      }
      onSaved();
    } catch {
      toast("error", t("om.couldnSave"), t("common.tryAgain"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-white/10 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-brand-tan font-semibold">
            {mode === "create" ? t("om.newOrder") : t("om.edit").replace("{id}", order!.id.slice(-6).toUpperCase())}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-brand-tan p-1 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{t("om.customerName")}</label>
              <input
                className={adminInput}
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{t("om.phone")}</label>
              <input
                className={adminInput}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{t("om.email")}</label>
            <input
              type="email"
              className={adminInput}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{t("om.address")}</label>
            <input
              className={adminInput}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{t("om.city")}</label>
            <select
              className={`${adminInput} appearance-none`}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              {CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} — {c.fee} EGP
                </option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{t("om.items")}</label>
            <div className="space-y-2">
              {form.items.map((it, i) => {
                const p = productMap.get(it.productId);
                const outOfStock = p && it.quantity > p.stock;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      className={`${adminInput} flex-1`}
                      value={it.productId}
                      onChange={(e) => updateItem(i, { productId: e.target.value })}
                    >
                      <option value="">{t("om.selectProduct")}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.price} EGP ({t("om.inStock").replace("{n}", p.stock.toString())})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className={`${adminInput} !w-20 text-center`}
                      value={it.quantity}
                      onChange={(e) => updateItem(i, { quantity: Math.max(1, Number(e.target.value)) })}
                    />
                    <button
                      onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, x) => x !== i) }))}
                      className="text-red-300 hover:text-red-200 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      title={t("om.remove")}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {outOfStock && (
                      <span className="text-[10px] text-red-300 font-medium whitespace-nowrap">{t("om.onlyLeft").replace("{n}", p!.stock.toString())}</span>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center gap-2">
                <select
                  className={`${adminInput} flex-1`}
                  value={addProductId}
                  onChange={(e) => setAddProductId(e.target.value)}
                >
                  <option value="">{t("om.addProduct")}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price} EGP ({t("om.inStock").replace("{n}", p.stock.toString())})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!addProductId}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-brand-rust/10 text-brand-rust ring-1 ring-brand-rust/25 hover:bg-brand-rust/20 transition disabled:opacity-40"
                >
                  {t("common.add")}
                </button>
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{t("om.discount")}</label>
              <input
                type="number"
                min={0}
                className={adminInput}
                value={form.discountAmount}
                onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{t("om.code")}</label>
              <input
                className={adminInput}
                value={form.discountCode}
                onChange={(e) => setForm({ ...form, discountCode: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{t("om.label")}</label>
              <input
                className={adminInput}
                value={form.discountLabel}
                onChange={(e) => setForm({ ...form, discountLabel: e.target.value })}
              />
            </div>
          </div>

          {mode === "create" && (
            <label className="flex items-center gap-2.5 text-sm text-brand-tan cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.sendToBosta}
                onChange={(e) => setForm({ ...form, sendToBosta: e.target.checked })}
                className="w-4 h-4 accent-brand-rust"
              />
              {t("om.sendToBosta")}
            </label>
          )}

          {/* Totals */}
          <div className="bg-surface/60 rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">{t("common.subtotal")}</span>
              <span className="text-brand-tan">{subtotal} EGP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">{t("common.delivery")} ({form.city})</span>
              <span className="text-brand-tan">{fee} EGP</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>{t("common.discount")}</span>
                <span>-{discount} EGP</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-brand-tan pt-1.5 border-t border-white/[0.08]">
              <span>{t("common.total")}</span>
              <span>{total.toLocaleString()} EGP</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              disabled={saving || form.items.length === 0}
              className="btn-gold flex-1 !py-2.5 disabled:opacity-50"
            >
              {saving ? t("common.saving") : mode === "create" ? t("om.createOrder") : t("om.saveChanges")}
            </button>
            <button onClick={onClose} className="glass-chip px-5 py-2.5 rounded-xl text-sm text-muted hover:text-brand-tan transition-colors">
              {t("common.cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
