import { productsApp } from "@/infrastructure/composition";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import ProductStats from "@/components/ProductStats";
import ReviewSection from "@/components/ReviewSection";
import StockBadge from "@/components/StockBadge";
import NotifyMeButton from "@/components/NotifyMeButton";
import PriceDisplay from "@/components/PriceDisplay";
import ProductCard from "@/components/ProductCard";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await productsApp.listSlugs();
    return ["en", "ar"].flatMap((locale) =>
      slugs.map((slug) => ({ locale, slug }))
    );
  } catch {
    return [];
  }
}

async function fetchRelated(product: any, slug: string) {
  return productsApp.getRelated(product, slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isAr = locale === "ar";

  let product: any = null;
  try {
    product = await productsApp.getBySlug(slug);
  } catch {
    product = null;
  }
  if (!product) return {};

  const name = isAr ? product.nameAr || product.name : product.name;
  const description = isAr
    ? product.descriptionAr || product.description
    : product.description;

  return {
    title: name,
    description:
      description ||
      `${name} — premium quality, available at Tu Gusto with fast delivery in Egypt.`,
    openGraph: {
      url: `${base}/${locale}/products/${slug}`,
      title: name,
      description:
        description ||
        `${name} — premium quality, available at Tu Gusto with fast delivery in Egypt.`,
      images: product.imageUrl
        ? [{ url: product.imageUrl.startsWith("http") ? product.imageUrl : `${base}${product.imageUrl}`, alt: name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description:
        description ||
        `${name} — premium quality, available at Tu Gusto with fast delivery in Egypt.`,
      images: product.imageUrl
        ? [product.imageUrl.startsWith("http") ? product.imageUrl : `${base}${product.imageUrl}`]
        : undefined,
    },
    alternates: {
      canonical: `${base}/${locale}/products/${slug}`,
      languages: {
        en: `${base}/en/products/${slug}`,
        ar: `${base}/ar/products/${slug}`,
      },
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale as Locale);
  const isAr = locale === "ar";
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let product: any;
  try {
    product = await productsApp.getBySlug(slug);
  } catch {
    product = null;
  }

  if (!product) notFound();

  const outOfStock = product.stock <= 0;
  const displayName = isAr ? product.nameAr || product.name : product.name;
  const displayDescription = isAr
    ? product.descriptionAr || product.description
    : product.description;
  const related = await fetchRelated(product, slug);

  const trustBadges = [
    {
      label: dict.product.fastShipping,
      path: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21a.75.75 0 00.75-.75V11.25a3 3 0 00-3-3h-1.5l-1.72-4.575A1.5 1.5 0 0014.66 3H9.34a1.5 1.5 0 00-1.44 1.05L6.18 8.25H4.5a3 3 0 00-3 3v7.875c0 .621.504 1.125 1.125 1.125h15.75z",
    },
    {
      label: dict.product.secure,
      path: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    },
    {
      label: dict.product.quality,
      path: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    },
  ];

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: isAr ? "الرئيسية" : "Home",
                    item: `${base}/${locale}`,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: isAr ? "المنتجات" : "Products",
                    item: `${base}/${locale}/products`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: displayName,
                    item: `${base}/${locale}/products/${slug}`,
                  },
                ],
              },
              {
                "@type": "Product",
                name: displayName,
                image: product.imageUrl
                  ? product.imageUrl.startsWith("http")
                    ? product.imageUrl
                    : `${base}${product.imageUrl}`
                  : undefined,
                description: displayDescription || undefined,
                sku: product.id,
                category: product.category || undefined,
                brand: { "@type": "Brand", name: "Tu Gusto" },
                offers: {
                  "@type": "Offer",
                  url: `${base}/${locale}/products/${slug}`,
                  priceCurrency: "EGP",
                  price: String(product.price),
                  priceValidUntil: new Date(Date.now() + 60 * 60 * 24 * 365).toISOString().slice(0, 10),
                  availability:
                    product.stock > 0
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                  itemCondition: "https://schema.org/NewCondition",
                },
              },
            ],
          }),
        }}
      />
      <section className="relative pt-32 pb-20 md:pt-36 px-section-x overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-caramel/[0.03] -translate-y-1/4 translate-x-1/4 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-rust/[0.02] translate-y-1/4 -translate-x-1/4 blur-[70px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 text-muted text-sm hover:text-[var(--text-primary)] transition-colors mb-6 animate-reveal"
          >
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {isAr ? "العودة للتسوق" : "Back to shop"}
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="animate-reveal delay-1">
              <ProductGallery
                imageUrl={product.imageUrl}
                images={product.images}
                name={displayName}
                stock={product.stock}
                locale={locale}
              />
              <ProductStats productId={product.id} initialViews={product.views} locale={locale} />
            </div>

            <div className="lg:sticky lg:top-28 animate-reveal delay-2">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase">
                  {dict.product.label}
                </span>
                <StockBadge stock={product.stock} locale={locale} />
              </div>

              <h1 className="text-heading text-brand-brown font-display mb-5" dir={isAr ? "rtl" : "ltr"}>
                {displayName}
              </h1>

              <div className="mb-7">
                <PriceDisplay
                  price={product.price.toString()}
                  originalPrice={product.originalPrice?.toString()}
                />
              </div>

              {displayDescription && (
                <p className="text-muted text-body mb-8 leading-relaxed" dir={isAr ? "rtl" : "ltr"}>
                  {displayDescription}
                </p>
              )}

              {outOfStock && (
                <div className="mb-5">
                  <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-5 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-red-300 text-sm">{dict.product.outOfStock}</p>
                      <p className="text-red-300/60 text-xs mt-1">{dict.product.outOfStockDesc}</p>
                    </div>
                  </div>
                </div>
              )}

              <AddToCartButton
                productId={product.id}
                name={product.name}
                nameAr={product.nameAr}
                price={product.price.toString()}
                imageUrl={product.imageUrl}
                stock={product.stock}
                label={dict.products.addToCart}
                addedLabel={dict.products.added}
                buyLabel={dict.products.buyNow}
                locale={locale}
              />

              {outOfStock && (
                <div className="mt-4">
                  <NotifyMeButton productId={product.id} locale={locale} />
                </div>
              )}

              <div className="mt-10 pt-7 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-4">
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="text-center">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-rust/15 to-caramel/[0.06] mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={badge.path} />
                      </svg>
                    </div>
                    <p className="text-[11px] text-muted font-medium">{badge.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-20">
            <ReviewSection productId={product.id} locale={locale} />
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-20">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-px bg-brand-rust/40" />
                    <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase">
                      {dict.related.eyebrow}
                    </span>
                    <span className="w-8 h-px bg-brand-rust/40" />
                  </div>
                  <h2 className="text-subheading font-display text-brand-brown">
                    {dict.related.title}
                  </h2>
                </div>
                <Link
                  href={`/${locale}/products`}
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-rust hover:text-brand-brown transition-colors"
                >
                  {isAr ? "عرض الكل" : "View all"}
                  <svg className="w-4 h-4 -rotate-45 rtl:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-5">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} locale={locale} dict={dict} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
