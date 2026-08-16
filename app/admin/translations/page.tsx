"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ToastContext";
import { useAdminI18n } from "@/app/admin/i18n";

type Entry = { en: string; ar: string };
type Data = { entries: Record<string, Entry>; defaults: Record<string, Entry> };

const STOREFRONT_TOPS = new Set([
  "brand", "hero", "marquee", "values", "story", "cta", "footer", "home",
  "categories", "related", "product", "stock", "gallery", "stats", "reviews",
  "cartWidget", "cart", "quantity", "notify", "success", "error", "loading",
  "about", "checkout",
]);

function namespaceOf(key: string) {
  return key.split(".")[0];
}

function AutoTextarea({
  value,
  lang,
  onChange,
}: {
  value: string;
  lang: "en" | "ar";
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  return (
    <textarea
      ref={ref}
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang}
      rows={1}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onInput={resize}
      placeholder={lang === "en" ? "English" : "العربية"}
      className="w-full resize-none overflow-hidden rounded-lg border border-white/[0.1] bg-surface px-3 py-2 text-sm text-brand-tan placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-rust/40 transition min-h-[38px] leading-relaxed"
    />
  );
}

export default function AdminTranslationsPage() {
  const { toast } = useToast();
  const { t, refresh } = useAdminI18n();

  const [data, setData] = useState<Data | null>(null);
  const [draft, setDraft] = useState<Record<string, Entry>>({});
  const [original, setOriginal] = useState<Record<string, Entry>>({});
  const [search, setSearch] = useState("");
  const [namespace, setNamespace] = useState("all");
  const [customizedOnly, setCustomizedOnly] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/translations", { cache: "no-store" });
    if (!res.ok) return;
    const d = (await res.json()) as Data;
    setData(d);
    setDraft(d.entries);
    setOriginal(d.entries);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const customizedKeys = useMemo(() => {
    if (!data) return new Set<string>();
    const set = new Set<string>();
    for (const key of Object.keys(data.entries)) {
      if (
        data.entries[key].en !== data.defaults[key]?.en ||
        data.entries[key].ar !== data.defaults[key]?.ar
      ) {
        set.add(key);
      }
    }
    return set;
  }, [data]);

  const dirtyKeys = useMemo(() => {
    const set = new Set<string>();
    for (const key of Object.keys(draft)) {
      if (
        draft[key].en !== original[key]?.en ||
        draft[key].ar !== original[key]?.ar
      ) {
        set.add(key);
      }
    }
    return set;
  }, [draft, original]);

  const namespaces = useMemo(() => {
    if (!data) return [] as { name: string; count: number }[];
    const counts = new Map<string, number>();
    for (const key of Object.keys(data.entries)) {
      const ns = namespaceOf(key);
      counts.set(ns, (counts.get(ns) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const visibleKeys = useMemo(() => {
    if (!data) return [] as string[];
    const q = search.trim().toLowerCase();
    return Object.keys(data.entries).filter((key) => {
      if (namespace !== "all" && namespaceOf(key) !== namespace) return false;
      if (customizedOnly && !customizedKeys.has(key)) return false;
      if (q) {
        const entry = draft[key];
        const haystack = `${key} ${entry?.en ?? ""} ${entry?.ar ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data, namespace, customizedOnly, customizedKeys, search, draft]);

  function updateDraft(key: string, field: "en" | "ar", value: string) {
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  async function handleSave() {
    if (dirtyKeys.size === 0) {
      toast("info", t("translations.noChanges"));
      return;
    }
    setSaving(true);
    const entries = [...dirtyKeys].map((key) => ({
      key,
      en: draft[key].en,
      ar: draft[key].ar,
    }));
    const res = await fetch("/api/admin/translations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    setSaving(false);
    if (res.ok) {
      toast("success", t("translations.saved"), t("translations.savedCount").replace("{n}", String(entries.length)));
      await refresh();
      await load();
    } else {
      const err = await res.json().catch(() => ({}));
      toast("error", t("common.somethingWrong"), err.error || t("common.tryAgain"));
    }
  }

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      toast("success", t("translations.copyKey"), t("translations.copied"));
    } catch {
      toast("error", t("translations.copyKey"), t("common.tryAgain"));
    }
  }

  if (!data) {
    return (
      <div className="text-sm text-brand-tan/50">{t("translations.loading")}</div>
    );
  }

  const inputClass =
    "w-full border border-white/[0.1] rounded-lg px-4 py-2.5 bg-surface text-brand-tan placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-rust/40 transition";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-brand-tan">{t("translations.title")}</h1>
          <p className="text-sm text-brand-tan/50 mt-0.5 max-w-2xl">{t("translations.subtitle")}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || dirtyKeys.size === 0}
          className="btn-gold !px-6 !py-2.5 !rounded-xl !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving
            ? t("common.saving")
            : dirtyKeys.size > 0
              ? `${t("translations.save")} (${dirtyKeys.size})`
              : t("translations.save")}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg
            className="w-4 h-4 text-muted/50 absolute left-3.5 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("translations.searchPlaceholder")}
            className={`${inputClass} !py-2.5 pl-10 rtl:pl-4 rtl:pr-10`}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-brand-tan/60 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={customizedOnly}
            onChange={(e) => setCustomizedOnly(e.target.checked)}
            className="accent-brand-rust w-4 h-4"
          />
          {t("translations.showCustomizedOnly")}
          <span className="text-xs text-brand-rust/80">
            {customizedKeys.size > 0 ? `(${customizedKeys.size})` : ""}
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setNamespace("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            namespace === "all"
              ? "bg-brand-rust/15 border-brand-rust/40 text-brand-rust"
              : "bg-surface border-white/[0.08] text-brand-tan/60 hover:border-white/20"
          }`}
        >
          {t("translations.all")} ({Object.keys(data.entries).length})
        </button>
        {namespaces.map((ns) => (
          <button
            key={ns.name}
            onClick={() => setNamespace(ns.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              namespace === ns.name
                ? "bg-brand-rust/15 border-brand-rust/40 text-brand-rust"
                : "bg-surface border-white/[0.08] text-brand-tan/60 hover:border-white/20"
            }`}
          >
            {ns.name} ({ns.count})
          </button>
        ))}
      </div>

      {visibleKeys.length === 0 ? (
        <div className="text-sm text-brand-tan/50">
          {customizedOnly && customizedKeys.size === 0
            ? t("translations.noneCustomized")
            : t("translations.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleKeys.map((key) => {
            const isCustomized = customizedKeys.has(key);
            const isDirty = dirtyKeys.has(key);
            const ns = namespaceOf(key);
            const storefront = STOREFRONT_TOPS.has(ns);
            return (
              <div
                key={key}
                className={`bg-card border rounded-2xl p-4 transition-colors ${
                  isDirty
                    ? "border-brand-rust/50 bg-brand-rust/[0.04]"
                    : "border-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <button
                    onClick={() => copyKey(key)}
                    className="group inline-flex items-center gap-2 font-mono text-xs text-brand-tan/70 hover:text-brand-rust transition-colors text-left"
                    title={t("translations.copyKey")}
                  >
                    {key}
                    <svg className="w-3.5 h-3.5 text-muted/40 group-hover:text-brand-rust/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted/40 px-2 py-0.5 rounded-full bg-surface border border-white/[0.06]">
                      {storefront ? t("translations.storefront") : t("translations.admin")}
                    </span>
                    {isCustomized && (
                      <span className="text-[10px] text-brand-rust/80 px-2 py-0.5 rounded-full bg-brand-rust/10 border border-brand-rust/20">
                        {t("translations.customized")}
                      </span>
                    )}
                    {isDirty && (
                      <button
                        onClick={() => {
                          setDraft((prev) => ({
                            ...prev,
                            [key]: { en: data.defaults[key]?.en ?? "", ar: data.defaults[key]?.ar ?? "" },
                          }));
                        }}
                        className="text-[10px] text-brand-tan/50 hover:text-brand-rust transition-colors px-2 py-0.5 rounded-full border border-white/[0.08] hover:border-brand-rust/40"
                      >
                        {t("translations.reset")}
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                  <div>
                    <div className="text-[10px] text-muted/40 mb-1">
                      {t("translations.en")}
                    </div>
                    <AutoTextarea
                      lang="en"
                      value={draft[key]?.en ?? ""}
                      onChange={(v) => updateDraft(key, "en", v)}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted/40 mb-1">
                      {t("translations.ar")}
                    </div>
                    <AutoTextarea
                      lang="ar"
                      value={draft[key]?.ar ?? ""}
                      onChange={(v) => updateDraft(key, "ar", v)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
