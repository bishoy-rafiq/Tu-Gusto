"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    key: "home",
    href: (locale: string) => `/${locale}`,
    icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
    label: { en: "Home", ar: "الرئيسية" },
  },
  {
    key: "shop",
    href: (locale: string) => `/${locale}/products`,
    icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
    label: { en: "Shop", ar: "المتجر" },
  },
  {
    key: "wheel",
    href: (locale: string) => `/${locale}/wheel`,
    icon: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0",
    label: { en: "Wheel", ar: "العجلة" },
    color: "text-brand-rust",
  },
  {
    key: "whatsapp",
    href: () => {
      const phone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || "";
      const clean = phone.replace(/\D/g, "");
      return clean ? `https://wa.me/${clean}` : "#";
    },
    icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.375.375a.375.375 0 110-.75.375.375 0 010 .75zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 21a8.966 8.966 0 01-5.082-1.547.375.375 0 00-.233.044l-1.5.563a.375.375 0 01-.48-.48l.563-1.5a.375.375 0 00.044-.233A8.966 8.966 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9z",
    label: { en: "Chat", ar: "محادثة" },
    external: true,
    color: "text-[#25D366]",
  },
  {
    key: "account",
    href: (locale: string) => `/${locale}/account`,
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    label: { en: "Account", ar: "حسابي" },
  },
];

export default function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const isAr = locale === "ar";

  function isActive(tab: (typeof tabs)[number]) {
    if (tab.key === "home") return pathname === `/${locale}`;
    return pathname.startsWith(tab.href(locale));
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom md:hidden"
      role="navigation"
      aria-label={isAr ? "التنقل السفلي" : "Bottom navigation"}
    >
      <div className="px-3 pb-2">
        <div className="bg-[#1C1814]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[22px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] shadow-black/40">
          <div className="flex items-center justify-around h-[60px] px-1">
            {tabs.map((tab) => {
              const active = isActive(tab);
              const label = isAr ? tab.label.ar : tab.label.en;
              const href = tab.href(locale);

              const content = (
                <div
                  className={`relative flex flex-col items-center justify-center gap-[3px] w-[56px] h-[46px] rounded-[14px] transition-all duration-300 ${
                    active
                      ? tab.key === "wheel"
                        ? "text-brand-rust"
                        : tab.color && tab.key !== "home"
                          ? tab.color
                          : "text-white"
                      : "text-white/40"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 bg-white/[0.09] rounded-[14px]" />
                  )}

                  <svg
                    className="w-[22px] h-[22px] relative z-10 transition-all duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={active ? 2 : 1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={tab.icon}
                    />
                  </svg>

                  <span
                    className={`text-[10px] leading-none relative z-10 transition-all duration-300 ${
                      active ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );

              if (tab.external) {
                return (
                  <a
                    key={tab.key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={tab.key}
                  href={href}
                  className="flex items-center justify-center"
                  aria-current={active ? "page" : undefined}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
