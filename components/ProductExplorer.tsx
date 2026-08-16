"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductExplorer({
  products,
  categories,
  locale,
  dict,
}: {
  products: any[];
  categories: string[];
  locale: string;
  dict: any;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const isAr = locale === "ar";

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    if (fromUrl && categories.includes(fromUrl)) {
      setCategory(fromUrl);
    }
  }, [categories]);

  const filtered = useMemo(() => {
    let list = [...products];
    const q = query.trim().toLowerCase();

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    if (q) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.nameAr?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.descriptionAr?.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "low":
        list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "high":
        list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "newest":
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        list.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }

    return list;
  }, [products, query, category, sort]);

  const catLabel = (c: string) =>
    c === "all" ? dict.products?.all || "All" : dict.categories?.[c] ?? c;

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-[76px] z-30 -mx-2 px-2 pb-1">
        <div className="bg-[#1B150F]/90 backdrop-blur-xl rounded-2xl p-2.5 md:p-3 border border-white/[0.06] shadow-lg shadow-black/20 flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50 pointer-events-none ${isAr ? "right-4" : "left-4"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.products?.search || "Search…"}
              aria-label={dict.products?.search || "Search"}
              className={`w-full bg-surface/70 border border-white/[0.08] rounded-full py-3 text-sm text-brand-brown placeholder:text-muted/50 focus:outline-none focus:border-brand-rust/40 focus:ring-4 focus:ring-brand-rust/10 transition-all ${
                isAr ? "pr-11 pl-4" : "pl-11 pr-4"
              }`}
            />
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {["all", ...categories].map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={active}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-300 ${
                    active
                      ? "bg-brand-rust text-espresso shadow-lg shadow-brand-rust/30 font-semibold"
                      : "bg-surface/60 text-brand-brown/70 hover:text-brand-brown border border-white/[0.08] hover:border-brand-rust/30"
                  }`}
                >
                  {catLabel(c)}
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-xs text-muted/60 font-medium">
              {dict.products?.sort}
            </span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label={dict.products?.sort}
                className={`appearance-none bg-surface/70 border border-white/[0.08] rounded-full py-2.5 text-[13px] font-medium text-brand-brown focus:outline-none focus:border-brand-rust/40 cursor-pointer ${
                  isAr ? "pl-9 pr-4" : "pr-9 pl-4"
                }`}
              >
                <option value="popular">{dict.products?.sortPopular}</option>
                <option value="newest">{dict.products?.sortNewest}</option>
                <option value="low">{dict.products?.sortLow}</option>
                <option value="high">{dict.products?.sortHigh}</option>
              </select>
              <svg
                className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/60 pointer-events-none ${isAr ? "left-3" : "right-3"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="mt-6 mb-5 flex items-center justify-between">
        <p className="text-sm text-muted tabular-nums">
          {(dict.products?.results || "{count} products").replace(
            "{count}",
            String(filtered.length)
          )}
        </p>
        {category !== "all" && (
          <p className="hidden sm:block text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-rust">
            {catLabel(category)}
          </p>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-28">
          <div className="w-24 h-24 rounded-full bg-surface mx-auto mb-6 flex items-center justify-center shadow-sm border border-white/[0.06]">
            <svg className="w-12 h-12 text-muted/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-brand-brown font-semibold text-lg mb-1">
            {dict.products?.noResults}
          </p>
          <p className="text-muted text-sm">{dict.products?.noResultsSub}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              dict={dict}
            />
          ))}
        </div>
      )}
    </div>
  );
}
