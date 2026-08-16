"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    import(`@/dictionaries/${locale}.json`).then((m) => setDict(m.default));
  }, [locale]);

  if (!dict) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-24 h-24 rounded-full bg-red-50 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-display font-semibold text-brand-brown mb-3">{dict.error.title}</h1>
        <p className="text-muted text-sm mb-8">{error.message || dict.error.message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            {dict.error.retry}
          </button>
          <Link href={`/${locale}`} className="btn-ghost">
            {dict.error.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
