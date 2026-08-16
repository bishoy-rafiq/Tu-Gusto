"use client";

import { useEffect } from "react";

export default function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fade-in_0.2s_ease]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} max-h-[90vh] flex flex-col bg-card border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden animate-[modal-in_0.25s_cubic-bezier(0.16,1,0.3,1)]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 mesh-aurora-light pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-rust/40 to-transparent" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="font-display text-xl font-semibold text-brand-tan">{title}</h2>
            {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-muted hover:text-brand-tan hover:bg-surface transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="relative flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
