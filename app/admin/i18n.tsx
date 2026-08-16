"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import adminDefaults from "@/dictionaries/admin.json";

export type AdminLang = "en" | "ar";

type Entry = { en: string; ar: string };

export const adminDict: Record<string, Entry> = adminDefaults;

const STORAGE_KEY = "admin_lang";

type AdminI18nContextValue = {
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
  statusLabel: (status: string) => string;
  refresh: () => Promise<void>;
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

export function AdminI18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("en");
  const [overlay, setOverlay] = useState<Record<string, Entry>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "en") setLangState(stored);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/translations", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { entries?: Record<string, Entry> };
      if (data.entries) setOverlay(data.entries);
    } catch {
      // fall back to bundled defaults when the database is unreachable
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setLang = (next: AdminLang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const t = (key: string) => {
    const entry = overlay[key] ?? adminDict[key];
    if (!entry) return key;
    return entry[lang];
  };

  const statusLabel = (status: string) => t(`status.${status}`);

  return (
    <AdminI18nContext.Provider
      value={{
        lang,
        setLang,
        dir: lang === "ar" ? "rtl" : "ltr",
        t,
        statusLabel,
        refresh,
      }}
    >
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n(): AdminI18nContextValue {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) throw new Error("useAdminI18n must be used inside AdminI18nProvider");
  return ctx;
}
