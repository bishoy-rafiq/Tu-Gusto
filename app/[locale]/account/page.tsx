"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import CustomerAuth from "@/components/CustomerAuth";

type Customer = {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  notifyProducts: boolean;
  notifyOffers: boolean;
};

export default function AccountPage() {
  const { locale } = useParams();
  const isAr = locale === "ar";

  return (
    <main className="min-h-screen">
      <section className="bg-espresso pt-32 pb-12 md:pt-32 md:pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-caramel/[0.05] -translate-y-1/2 blur-[70px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-section-x relative z-10">
          <div className="divider mb-2" />
          <span className="text-brand-rust text-[11px] font-semibold tracking-[0.28em] uppercase mb-4 block">
            {isAr ? "حسابي" : "My Account"}
          </span>
          <h1 className="text-heading text-brand-brown font-display">
            {isAr ? "الملف الشخصي" : "Profile"}
          </h1>
        </div>
      </section>

      <section className="py-section px-section-x relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="card-elevated p-6 md:p-8">
            <CustomerAuth locale={locale as string} />
          </div>
        </div>
      </section>
    </main>
  );
}
