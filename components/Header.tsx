"use client";

import Link from "next/link";
import { useState, useEffect, } from "react";
import { useCart } from "./CartContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname } from "next/navigation";

const CART_ICON =
  "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z";

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

  const itemCount = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
  const itemName = (item: any) =>
    isRtl ? item.nameAr || item.name : item.name;

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
  });

  function openCart() {
    setCartOpen(true);
    setMenuOpen(false);
  }

  function closeAll() {
    setCartOpen(false);
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
