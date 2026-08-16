"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Wheel from "./Wheel";
import { useToast } from "./ToastContext";

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

export default function WheelPopup() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const { toast } = useToast();
  const [dict, setDict] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedPrize, setSavedPrize] = useState<SpinResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import(`@/dictionaries/${locale}.json`).then((m) => setDict(m.default));
  }, [locale]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSavedPrize(JSON.parse(saved)); } catch {}
    }
    if (!saved) {
      const t = setTimeout(() => setOpen(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (open && prizes.length === 0) {
      fetch("/api/wheel")
        .then((r) => r.json())
        .then((data: Prize[]) => setPrizes(data));
    }
  }, [open, prizes.length]);

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

  function handleClose() {
    setOpen(false);
    setResult(null);
    setCopied(false);
  }

  function handleOpen() {
    setOpen(true);
    if (savedPrize && !result) {
      setResult(savedPrize);
    }
  }

  const displayPrize = result || savedPrize;

  if (!mounted || !dict) return null;

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] right-6 z-50 bg-brand-rust text-espresso w-14 h-14 rounded-full shadow-xl shadow-brand-rust/30 flex items-center justify-center hover:scale-105 hover:shadow-brand-rust/40 transition-all duration-400 animate-pulse-glow"
          aria-label={dict.wheel.openLabel}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
          </svg>
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 "
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="absolute inset-0 bg-espresso/50 backdrop-blur-sm animate-fade-in" />

          <div className="relative bg-[#1F1811] border border-white/[0.08] rounded-[1.75rem] max-w-md w-full p-8 text-center animate-reveal overflow-hidden shadow-2xl shadow-black/50">
            {/* Subtle decorative orb */}
            <div className="absolute top-0 right-0 w-[220px] h-[220px] rounded-full bg-brand-rust/[0.04] -translate-y-1/2 translate-x-1/4 blur-[50px] pointer-events-none" />

            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface hover:bg-surface-hover flex items-center justify-center text-muted hover:text-brand-brown transition-all duration-300 z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {displayPrize ? (
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 mx-auto mb-5 flex items-center justify-center animate-reveal-scale">
                  <svg className="w-8 h-8 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-muted text-sm mb-1.5">
                  {result ? dict.wheel.youWon : dict.wheel.yourPrize}
                </p>
                <h2 className="font-display text-3xl font-bold text-brand-brown mb-6 animate-reveal delay-1">
                  {displayPrize.label}
                </h2>

                <div className="bg-brand-warm rounded-2xl p-5 mb-6 animate-reveal delay-2">
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

                <button onClick={handleClose} className="btn-primary w-full">
                  {dict.wheel.continueShopping}
                </button>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="divider mx-auto mb-6 animate-reveal" />
                <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase mb-3 block animate-reveal">
                  {dict.wheel.luckySpin}
                </span>
                <h2 className="font-display text-2xl font-semibold text-brand-brown mb-2 animate-reveal delay-1">
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
        </div>
      )}
    </>
  );
}
