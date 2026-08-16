import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/dictionaries";

export default async function SuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 mx-auto mb-6 flex items-center justify-center animate-reveal-scale">
          <svg className="w-10 h-10 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-display font-semibold text-brand-brown mb-3 animate-reveal delay-1">
          {dict.success.title}
        </h1>
        <p className="text-muted text-sm mb-8 animate-reveal delay-2">
          {dict.success.text}
        </p>
        <Link
          href={`/${locale}/products`}
          className="btn-primary animate-reveal delay-3"
        >
          {dict.success.continue}
        </Link>
      </div>
    </main>
  );
}
