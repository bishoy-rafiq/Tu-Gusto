"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastContext";
import { useAdminI18n } from "@/app/admin/i18n";
import PushAlertsButton from "@/components/PushAlertsButton";
import NewOrderSound from "@/components/NewOrderSound";

type Stats = {
  productCount: number;
  orderCount: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  recentOrders: {
    id: string;
    customerName: string;
    city: string;
    totalAmount: string;
    status: string;
    createdAt: string;
  }[];
  topProducts: { name: string; sold: number; revenue: number }[];
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  confirmed: "bg-blue-500/15 text-blue-300 ring-blue-500/25",
  shipped: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/25",
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const { t, statusLabel } = useAdminI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadStats(showToast = false) {
    const res = await fetch("/api/admin/stats");
    setStats(await res.json());
    if (showToast) {
      const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      toast("success", t("dash.refreshed"), t("dash.updated").replace("{time}", time));
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-rust border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t("dash.greetingMorning");
    if (h < 17) return t("dash.greetingAfternoon");
    return t("dash.greetingEvening");
  })();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted mb-1">{greeting}</p>
          <h1 className="font-display text-3xl md:text-4xl text-brand-tan font-semibold">{t("dash.title")}</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <NewOrderSound />
          <PushAlertsButton />
          <button
            onClick={async () => {
              setRefreshing(true);
              await loadStats(true);
              setRefreshing(false);
            }}
            className="glass-chip inline-flex items-center gap-2 text-brand-tan/80 text-xs font-medium px-4 py-2.5 rounded-full hover:border-brand-rust/40 transition-all duration-300"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {t("dash.refresh")}
          </button>
          <div className="glass-chip inline-flex items-center gap-2 text-brand-tan/80 text-xs font-medium px-4 py-2.5 rounded-full self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-rust animate-pulse" />
            {t("dash.liveOverview")}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("dash.totalRevenue")}
          value={`${stats.totalRevenue.toLocaleString()} EGP`}
          sub={t("dash.todayRevenue").replace("{n}", stats.todayRevenue.toLocaleString())}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          accent="from-brand-rust/30 to-caramel/10"
          iconColor="text-brand-rust"
          glow
        />
        <StatCard
          label={t("dash.totalOrders")}
          value={stats.orderCount.toString()}
          sub={t("dash.todayOrders").replace("{n}", stats.todayOrders.toString())}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />}
          accent="from-blue-500/25 to-indigo-500/10"
          iconColor="text-blue-400"
        />
        <StatCard
          label={t("dash.pendingOrders")}
          value={stats.pendingOrders.toString()}
          sub={t("dash.confirmed").replace("{n}", stats.confirmedOrders.toString())}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
          accent="from-amber-500/25 to-orange-500/10"
          iconColor="text-amber-400"
          highlight={stats.pendingOrders > 0}
        />
        <StatCard
          label={t("dash.products")}
          value={stats.productCount.toString()}
          sub={t("dash.inCatalog")}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />}
          accent="from-emerald-500/25 to-teal-500/10"
          iconColor="text-emerald-400"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/orders" className="btn-gold !px-5 !py-2.5 text-sm !rounded-xl">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25" />
          </svg>
          {t("dash.manageOrders")}
        </Link>
        <Link href="/admin/products" className="glass-chip inline-flex items-center gap-2 text-brand-tan px-5 py-2.5 rounded-xl text-sm font-medium hover:border-brand-rust/40 hover:-translate-y-0.5 transition-all duration-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("dash.addProduct")}
        </Link>
        <Link href="/admin/wheel" className="glass-chip inline-flex items-center gap-2 text-brand-tan px-5 py-2.5 rounded-xl text-sm font-medium hover:border-brand-rust/40 hover:-translate-y-0.5 transition-all duration-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228" />
          </svg>
          {t("dash.wheel")}
        </Link>
      </div>

      {/* Bottom grid: Recent Orders + Top Products */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-display font-semibold text-brand-tan">{t("dash.recentOrders")}</h2>
              <Link href="/admin/orders" className="text-xs font-medium text-brand-rust hover:text-brand-rust/80 transition">
                {t("dash.viewAll")} →
              </Link>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted text-center py-10">{t("dash.noOrders")}</p>
              ) : (
                stats.recentOrders.map((o) => (
                  <div key={o.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-surface/40 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-brand-tan text-sm truncate">{o.customerName}</p>
                      <p className="text-xs text-muted">{o.city} · {new Date(o.createdAt).toLocaleDateString("en-EG", { month: "short", day: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 rtl:ml-0 rtl:mr-4">
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ring-1 ring-inset ${statusColors[o.status] || statusColors.pending}`}>
                        {statusLabel(o.status) || o.status}
                      </span>
                      <span className="text-sm font-semibold text-brand-tan tabular-nums">{Number(o.totalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-white/[0.06] overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-display font-semibold text-brand-tan">{t("dash.topProducts")}</h2>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {stats.topProducts.length === 0 ? (
                <p className="text-sm text-muted text-center py-10">{t("dash.noSales")}</p>
              ) : (
                stats.topProducts.map((p, i) => (
                  <div key={p.name} className="px-6 py-3.5 flex items-center gap-4">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < 3 ? "bg-brand-rust/15 text-brand-rust" : "bg-surface text-muted"}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-tan truncate">{p.name}</p>
                      <p className="text-xs text-muted">{t("dash.sold").replace("{n}", p.sold.toString())}</p>
                    </div>
                    <span className="text-sm font-semibold text-brand-tan tabular-nums">{p.revenue.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  iconColor,
  highlight,
  glow,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  iconColor: string;
  highlight?: boolean;
  glow?: boolean;
}) {
  return (
    <div className={`relative bg-card rounded-2xl p-5 border border-white/[0.06] overflow-hidden transition-all hover:border-brand-rust/25 hover:-translate-y-1 group ${glow ? "hover:glow-gold" : ""}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60 pointer-events-none`} />
      <div className="relative flex items-start justify-between mb-3">
        <span className={`w-10 h-10 rounded-xl glass-chip flex items-center justify-center shadow-sm ${iconColor} group-hover:scale-110 transition-transform`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {icon}
          </svg>
        </span>
        {highlight && (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
        )}
      </div>
      <p className="relative text-2xl font-bold text-brand-tan tabular-nums">{value}</p>
      <div className="relative flex items-center justify-between mt-1">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-[11px] text-brand-tan/40">{sub}</p>
      </div>
    </div>
  );
}
