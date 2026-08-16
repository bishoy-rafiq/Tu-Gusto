import { productsApp } from "@/infrastructure/composition";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import ProductExplorer from "@/components/ProductExplorer";

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
    title: isAr ? "المنتجات" : "Shop All",
    description: isAr
      ? "تسوق ماكينات الإسبريسو والمطاحن والبن المحمص الفاخر — مصنوعة لتناسب ذوقك."
      : "Shop espresso machines, grinders, fresh beans and more — built for your daily ritual.",
    alternates: {
      canonical: `${base}/${locale}/products`,
      languages: {
        en: `${base}/en/products`,
        ar: `${base}/ar/products`,
      },
    },
    openGraph: {
      url: `${base}/${locale}/products`,
      title: isAr ? "المنتجات | تو جاستو" : "Shop All | Tu Gusto",
      description: isAr
        ? "تسوق ماكينات الإسبريسو والمطاحن والبن المحمص الفاخر — مصنوعة لتناسب ذوقك."
        : "Shop espresso machines, grinders, fresh beans and more — built for your daily ritual.",
    },
  };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const isAr = locale === "ar";

  const products = await productsApp.listAll();

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))
  );

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pt-36 md:pb-16 px-section-x overflow-hidden">
        <div className="absolute inset-0 mesh-aurora-light pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-rust/[0.08] -translate-y-1/3 translate-x-1/3 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-caramel/[0.07] translate-y-1/2 -translate-x-1/4 blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-[1320px] mx-auto text-center">
          <span className="glass-chip inline-flex items-center gap-3 text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase px-5 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-rust animate-pulse" />
            {isAr ? "المجموعة" : "Collection"}
          </span>
          <h1 className="text-display text-brand-brown font-display animate-reveal delay-1">
            {dict.products.title}
          </h1>
          <p className="text-muted mt-5 text-body max-w-xl mx-auto animate-reveal delay-2">
            {dict.products.subtitle}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="pb-section px-section-x relative z-10">
        <div className="max-w-[1320px] mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-28">
              <div className="w-24 h-24 rounded-full bg-surface mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-muted/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="text-muted text-xl">{dict.products.empty}</p>
            </div>
          ) : (
            <ProductExplorer
              products={products}
              categories={categories}
              locale={locale}
              dict={dict}
            />
          )}
        </div>
      </section>
    </main>
  );
}
