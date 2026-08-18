import Link from "next/link";
import { productsApp } from "@/infrastructure/composition";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import ProductCard from "@/components/ProductCard";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isAr = locale === "ar";
  return {
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        en: `${base}/en`,
        ar: `${base}/ar`,
      },
    },
    openGraph: {
      url: `${base}/${locale}`,
      title: isAr
        ? "تو جاستو — على مزاجك"
        : "Tu Gusto — على مزاجك",
      description: isAr
        ? "ماكينات إسبريسو ومطاحن وبن محمص فاخر في مصر — بجودة مضمونة وشحن سريع."
        : "Premium espresso machines, grinders, and freshly roasted beans in Egypt — made to your taste.",
    },
  };
}

const categoryIcons: Record<string, { path: string; accent: string }> = {
  machines: {
    path: "M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm4 2v6m4-6v6m4-6v6",
    accent: "bg-brand-rust/10 text-brand-rust",
  },
  grinders: {
    path: "M8.25 4.5v3.75a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75V4.5m12-3v3.75a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75V1.5M4.5 6.75v13.5A1.5 1.5 0 006 21.75h12a1.5 1.5 0 001.5-1.5V6.75m-3 6.75h3m-3 0a3 3 0 00-3 3h-3a3 3 0 01-3-3m3 0a3 3 0 013-3h3",
    accent: "bg-caramel/10 text-caramel",
  },
  beans: {
    path: "M12 8c-2.5 0-4.5 2-4.5 4.5S9.5 17 12 17c1.5 0 2.8-.9 3.4-2.2.4-.8.6-1.8.6-2.8 0-2.5-2-4.5-4-4.5zM12 8V5m-5.2 1.2 1 1.7m10.4-1.7-1 1.7M12 3.5a.75.75 0 100-1.5.75.75 0 000 1.5z",
    accent: "bg-latte/10 text-latte",
  },
  accessories: {
    path: "M15.75 12.75a3 3 0 11-6 0 3 3 0 016 0zM12 3c2.1 0 3.5.8 4 2-1.9 0-3.2-.8-4-2zm0 18c-2.1 0-3.5-.8-4-2 1.9 0 3.2.8 4 2zm5-1c1.5-1.5 2-3.5 1.5-5.5-1.9.2-3.2 1.3-4 3.2.6.9 1.4 1.8 2.5 2.3zM7 5c-1.5 1.5-2 3.5-1.5 5.5C7.4 10.3 8.7 9.2 9.5 7.3 8.9 6.4 8.1 5.5 7 5z",
    accent: "bg-brand-rust/10 text-brand-tan",
  },
};

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const isAr = locale === "ar";

  const featured = await productsApp.listFeatured(8);

  const categories = Array.from(
    new Set(featured.map((p) => p.category).filter((c): c is string => Boolean(c)))
  );

  return (
    <main>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-espresso pt-20 md:pt-24">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-espresso/70 via-espresso/35 to-espresso" />
        <div className="absolute inset-0 mesh-aurora" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-brand-rust/[0.07] blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center px-6">
          <span className="glass-chip inline-flex items-center gap-2.5 text-brand-tan/85 text-[11px] font-semibold tracking-[0.3em] uppercase px-5 py-2.5 rounded-full mb-8 animate-reveal delay-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-rust animate-pulse" />
            {dict.hero.tagline}
          </span>

          <h1 className="text-display font-display leading-[1.05] mb-6 animate-reveal delay-2 gold-text">
            {dict.hero.headline}
          </h1>

          <p className="text-white/55 text-body max-w-2xl mx-auto mb-10 animate-reveal delay-3">
            {dict.hero.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 animate-reveal delay-4">
            <Link href={`/${locale}/products`} className="btn-gold w-full sm:w-auto">
              {dict.hero.cta}
              <svg className="w-4 h-4 transition-transform duration-300 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href={`/${locale}/about`}
              className="btn-ghost w-full sm:w-auto"
            >
              {isAr ? "قصة علامتنا" : "Our Story"}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-14 max-w-2xl mx-auto animate-reveal delay-5">
            {[
              { n: isAr ? "شحن مجاني" : "Free Shipping", s: isAr ? "للطلبات فوق الحد الأدنى" : "on qualifying orders" },
              { n: isAr ? "جودة مضمونة" : "100% Quality", s: isAr ? "منتجات أصلية" : "authentic & tested" },
              { n: isAr ? "دعم فوري" : "Fast Support", s: isAr ? "جاهزون لمساعدتك" : "we're here for you" },
            ].map((item) => (
              <div key={item.n} className="glass-chip rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 sm:gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-rust/70 flex-shrink-0" />
                <div className="text-left rtl:text-right">
                  <p className="text-white/90 font-semibold text-[11px] sm:text-[13px] leading-tight">{item.n}</p>
                  <p className="text-white/35 text-[9px] sm:text-[11px] hidden sm:block">{item.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-reveal delay-6">
          <span className="text-white/20 text-[10px] tracking-[0.4em] uppercase">{dict.hero.scroll}</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/25 to-transparent" />
        </div>
      </section>

      {/* ═══════ MARQUEE ═══════ */}
      <section className="relative bg-brand-rust text-espresso py-4 overflow-hidden border-y border-black/10">
        <div className="flex items-center gap-16 whitespace-nowrap animate-marquee w-max">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-16">
              {[dict.marquee.summerSale, dict.marquee.discount, dict.marquee.freeShipping, dict.marquee.newArrivals].map((text, i) => (
                <span key={i} className="flex items-center gap-16">
                  <span className="text-[11px] font-bold tracking-[0.22em] uppercase">{text}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-espresso/30" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FEATURED PRODUCTS ═══════ */}
      {featured.length > 0 && (
        <section className="py-section px-section-x relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-brand-rust/[0.05] blur-[100px] pointer-events-none" />
          <div className="max-w-[1320px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
              <div>
                <div className="flex items-center gap-3 mb-4 animate-reveal">
                  <span className="w-8 h-px bg-brand-rust/40" />
                  <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase">
                    {dict.home.featuredEyebrow}
                  </span>
                  <span className="w-8 h-px bg-brand-rust/40" />
                </div>
                <h2 className="text-heading text-brand-brown font-display animate-reveal delay-1">
                  {dict.home.featuredTitle}
                </h2>
                <p className="text-muted mt-3 max-w-xl animate-reveal delay-2">
                  {dict.home.featuredSub}
                </p>
              </div>
              <Link
                href={`/${locale}/products`}
                className="group inline-flex items-center gap-2 text-brand-rust font-semibold text-sm animate-reveal delay-3 self-start md:self-auto"
              >
                {dict.home.viewAll}
                <span className="w-9 h-9 rounded-full bg-brand-rust/10 flex items-center justify-center group-hover:bg-brand-rust group-hover:text-espresso transition-all duration-300">
                  <svg className="w-4 h-4 -rotate-45 rtl:rotate-45 transition-transform duration-300 group-hover:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {featured.map((product, i) => (
                <div key={product.id} className={`animate-reveal delay-${Math.min(i + 1, 6)}`}>
                  <ProductCard product={product} locale={locale} dict={dict} featured />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ SHOP BY CATEGORY ═══════ */}
      {categories.length > 0 && (
        <section className="relative overflow-hidden bg-brand-warm/60 py-section-sm">
          <div className="absolute inset-0 mesh-aurora-light pointer-events-none" />
          <div className="max-w-[1320px] mx-auto px-section-x relative z-10">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <span className="w-8 h-px bg-brand-rust/40" />
              <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase">
                {dict.home.categoriesEyebrow}
              </span>
              <span className="w-8 h-px bg-brand-rust/40" />
            </div>
            <h2 className="text-heading text-brand-brown font-display mb-10 text-center">
              {dict.home.categoriesTitle}
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {categories.map((cat, i) => {
                const meta = categoryIcons[cat] ?? categoryIcons.accessories;
                const count = featured.filter((p) => p.category === cat).length;
                return (
                  <Link
                    key={cat}
                    href={`/${locale}/products?category=${encodeURIComponent(cat)}`}
                    className={`group card-elevated p-6 md:p-9 flex flex-col items-center text-center animate-reveal delay-${Math.min(i + 1, 4)}`}
                  >
                    <div className={`w-16 h-16 rounded-2xl ${meta.accent} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={meta.path} />
                      </svg>
                    </div>
                    <span className="font-semibold text-brand-brown group-hover:text-brand-rust transition-colors duration-300">
                      {(dict.categories as Record<string, string>)?.[cat] ?? cat}
                    </span>
                    <span className="text-muted/60 text-xs mt-1.5 tabular-nums">
                      {count} {isAr ? "منتجات" : "items"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ VALUE PROPS ═══════ */}
      <section className="py-section px-section-x">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {dict.values.map((item: { title: string; text: string }, i: number) => (
              <div
                key={item.title}
                className={`card p-6 md:p-8 text-center animate-reveal delay-${i + 1}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-rust/20 to-caramel/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-500">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-brand-rust to-caramel shadow-[0_0_20px_rgba(198,160,92,0.5)]" />
                </div>
                <h3 className="font-semibold text-brand-brown text-[15px] mb-2">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ BRAND STORY ═══════ */}
      <section className="relative overflow-hidden bg-brand-warm">
        <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-caramel/[0.04] -translate-y-1/3 translate-x-1/4 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-rust/[0.025] translate-y-1/3 -translate-x-1/4 blur-[70px] pointer-events-none" />

        <div className="py-section px-section-x relative z-10">
          <div className="max-w-[740px] mx-auto text-center">
            <div className="divider-wide mx-auto mb-10 animate-reveal" />
            <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase inline-block mb-6 animate-reveal">
              {isAr ? "قصتنا" : "Our Story"}
            </span>
            <h2 className="text-heading text-brand-brown font-display mb-8 animate-reveal delay-1">
              {dict.story.title}
            </h2>
            <p className="text-muted text-body mb-10 animate-reveal delay-2">
              {dict.story.text}
            </p>
            <p className="italic text-brand-brown font-display text-lg md:text-xl mb-12 animate-reveal delay-3">
              {dict.story.tagline}
            </p>
            <Link
              href={`/${locale}/about`}
              className="btn-ghost animate-reveal delay-4 group"
            >
              {dict.story.cta}
              <svg className="w-4 h-4 transition-transform duration-300 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-section px-section-x">
        <div className="max-w-[1320px] mx-auto">
          <div className="relative bg-espresso rounded-[2rem] p-10 md:p-16 lg:p-20 text-center overflow-hidden noise shine-sweep border border-[var(--border-subtle)]">
            <div className="absolute inset-0 mesh-aurora" />
            <div className="absolute top-0 right-0 w-[320px] h-[320px] rounded-full bg-brand-rust/[0.1] -translate-y-1/2 translate-x-1/4 pointer-events-none blur-[70px]" />

            <div className="relative z-10">
              <span className="glass-chip inline-flex items-center gap-2 text-brand-tan/80 text-[10px] font-semibold tracking-[0.3em] uppercase px-4 py-2 rounded-full mb-8 animate-reveal">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-rust animate-pulse" />
                {isAr ? "انضم إلينا اليوم" : "Join us today"}
              </span>
              <h2 className="text-heading font-display mb-6 animate-reveal gold-text">
                {dict.cta.title}
              </h2>
              <p className="text-white/45 mb-12 max-w-lg mx-auto text-body animate-reveal delay-1">
                {dict.cta.text}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal delay-2">
                <Link href={`/${locale}/products`} className="btn-gold w-full sm:w-auto">
                  {dict.cta.button}
                  <svg className="w-4 h-4 transition-transform duration-300 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href={`/${locale}/products`} className="btn-ghost w-full sm:w-auto">
                  {isAr ? "تصفح الكل" : "Browse All"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
