import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: {
    default:
      "Tempo - Menstrual Cycle Awareness for Men | Stop Guessing, Start Understanding",
    template: "%s | Tempo",
  },
  description:
    "Tempo helps men in committed relationships understand their partner's menstrual cycle with daily context cards. Science-based, set up together, check in daily. Avoid friction, show better support, stop taking things personally.",
  keywords: [
    "menstrual cycle awareness",
    "relationship app for men",
    "period tracker for partners",
    "hormone cycle education",
    "relationship communication",
    "menstrual cycle app",
    "partner support app",
    "cycle tracking for couples",
    "relationship improvement",
    "understanding hormones",
    "better relationships",
    "menstrual cycle phases",
  ],
  authors: [{ name: "Tempo" }],
  creator: "Tempo",
  publisher: "Tempo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Tempo",
    title: "Tempo - Menstrual Cycle Awareness for Men",
    description:
      "Stop guessing, start understanding. Daily context about your partner's menstrual cycle so you can show up better and avoid predictable friction.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tempo - Menstrual Cycle Awareness App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tempo - Menstrual Cycle Awareness for Men",
    description:
      "Stop guessing, start understanding. Daily context about your partner's menstrual cycle so you can show up better.",
    images: ["/og-image.png"],
    creator: "@tempoapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "Health & Relationships",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "Tempo",
    description:
      "A menstrual cycle awareness app for men in committed relationships. Get daily context about your partner's cycle with science-based insights.",
    applicationCategory: "HealthApplication",
    operatingSystem: "iOS",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
