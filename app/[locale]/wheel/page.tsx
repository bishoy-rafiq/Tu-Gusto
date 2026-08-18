"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Wheel from "@/components/Wheel";
import { useToast } from "@/components/ToastContext";

type Prize = {
  id: string;
  label: string;
  code: string;
  color: string;
  weight: number;
};

type SpinResult = {
  label: string;
  code: string;
};

const STORAGE_KEY = "wheel-prize";

export default function WheelPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const { toast } = useToast();
  const [dict, setDict] = useState<any>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedPrize, setSavedPrize] = useState<SpinResult | null>(null);

  useEffect(() => {
    import(`@/dictionaries/${locale}.json`).then((m) => setDict(m.default));
  }, [locale]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSavedPrize(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (prizes.length === 0) {
      fetch("/api/wheel")
        .then((r) => r.json())
        .then((data: Prize[]) => setPrizes(data));
    }
  }, [prizes.length]);

  function handleResult(r: SpinResult) {
    setResult(r);
    setSavedPrize(r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
    toast("success", dict?.wheel?.youWon || "You won!", r.label);
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast("info", dict?.wheel?.discountCode || "Code copied", code);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayPrize = result || savedPrize;

  if (!dict) return null;

  return (
    <main className="min-h-screen">
      <section className="bg-espresso pt-32 pb-12 md:pt-32 md:pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-caramel/[0.05] -translate-y-1/2 blur-[70px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-section-x relative z-10">
          <div className="divider mb-2" />
          <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase mb-4 block">
            {isAr ? "عجلة الحظ" : "Lucky Wheel"}
          </span>
          <h1 className="text-heading text-brand-brown font-display">
            {isAr ? "اسحب واربح" : "Spin & Win"}
          </h1>
          <p className="text-muted text-sm mt-2">
            {isAr ? "جرب حظك واحصل على خصم على طلبك القادم" : "Try your luck and get a discount on your next order"}
          </p>
        </div>
      </section>

      <section className="py-section px-section-x relative z-10">
        <div className="max-w-lg mx-auto">
          {displayPrize ? (
            <div className="card-elevated p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 mx-auto mb-5 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-muted text-sm mb-1.5">
                {result ? dict.wheel.youWon : dict.wheel.yourPrize}
              </p>
              <h2 className="font-display text-3xl font-bold text-brand-brown mb-6">
                {displayPrize.label}
              </h2>

              <div className="bg-brand-warm rounded-2xl p-5 mb-6">
                <p className="text-[11px] text-muted mb-2.5 uppercase tracking-[0.15em] font-medium">{dict.wheel.discountCode}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-bold text-brand-brown tracking-[0.12em]">{displayPrize.code}</span>
                  <button
                    onClick={() => handleCopy(displayPrize.code)}
                    className="w-10 h-10 rounded-xl bg-surface border border-white/[0.08] flex items-center justify-center text-muted hover:text-brand-rust hover:border-brand-rust/30 transition-all duration-300"
                  >
                    {copied ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-muted text-xs mb-5">
                {dict.wheel.autoApply}
              </p>

              {result && (
                <button
                  onClick={() => { setResult(null); setCopied(false); }}
                  className="btn-accent w-full"
                >
                  {isAr ? "اسحب مرة أخرى" : "Spin Again"}
                </button>
              )}
            </div>
          ) : (
            <div className="card-elevated p-8 text-center">
              <div className="divider mx-auto mb-6" />
              <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase mb-3 block">
                {dict.wheel.luckySpin}
              </span>
              <h2 className="font-display text-2xl font-semibold text-brand-brown mb-2">
                {dict.wheel.spinWin}
              </h2>
              <p className="text-muted text-sm mb-7">
                {dict.wheel.tryLuck}
              </p>

              {prizes.length > 0 ? (
                <Wheel prizes={prizes} onResult={handleResult} locale={locale} />
              ) : (
                <div className="py-14 text-muted text-sm">{dict.wheel.loadingPrizes}</div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
