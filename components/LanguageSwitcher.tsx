"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type Props = {
  locale: "en" | "ar";
  scrolled?: boolean;
  active?: "en" | "ar";
  onChange?: (lang: "en" | "ar") => void;
  className?: string;
};

export default function LanguageSwitcher({
  locale,
  scrolled = true,
  active,
  onChange,
  className = "",
}: Props) {
  const pathname = usePathname();
  const otherLocale = locale === "en" ? "ar" : "en";
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const current = active ?? locale;

  const hrefFor = (seg: "en" | "ar") =>
    locale === seg ? pathname : otherPath;

  const segClass = (seg: "en" | "ar") =>
    `relative z-10 w-[38px] sm:w-[52px] text-center px-1.5 sm:px-3 py-1 rounded-full transition-colors duration-300 cursor-pointer ${
      current === seg
        ? "text-white"
        : scrolled
          ? "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          : "text-[var(--text-muted)] hover:text-white"
    }`;

  const thumbLeft = current === "en" ? "left-0.5" : "left-[calc(50%+1px)]";

  return (
    <div
      dir="ltr"
      className={`relative flex items-center rounded-full p-0.5 text-[10px] sm:text-[11px] font-semibold transition-all duration-400 ${
        scrolled
          ? "bg-surface border border-[var(--border-subtle)]"
          : "bg-white/[0.08] border border-white/15 backdrop-blur-sm"
      } ${className}`}
    >
      <span
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full transition-[left] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          current === "en"
            ? "left-0.5 bg-[var(--btn-primary)] shadow-md shadow-[var(--btn-primary)]/30"
            : "left-[calc(50%+1px)] bg-[var(--accent-orange)] shadow-md shadow-[var(--accent-orange)]/30"
        }`}
      />
      {onChange ? (
        <>
          <button
            onClick={() => onChange("en")}
            aria-current={current === "en" ? "page" : undefined}
            className={segClass("en")}
          >
            EN
          </button>
          <button
            onClick={() => onChange("ar")}
            aria-current={current === "ar" ? "page" : undefined}
            className={segClass("ar")}
          >
            عربي
          </button>
        </>
      ) : (
        <>
          <Link
            href={hrefFor("en")}
            aria-current={current === "en" ? "page" : undefined}
            className={segClass("en")}
          >
            EN
          </Link>
          <Link
            href={hrefFor("ar")}
            aria-current={current === "ar" ? "page" : undefined}
            className={segClass("ar")}
          >
            عربي
          </Link>
        </>
      )}
    </div>
  );
}
