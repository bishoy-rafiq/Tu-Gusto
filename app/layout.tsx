import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tu Gusto — على مزاجك | Premium Coffee Machines, Grinders & Beans",
    template: "%s | Tu Gusto",
  },
  description:
    "Premium espresso machines, grinders, and freshly roasted beans in Egypt — made to your taste. Free shipping, authentic products, fast support.",
  applicationName: "Tu Gusto",
  manifest: "/manifest.json",
  themeColor: "#141009",
  keywords: [
    "espresso machine",
    "coffee grinder",
    "coffee beans",
    "specialty coffee Egypt",
    "ماكينة إسبريسو",
    "بن محمص",
    "مطاحن قهوة",
    "Tu Gusto",
  ],
  creator: "Tu Gusto",
  publisher: "Tu Gusto",
  formatDetection: { telephone: true },
  icons: {
    icon: "/icon-512.png",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tu Gusto",
  },
  openGraph: {
    type: "website",
    siteName: "Tu Gusto",
    locale: "en_US",
    alternateLocale: ["ar_EG"],
    url: siteUrl,
    title: "Tu Gusto — على مزاجك | Premium Coffee Machines, Grinders & Beans",
    description:
      "Premium espresso machines, grinders, and freshly roasted beans in Egypt — made to your taste.",
    images: [
      {
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        alt: "Tu Gusto — Premium coffee equipment and beans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tu Gusto — على مزاجك",
    description:
      "Premium espresso machines, grinders, and freshly roasted beans in Egypt — made to your taste.",
    images: [`${siteUrl}/icon-512.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: { en: "/en", ar: "/ar" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Tu Gusto",
        alternateName: "Tu Gusto — على مزاجك",
        url: siteUrl,
        logo: { "@type": "ImageObject", url: `${siteUrl}/images/logo.webp` },
        image: `${siteUrl}/icon-512.png`,
        sameAs: ["https://www.instagram.com/tugusto755/"],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: ["English", "Arabic"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Tu Gusto — على مزاجك",
        description:
          "Premium espresso machines, grinders, and freshly roasted beans in Egypt — made to your taste.",
        inLanguage: ["en", "ar"],
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
