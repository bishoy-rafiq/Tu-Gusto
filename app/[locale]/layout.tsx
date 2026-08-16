import { CartProvider } from "@/components/CartContext";
import { ToastProvider } from "@/components/ToastContext";
import Header from "@/components/Header";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import WheelPopup from "@/components/WheelPopup";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Footer from "@/components/Footer";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${base}/${locale}`;
  const isAr = locale === "ar";

  return {
    title: isAr
      ? "تو جاستو — على مزاجك | ماكينات إسبريسو ومطاحن وبن محمص"
      : "Tu Gusto — على مزاجك | Premium Coffee Machines, Grinders & Beans",
    description: isAr
      ? "ماكينات إسبريسو ومطاحن وبن محمص فاخر في مصر — بجودة مضمونة وشحن سريع."
      : "Premium espresso machines, grinders, and freshly roasted beans in Egypt — made to your taste.",
    openGraph: {
      locale: isAr ? "ar_EG" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_EG",
      url,
      title: "Tu Gusto — على مزاجك",
      description: isAr
        ? "ماكينات إسبريسو ومطاحن وبن محمص فاخر في مصر — بجودة مضمونة وشحن سريع."
        : "Premium espresso machines, grinders, and freshly roasted beans in Egypt — made to your taste.",
    },
    alternates: {
      canonical: url,
      languages: {
        en: `${base}/en`,
        ar: `${base}/ar`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;

  if (raw !== "en" && raw !== "ar") {
    notFound();
  }

  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div lang={locale} dir={dir} className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      <ToastProvider>
        <CartProvider>
          <Header locale={locale} dict={dict} />

        <main className="flex-1 min-w-0">
          {children}
        </main>

        <WheelPopup />
        <WhatsAppFloat locale={locale} />
        <Footer locale={locale} dict={dict} />
        </CartProvider>
      </ToastProvider>
    </div>
  );
}
