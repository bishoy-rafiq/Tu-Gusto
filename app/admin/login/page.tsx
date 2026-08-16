"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminI18n } from "@/app/admin/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AdminLoginPage() {
  const { t, dir, lang, setLang } = useAdminI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(res.status === 429 ? t("login.tooManyAttempts") : t("login.incorrectCredentials"));
    }
  }

  return (
    <main dir={dir} className="min-h-screen flex items-center justify-center bg-main px-6 relative overflow-hidden">
      <div className="absolute inset-0 mesh-aurora pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-brand-rust/[0.08] blur-[110px] animate-orb pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-caramel/[0.06] blur-[110px] animate-orb pointer-events-none" style={{ animationDelay: "5s" }} />

      <div className="absolute top-5 right-5 rtl:right-auto rtl:left-5 z-10">
        <LanguageSwitcher locale={lang} active={lang} onChange={setLang} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-24 mx-auto mb-4">
            <img src="/images/logo.png" alt="Tu Gusto" className="w-full h-auto object-contain" />
          </div>
          <p className="text-muted text-sm mt-1.5">{t("login.subtitle")}</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl p-7 border border-white/[0.08] shadow-2xl shadow-black/40">
          <h1 className="font-display text-lg font-semibold text-brand-tan mb-6 text-center">
            {t("login.signIn")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-tan/80 mb-2">{t("login.email")}</label>
              <input
                type="email"
                required
                placeholder={t("login.emailPlaceholder")}
                className="input-modern"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-tan/80 mb-2">{t("login.password")}</label>
              <input
                type="password"
                required
                placeholder={t("login.passwordPlaceholder")}
                className="input-modern"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("login.signingIn")}
                </span>
              ) : (
                t("login.signIn")
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted/60 mt-6">{t("login.footer")}</p>
      </div>
    </main>
  );
}
