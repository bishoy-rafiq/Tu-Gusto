import Link from "next/link";

export default function Footer({
  locale,
  dict,
}: {
  locale: "en" | "ar";
  dict: any;
}) {
  const isAr = locale === "ar";
  const whatsappUrl = process.env.ADMIN_WHATSAPP_PHONE
    ? `https://wa.me/${process.env.ADMIN_WHATSAPP_PHONE.replace(/\D/g, "")}`
    : "#";

  const socials = [
    {
      href: "https://www.instagram.com/tugusto755/",
      label: "Instagram",
      path: "M6.5 3.5h11A3 3 0 0120.5 6.5v11a3 3 0 01-3 3h-11a3 3 0 01-3-3v-11a3 3 0 013-3zm5.5 3.75a4.75 4.75 0 100 9.5 4.75 4.75 0 000-9.5zM17.75 6a1 1 0 11-2 0 1 1 0 012 0z",
    },
    {
      href: "https://www.facebook.com/profile.php?id=61571983294150",
      label: "Facebook",
      path: "M14.5 20.5v-6h2l.5-2.5h-2.5v-1.5c0-.75.3-1.3 1.4-1.3H17V7c-.28-.04-1.2-.12-2.28-.12-2.26 0-3.72 1.38-3.72 3.9v1.72H8.5V14.5h2.5v6h3.5z",
    },
    {
      href: whatsappUrl,
      label: "WhatsApp",
      path: "M12 3a9 9 0 00-7.78 13.54L3.2 20.8l4.33-1.0A9 9 0 1012 3zm0 2.25A6.75 6.75 0 116.8 18.5l-.9-.53-2.1.47.5-2.1-.53-.9A6.75 6.75 0 0112 5.25zm-3.4 4.05c-.15.5.5 1.55 1.35 2.4.87.86 1.92 1.5 2.42 1.36.5-.15.9-.6 1.2-1.05.2-.28.02-.62-.28-.78l-.8-.48c-.25-.15-.52-.02-.68.2l-.36.47c-.85-.45-1.5-1.1-1.95-1.95l.47-.36c.22-.16.35-.43.2-.68l-.48-.8c-.16-.3-.5-.48-.78-.28-.45.3-.9.7-1.05 1.2-.14.5-.23.75.38 1.75z",
    },
  ];

  const links = [
    { href: `/${locale}/products`, label: dict.nav.shop },
    { href: `/${locale}/about`, label: dict.nav.story },
    { href: `/${locale}/cart`, label: dict.nav.cart },
    { href: `/${locale}/orders`, label: isAr ? "تتبع طلبي" : "Track my order" },
  ];

  return (
    <footer className="relative bg-espresso overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-orange)]/30 to-transparent" />
      <div className="absolute -top-24 right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent-orange)]/[0.05] blur-[100px] animate-orb pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-[var(--spacing-section-x)] pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-5">
            <img src="/images/logo.png" alt={dict.brand} className="h-10 w-auto object-contain" />
            <p className="text-muted/60 mt-5 text-sm leading-relaxed max-w-xs">{dict.footer}</p>
            <div className="flex items-center gap-2.5 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full glass-chip flex items-center justify-center text-brand-tan/80 transition-all duration-300 hover:bg-brand-rust hover:text-espresso hover:-translate-y-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <h4 className="text-muted/40 text-[11px] font-semibold tracking-[0.22em] uppercase mb-5">
              {isAr ? "روابط" : "Links"}
            </h4>
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group inline-flex items-center gap-2 text-muted/80 hover:text-[var(--text-primary)] text-sm transition-colors duration-300 w-fit"
                >
                  <span className="w-0 group-hover:w-4 h-px bg-[var(--accent-orange)] transition-all duration-300" />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-muted/40 text-[11px] font-semibold tracking-[0.22em] uppercase mb-5">
              {isAr ? "تواصل" : "Contact"}
            </h4>
            <div className="flex flex-col gap-3 text-sm text-muted/80">
              <a href="mailto:support@atugusto.com" className="transition-colors duration-300 hover:text-[var(--text-primary)] w-fit">
                support@atugusto.com
              </a>
              {process.env.ADMIN_WHATSAPP_PHONE && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-300 hover:text-[var(--text-primary)] w-fit"
                  dir="ltr"
                >
                  {process.env.ADMIN_WHATSAPP_PHONE}
                </a>
              )}
              <p>{isAr ? "القاهرة، مصر" : "Cairo, Egypt"}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted/40 text-xs">
            © {new Date().getFullYear()} {dict.brand}. {isAr ? "جميع الحقوق محفوظة" : "All rights reserved"}.
          </p>
          <p className="text-muted/20 text-xs">{isAr ? "صُنع بـ ♥" : "Made with ♥"}</p>
        </div>
      </div>
    </footer>
  );
}
