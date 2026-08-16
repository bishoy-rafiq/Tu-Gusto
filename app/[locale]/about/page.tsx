import { getDictionary, type Locale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isAr = locale === "ar";
  return {
    title: isAr ? "من نحن" : "About Us",
    description: isAr
      ? "تعرف على قصة تو جاستو — شغفنا بالقهوة والالتزام بالجودة في كل منتج."
      : "Discover the Tu Gusto story — our passion for coffee and commitment to quality in every product.",
    alternates: {
      canonical: `${base}/${locale}/about`,
      languages: {
        en: `${base}/en/about`,
        ar: `${base}/ar/about`,
      },
    },
    openGraph: {
      url: `${base}/${locale}/about`,
      title: isAr ? "من نحن | تو جاستو" : "About Us | Tu Gusto",
      description: isAr
        ? "تعرف على قصة تو جاستو — شغفنا بالقهوة والالتزام بالجودة في كل منتج."
        : "Discover the Tu Gusto story — our passion for coffee and commitment to quality in every product.",
    },
  };
}

type AboutSection = {
  heading: string;
  body: string;
};

type AboutDict = {
  eyebrow: string;
  title: string;
  intro: AboutSection;
  story: AboutSection;
  offer: { heading: string; intro: string; items: { title: string; body: string }[] };
  vision?: AboutSection;
  promise?: AboutSection;
  tagline: string;
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const about = dict.about as AboutDict;
  const isRtl = locale === "ar";

  return (
    <main className="min-h-screen">
      {/* ═══ HERO ═══ */}
      <section className="bg-espresso text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(196,154,108,0.08)_0%,_transparent_50%)]" />
        <div className="absolute top-1/3 right-1/4 w-[280px] h-[280px] rounded-full bg-caramel/[0.04] blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <div className="divider-wide mx-auto mb-2 animate-reveal" />
          <span className="text-white/25 text-[11px] font-semibold tracking-[0.28em] uppercase mb-5 block animate-reveal">
            {about.eyebrow}
          </span>
          <h1 className="text-display text-white font-display animate-reveal delay-1">
            {about.title}
          </h1>
        </div>
      </section>

      {/* ═══ INTRO ═══ */}
      <section className="py-section px-section-x relative z-10">
        <div className="max-w-[740px] mx-auto text-center">
          <div className="divider mx-auto mb-5" />
          <h2 className="text-heading font-display text-brand-brown mb-6 animate-reveal">
            {about.intro.heading}
          </h2>
          <p className="text-body text-muted leading-relaxed animate-reveal delay-1">
            {about.intro.body}
          </p>
        </div>
      </section>

      {/* ═══ STORY ═══ */}
      <section className="pb-section px-section-x">
        <div className="max-w-5xl mx-auto">
          <div className="card-elevated p-8 md:p-14 relative overflow-hidden">
            <div className="absolute -top-6 -left-4 md:-left-8 font-display text-[9rem] leading-none text-caramel/[0.08] pointer-events-none select-none">
              &ldquo;
            </div>
            <div className="relative z-10">
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-accent mb-3 block animate-reveal">
                {about.story.heading}
              </span>
              <p className="text-body text-brand-brown leading-relaxed font-medium animate-reveal delay-1">
                {about.story.body}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OFFER / MISSION ═══ */}
      <section className="py-section px-section-x bg-brand-warm/70 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
            <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-accent mb-3 block animate-reveal">
              {about.offer.heading}
            </span>
            <p className="text-subheading font-display text-brand-brown animate-reveal delay-1">
              {about.offer.intro}
            </p>
          </div>

          <div className={`grid gap-5 md:gap-6 md:grid-cols-3 ${isRtl ? "rtl" : ""}`}>
            {about.offer.items.map((item, i) => (
              <div
                key={i}
                className="card group relative p-7 md:p-8 overflow-hidden"
              >
                <span className="font-display text-5xl text-caramel/20 transition-colors duration-300 group-hover:text-accent/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-display font-semibold text-brand-brown">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {item.body}
                </p>
                <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VISION (Arabic) ═══ */}
      {about.vision && (
        <section className="bg-espresso text-white py-section px-section-x relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(238,152,82,0.07)_0%,_transparent_55%)]" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-caramel/[0.05] blur-[90px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="divider-wide mx-auto mb-6" />
            <span className="text-white/25 text-[11px] font-semibold tracking-[0.28em] uppercase mb-3 block">
              {about.vision.heading}
            </span>
            <p className="text-body text-white/85 leading-relaxed">
              {about.vision.body}
            </p>
          </div>
        </section>
      )}

      {/* ═══ PROMISE ═══ */}
      {about.promise && (
        <section className="py-section px-section-x">
          <div className="max-w-[700px] mx-auto text-center card-elevated p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[180px] h-[180px] rounded-full bg-caramel/[0.04] -translate-y-1/3 translate-x-1/4 blur-[50px] pointer-events-none" />
            <div className="relative z-10">
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-accent mb-4 block">
                {about.promise.heading}
              </span>
              <p className="text-subheading font-display text-brand-brown leading-snug">
                {about.promise.body}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ═══ TAGLINE ═══ */}
      <section className="pb-section px-section-x">
        <p className="text-center italic text-brand-brown font-display text-xl md:text-2xl animate-reveal">
          {about.tagline}
        </p>
      </section>
    </main>
  );
}
