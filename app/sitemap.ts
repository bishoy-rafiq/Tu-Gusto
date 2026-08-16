import type { MetadataRoute } from "next";
import { productsApp } from "@/infrastructure/composition";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  const staticRoutes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "products", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "about", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "cart", changeFrequency: "monthly" as const, priority: 0.4 },
    { path: "checkout", changeFrequency: "monthly" as const, priority: 0.4 },
    { path: "orders", changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  const locales = ["en", "ar"] as const;
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      const url = `${base}/${locale}${route.path ? `/${route.path}` : ""}`;
      entries.push({
        url,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            en: `${base}/en${route.path ? `/${route.path}` : ""}`,
            ar: `${base}/ar${route.path ? `/${route.path}` : ""}`,
          },
        },
      });
    }
  }

  let slugs: string[] = [];
  try {
    slugs = await productsApp.listSlugs();
  } catch {
    slugs = [];
  }

  for (const locale of locales) {
    for (const slug of slugs) {
      entries.push({
        url: `${base}/${locale}/products/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            en: `${base}/en/products/${slug}`,
            ar: `${base}/ar/products/${slug}`,
          },
        },
      });
    }
  }

  return entries;
}
