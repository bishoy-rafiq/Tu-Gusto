"use client";

import { useState, useEffect, useCallback } from "react";

const DISMISS_KEY = "install-banner-dismissed";
const SHOWN_KEY = "install-banner-shown";

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    !!((window.navigator as any).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export default function InstallBanner({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (localStorage.getItem(SHOWN_KEY)) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
      localStorage.setItem(SHOWN_KEY, "1");
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
      localStorage.removeItem(SHOWN_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (isIOS() && !isStandalone()) {
      const timer = setTimeout(() => {
        if (!localStorage.getItem(DISMISS_KEY) && !localStorage.getItem(SHOWN_KEY)) {
          setShowIOSModal(true);
          localStorage.setItem(SHOWN_KEY, "1");
        }
      }, 8000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setShowIOSModal(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }, []);

  if (installed) return null;

  return (
    <>
      {/* Android / Chrome install banner */}
      {showBanner && deferredPrompt && (
        <div className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[55] animate-reveal">
          <div className="bg-[#1E1812] border border-white/[0.08] rounded-2xl p-4 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-brand-rust/15 flex items-center justify-center flex-shrink-0">
                <img
                  src="/icon-192.png"
                  alt="Tu Gusto"
                  className="w-7 h-7 rounded-lg object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-brand-brown font-semibold text-sm">
                  {isAr ? "تثبيت Tu Gusto" : "Install Tu Gusto"}
                </p>
                <p className="text-muted text-xs mt-0.5 leading-relaxed">
                  {isAr
                    ? "أضف المتجر إلى شاشتك الرئيسية للوصول السريع"
                    : "Add to your home screen for quick access"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-brand-rust text-espresso text-sm font-semibold py-2.5 rounded-xl hover:bg-brand-tan transition-colors"
              >
                {isAr ? "تثبيت" : "Install"}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-muted text-sm hover:text-brand-brown transition-colors"
              >
                {isAr ? "لاحقاً" : "Later"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS install modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-[#1E1812] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 pb-8 sm:p-8 text-center animate-reveal shadow-2xl shadow-black/50">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-muted hover:text-brand-brown transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-14 h-14 rounded-2xl bg-brand-rust/15 flex items-center justify-center mx-auto mb-5">
              <img src="/icon-192.png" alt="Tu Gusto" className="w-9 h-9 rounded-xl object-contain" />
            </div>

            <h3 className="text-brand-brown font-display font-semibold text-lg mb-2">
              {isAr ? "أضف إلى الشاشة الرئيسية" : "Add to Home Screen"}
            </h3>
            <p className="text-muted text-sm leading-relaxed mb-6">
              {isAr
                ? "اضغط على زر المشاركة ثم \"إضافة إلى الشاشة الرئيسية\" للتجربة الأفضل"
                : "Tap the Share button then \"Add to Home Screen\" for the best experience"}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left bg-white/[0.04] rounded-xl p-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
                <div>
                  <p className="text-brand-brown text-xs font-medium">
                    {isAr ? "1. اضغط زر المشاركة" : "1. Tap the Share button"}
                  </p>
                  <p className="text-muted text-[11px] mt-0.5">
                    {isAr ? "في شريط الأدوات السفلي" : "in the bottom toolbar"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left bg-white/[0.04] rounded-xl p-3.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <p className="text-brand-brown text-xs font-medium">
                    {isAr ? "2. اختر \"إضافة إلى الشاشة الرئيسية\"" : "2. Choose \"Add to Home Screen\""}
                  </p>
                  <p className="text-muted text-[11px] mt-0.5">
                    {isAr ? "مرر للأسفل للعثور عليها" : "Scroll down to find it"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full mt-6 py-2.5 text-muted text-sm hover:text-brand-brown transition-colors"
            >
              {isAr ? "فهمت" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
