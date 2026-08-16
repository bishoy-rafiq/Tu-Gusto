"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toast: (type: ToastType, title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const icons: Record<ToastType, { ring: string; chip: string; icon: React.ReactNode }> = {
  success: {
    ring: "border-emerald-500/25",
    chip: "bg-emerald-500/15 text-emerald-400",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
  },
  error: {
    ring: "border-red-500/25",
    chip: "bg-red-500/15 text-red-400",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    ring: "border-brand-rust/30",
    chip: "bg-brand-rust/15 text-brand-rust",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = ++nextId;
      setToasts((t) => [{ id, type, title, description }, ...t.slice(0, 4)]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack */}
      <div className="fixed top-6 end-6 z-[100] flex flex-col gap-3 w-[calc(100vw-3rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto relative bg-card/95 backdrop-blur-xl rounded-2xl border ${icons[t.type].ring} shadow-2xl shadow-black/40 overflow-hidden animate-[toast-in_0.3s_cubic-bezier(0.16,1,0.3,1)]`}
            role="status"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="flex items-start gap-3 px-4 py-3.5">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${icons[t.type].chip}`}>
                {icons[t.type].icon}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-brand-tan leading-tight">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-muted mt-0.5 leading-snug">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="p-1 -m-1 rounded-lg text-muted hover:text-brand-tan hover:bg-surface transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div
              className="h-[2px] bg-gradient-to-r from-brand-rust via-brand-rust/60 to-transparent animate-[toast-progress_4s_linear_forwards]"
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
