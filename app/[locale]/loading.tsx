"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function Loading() {
  const params = useParams();
  const locale = params.locale as string;
  const [text, setText] = useState("");

  useEffect(() => {
    import(`@/dictionaries/${locale}.json`).then((m) => setText(m.default.loading));
  }, [locale]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-brand-rust border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">{text}</p>
      </div>
    </div>
  );
}
