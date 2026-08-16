"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ToastContext";
import { AdminI18nProvider, useAdminI18n } from "@/app/admin/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navItems = [
  { href: "/admin", labelKey: "nav.dashboard", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /> },
  { href: "/admin/orders", labelKey: "nav.orders", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /> },
  { href: "/admin/products", labelKey: "nav.products", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /> },
  { href: "/admin/wheel", labelKey: "nav.wheel", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" /> },
  { href: "/admin/translations", labelKey: "nav.translations", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" /> },
  { href: "/admin/settings", labelKey: "nav.settings", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminI18nProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminI18nProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, dir, lang, setLang } = useAdminI18n();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
    router.refresh();
  }
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (pathname === "/admin/login") {
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  }

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 px-3 space-y-1">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${active
                ? "bg-brand-rust/15 text-brand-rust"
                : "text-white/45 hover:text-white/90 hover:bg-white/[0.07]"
              }`}
          >
            {active && (
              <span className="absolute left-0 rtl:left-auto rtl:right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-rust rounded-r-full rtl:rounded-r-none rtl:rounded-l-full shadow-[0_0_12px_rgba(198,160,92,0.6)]" />
            )}
            <svg className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-brand-rust" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
              {item.icon}
            </svg>
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <ToastProvider>
    <div dir={dir} className="min-h-screen bg-main flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[252px] bg-gradient-to-b from-[#1A0F08] to-[#2C1810] min-h-screen sticky top-0 border-r border-white/[0.06] rtl:border-r-0 rtl:border-l">
        <div className="px-5 pt-7 pb-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1">
              <img src="/images/logo-dark.png" alt="Tu Gusto" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-display text-[15px] font-semibold text-white tracking-tight block leading-tight">
                Tu Gusto
              </span>
              <span className="text-white/30 text-[11px]">{t("nav.admin")}</span>
            </div>
          </Link>
        </div>

        <SidebarNav />

        <div className="px-3 pb-5 mt-auto space-y-3">
          <div className="flex justify-center">
            <LanguageSwitcher locale={lang} active={lang} onChange={setLang} />
          </div>
          <div className="border-t border-white/[0.07] pt-3 space-y-1">
            <Link
              href="/en"
              target="_blank"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white/80 hover:bg-white/[0.07] transition-all duration-200"
            >
              <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              {t("nav.viewStore")}
            </Link>
            <button
              onClick={logout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              {loggingOut ? t("common.saving") : t("nav.logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 w-[272px] bg-gradient-to-b from-[#1A0F08] to-[#2C1810] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"}`}>
          <div className="px-5 pt-7 pb-5 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1">
                <img src="/images/logo-dark.png" alt="Tu Gusto" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-display text-[15px] font-semibold text-white tracking-tight block leading-tight">
                  Tu Gusto
                </span>
                <span className="text-white/30 text-[11px]">{t("nav.admin")}</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <SidebarNav onNavigate={() => setSidebarOpen(false)} />

          <div className="px-3 pb-5 space-y-3">
            <div className="flex justify-center">
              <LanguageSwitcher locale={lang} active={lang} onChange={setLang} />
            </div>
            <div className="border-t border-white/[0.07] pt-3 space-y-1">
              <Link
                href="/en"
                target="_blank"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white/80 hover:bg-white/[0.07] transition-all duration-200"
              >
                <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                {t("nav.viewStore")}
              </Link>
              <button
                onClick={logout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                {loggingOut ? t("common.saving") : t("nav.logout")}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-40 bg-main/80 backdrop-blur-xl border-b border-white/[0.06] px-5 py-3.5 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rtl:-mr-2 rtl:ml-0 rounded-xl text-brand-tan hover:bg-surface transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Link href="/admin" className="font-display text-lg font-semibold text-brand-tan tracking-tight">
            {t("nav.admin")}
          </Link>
          <div className="ml-auto rtl:ml-0 rtl:mr-auto flex items-center gap-3">
            <LanguageSwitcher locale={lang} active={lang} onChange={setLang} />
            <button
              onClick={logout}
              disabled={loggingOut}
              title={t("nav.logout")}
              className="p-2 rounded-xl text-brand-tan/70 hover:text-brand-tan hover:bg-surface transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden lg:block sticky top-0 z-30 bg-main/80 backdrop-blur-xl border-b border-white/[0.06] px-10 py-4">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <LanguageSwitcher locale={lang} active={lang} onChange={setLang} />
              <Link
                href="/en"
                target="_blank"
                className="flex items-center gap-2 text-sm text-muted hover:text-brand-tan transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                {t("nav.viewStore")}
              </Link>
              <button
                onClick={logout}
                disabled={loggingOut}
                title={t("nav.logout")}
                className="p-2 rounded-xl text-muted hover:text-brand-tan hover:bg-surface transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10 lg:p-10 flex-1">
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
