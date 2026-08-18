"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "./CartContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname } from "next/navigation";

const CART_ICON =
  "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z";

type Customer = { id: string; email: string; name: string; phone: string; address: string; city: string };

export default function Header({
  locale,
  dict,
}: {
  locale: string;
  dict: any;
}) {
  const { items, hydrated, total, updateQuantity, removeItem } = useCart();
  const isRtl = locale === "ar";
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const itemCount = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
  const itemName = (item: any) =>
    isRtl ? item.nameAr || item.name : item.name;

  useEffect(() => {
    fetch("/api/customer/profile")
      .then((r) => r.json())
      .then((d) => { if (d.customer) setCustomer(d.customer); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  const navItems = [
    {
      href: `/${locale}`,
      label: locale === "ar" ? "الرئيسية" : "Home",
    },
    {
      href: `/${locale}/products`,
      label: dict.nav.shop,
    },
    {
      href: `/${locale}/wheel`,
      label: locale === "ar" ? "العجلة" : "Wheel",
    },
    {
      href: `/${locale}/about`,
      label: dict.nav.story,
    },
    {
      href: `/${locale}/orders`,
      label: locale === "ar" ? "طلباتي" : "Orders",
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = cartOpen || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCart() {
    setCartOpen(true);
    setMenuOpen(false);
  }

  function closeAll() {
    setCartOpen(false);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  async function logout() {
    await fetch("/api/customer/profile", { method: "DELETE" });
    setCustomer(null);
    setAccountOpen(false);
    setMenuOpen(false);
  }

  function isActive(href: string) {
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  }

  const drawerSideClass = isRtl ? "left-0" : "right-0";
  const drawerHiddenClass = isRtl ? "-translate-x-full" : "translate-x-full";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-safe">
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-500 ${
            scrolled
              ? "max-w-5xl glass-strong rounded-2xl px-4 md:px-6 py-2.5 shadow-xl shadow-black/20"
              : "max-w-7xl bg-transparent px-2 py-3"
          }`}
        >
          <Link
            href={`/${locale}`}
            className="flex items-center transition-opacity hover:opacity-80"
            aria-label={dict.brand}
          >
            <img
              src="/images/logo.webp"
              alt={dict.brand}
              className={`h-9 md:h-11 w-auto object-contain transition-all duration-500 ${
                scrolled ? "opacity-95" : "opacity-100"
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300 ${
                    active
                      ? "bg-accent-soft text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-px left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-[var(--accent-orange)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale as "en" | "ar"} scrolled={scrolled} />

            <button
              onClick={openCart}
              aria-label={dict.cart.cart}
              aria-expanded={cartOpen}
              className={`relative rounded-full p-2.5 transition-all duration-300 ${
                scrolled
                  ? "text-[var(--text-primary)] hover:bg-white/[0.06]"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={CART_ICON} />
              </svg>
              {hydrated && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[var(--accent-orange)] text-[var(--color-espresso)] text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm shadow-[var(--accent-orange)]/40 tabular-nums">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* Desktop WhatsApp */}
            <a
              href={`https://wa.me/${(process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:flex rounded-full p-2.5 transition-all duration-300 text-[#25D366] hover:bg-[#25D366]/10`}
              aria-label="WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>

            {/* Desktop account dropdown */}
            <div ref={accountRef} className="hidden md:block relative">
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className={`rounded-full p-2.5 transition-all duration-300 ${
                  scrolled
                    ? "text-[var(--text-primary)] hover:bg-white/[0.06]"
                    : "text-white hover:bg-white/10"
                }`}
                aria-label={locale === "ar" ? "حسابي" : "Account"}
                aria-expanded={accountOpen}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>

              {accountOpen && (
                <div className={`absolute ${isRtl ? "left-0" : "right-0"} mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]/50 shadow-xl shadow-black/30 py-1.5 z-50 animate-reveal`}>
                  {customer ? (
                    <>
                      <div className="px-4 py-3 border-b border-[var(--border-subtle)]/40">
                        <p className="text-[var(--text-primary)] text-sm font-medium truncate">{customer.name || customer.email}</p>
                        <p className="text-[var(--text-muted)] text-xs truncate mt-0.5">{customer.email}</p>
                      </div>
                      <Link
                        href={`/${locale}/account`}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        {locale === "ar" ? "الملف الشخصي" : "Profile"}
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        {locale === "ar" ? "تسجيل خروج" : "Logout"}
                      </button>
                    </>
                  ) : (
                    <Link
                      href={`/${locale}/account`}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {locale === "ar" ? "تسجيل الدخول" : "Sign In"}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className={`md:hidden rounded-full p-2.5 transition-all duration-300 ${
                scrolled ? "text-[var(--text-primary)] hover:bg-white/[0.06]" : "text-white hover:bg-white/10"
              }`}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`w-full h-[1.5px] rounded-full transition-all duration-300 origin-center ${menuOpen ? "translate-y-[7px] rotate-45" : ""} ${scrolled ? "bg-[var(--text-primary)]" : "bg-white"}`} />
                <span className={`w-full h-[1.5px] rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-0" : ""} ${scrolled ? "bg-[var(--text-primary)]" : "bg-white"}`} />
                <span className={`w-full h-[1.5px] rounded-full transition-all duration-300 origin-center ${menuOpen ? "translate-y-[-7px] -rotate-45" : ""} ${scrolled ? "bg-[var(--text-primary)]" : "bg-white"}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE MENU DRAWER ═══ */}
      <div
        className={`md:hidden fixed inset-0 z-[55] transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAll} />
        <div
          className={`absolute inset-y-0 w-full max-w-[320px] bg-[var(--bg-card)] border-s border-[var(--border-subtle)]/40 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${drawerSideClass} ${
            menuOpen ? "translate-x-0" : drawerHiddenClass
          }`}
        >
          <div className="p-4 border-b border-[var(--border-subtle)]/50 flex items-center justify-between flex-shrink-0">
            <Link href={`/${locale}`} onClick={closeAll} className="block">
              <img src="/images/logo.webp" alt={dict.brand} className="h-9 w-auto object-contain" />
            </Link>
            <button
              onClick={closeAll}
              aria-label="Close menu"
              className="w-9 h-9 rounded-full bg-[var(--btn-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all duration-200 active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item, idx) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeAll}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] transition-all duration-300 ${
                    active
                      ? "bg-accent-soft text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]"
                  }`}
                  style={{ transitionDelay: `${idx * 30}ms` }}
                >
                  <span className="font-medium">{item.label}</span>
                  <svg className={`w-4 h-4 transition-all duration-300 ${isRtl ? "rotate-180" : ""} ${active ? "text-[var(--accent-orange)]" : "text-[var(--text-muted)]/40"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              );
            })}

            <div className="my-3 h-px bg-[var(--border-subtle)]/60" />

            {/* Cart + Orders in mobile menu */}
            <Link
              href={`/${locale}/cart`}
              onClick={closeAll}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-all duration-300"
            >
              <span className="font-medium">{dict.cart.title}</span>
              {hydrated && itemCount > 0 && (
                <span className="bg-[var(--accent-orange)] text-[var(--color-espresso)] text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 tabular-nums">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <Link
              href={`/${locale}/orders`}
              onClick={closeAll}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-all duration-300"
            >
              <span className="font-medium">{locale === "ar" ? "طلباتي" : "Orders"}</span>
              <svg className={`w-4 h-4 ${isRtl ? "rotate-180" : ""} text-[var(--text-muted)]/40`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>

            <div className="my-3 h-px bg-[var(--border-subtle)]/60" />
            {customer ? (
              <>
                <div className="px-4 py-3">
                  <p className="text-[var(--text-primary)] text-sm font-medium">{customer.name || customer.email}</p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{customer.email}</p>
                </div>
                <Link
                  href={`/${locale}/account`}
                  onClick={closeAll}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="font-medium">{locale === "ar" ? "الملف الشخصي" : "Profile"}</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  <span className="font-medium">{locale === "ar" ? "تسجيل خروج" : "Logout"}</span>
                </button>
              </>
            ) : (
              <Link
                href={`/${locale}/account`}
                onClick={closeAll}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="font-medium">{locale === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
              </Link>
            )}

            <div className="my-3 h-px bg-[var(--border-subtle)]/60" />

            <div className="px-4 pt-1">
              <p className="text-[var(--text-muted)] text-sm mb-2">
                {locale === "ar" ? "اللغة" : "Language"}
              </p>
              <LanguageSwitcher locale={locale as "en" | "ar"} scrolled />
            </div>
          </nav>

          <div className="p-4 border-t border-[var(--border-subtle)]/40 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
            <Link
              href={`/${locale}/products`}
              onClick={closeAll}
              className="btn-primary w-full"
            >
              {dict.nav.shop}
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ CART DRAWER ═══ */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={dict.cart.title}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAll} />
        <div
          className={`absolute inset-y-0 w-full max-w-[400px] bg-[var(--bg-card)] border-s border-[var(--border-subtle)]/40 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${drawerSideClass} ${
            cartOpen ? "translate-x-0" : drawerHiddenClass
          }`}
        >
          <div className="p-5 border-b border-[var(--border-subtle)]/50 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="font-display text-lg md:text-xl font-semibold text-[var(--text-primary)]">{dict.cart.title}</p>
              <p className="text-[var(--text-muted)] text-xs md:text-sm mt-0.5 tabular-nums">
                {itemCount} {locale === "ar" ? "منتجات" : "items"}
              </p>
            </div>
            <button
              onClick={closeAll}
              aria-label="Close cart"
              className="w-9 h-9 rounded-full bg-[var(--btn-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all duration-200 active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!hydrated || items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--btn-secondary)] flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-[var(--text-muted)]/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={CART_ICON} />
                </svg>
              </div>
              <p className="text-[var(--text-primary)] font-semibold text-lg mb-1.5">{dict.cart.empty}</p>
              <p className="text-[var(--text-muted)] text-sm mb-8 max-w-[240px]">
                {locale === "ar" ? "تصفح منتجاتنا وأضف ما يعجبك إلى سلة التسوق" : "Browse our products and add your favorites to the cart"}
              </p>
              <Link
                href={`/${locale}/products`}
                onClick={closeAll}
                className="btn-primary w-full max-w-[260px]"
              >
                {dict.nav.shop}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {items.map((item: any) => {
                  const soldOut = item.stock <= 0;
                  return (
                    <div
                      key={item.productId}
                      className={`flex items-center gap-3 rounded-2xl p-3 border transition-all duration-200 ${
                        soldOut ? "border-red-500/30 opacity-70" : "border-[var(--border-subtle)]/40 bg-[var(--bg-card)]"
                      }`}
                    >
                      <div className="w-16 h-16 bg-[var(--btn-secondary)] rounded-xl relative flex-shrink-0 overflow-hidden">
                        <img src={item.imageUrl} alt={itemName(item)} className={`w-full h-full object-cover ${soldOut ? "grayscale" : ""}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] text-sm truncate" dir={isRtl ? "rtl" : "ltr"}>{itemName(item)}</p>
                        <p className="text-[var(--btn-primary)] font-semibold text-sm mt-0.5 tabular-nums">{item.price} EGP</p>
                        {soldOut && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-0.5">
                            <span className="w-1 h-1 rounded-full bg-red-500" />
                            {locale === "ar" ? "نفذ" : "Sold Out"}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            disabled={soldOut}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 rounded-lg bg-[var(--btn-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200 text-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-[var(--text-primary)] tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={soldOut || (item.stock > 0 && item.quantity >= item.stock)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 rounded-lg bg-[var(--btn-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200 text-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={dict.cart.remove}
                        className="text-[var(--text-muted)]/40 hover:text-red-500 transition-all duration-200 p-2 rounded-lg self-start active:scale-90"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="px-5 pt-4 border-t border-[var(--border-subtle)]/40 flex-shrink-0 space-y-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
                <div className="flex justify-between items-baseline">
                  <span className="text-[var(--text-muted)] text-sm">{dict.cart.total}</span>
                  <span className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{total.toFixed(2)} EGP</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link onClick={closeAll} href={`/${locale}/checkout`} className="btn-gold w-full text-sm">
                    {dict.cart.checkout}
                  </Link>
                  <Link onClick={closeAll} href={`/${locale}/cart`} className="btn-ghost w-full text-sm">
                    {dict.cart.cart}
                  </Link>
                </div>
                <button
                  onClick={closeAll}
                  className="w-full text-center text-xs text-[var(--text-muted)] font-medium hover:text-[var(--text-primary)] transition-colors"
                >
                  {locale === "ar" ? "← متابعة التسوق" : "← Continue Shopping"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
