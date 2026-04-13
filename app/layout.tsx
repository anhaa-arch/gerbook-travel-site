// SEO: Brand optimization for "MalchinCamp" search
import type React from "react";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import { ClientHeader } from "@/components/client-header";
import { LanguageProvider } from "@/components/language-provider";
import ApolloClientProvider from "@/components/apollo-client-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/hooks/use-cart";
import { SavedProvider } from "@/hooks/use-saved";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AiTranslationProvider } from "@/components/providers/translation-context";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

// SEO: Brand-first metadata for Google brand search "MalchinCamp"
export const metadata: Metadata = {
  // Brand-first title with both Latin and Cyrillic brand names
  title: {
    default: "Малчин Кэмп – Тасалж болохгүй  ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ | Гэр бааз, аялал, бүтээгдэхүүн",
    template: "%s | Малчин Кэмп – Тасалж болохгүй  ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ",
  },
  description:
    "Малчин Кэмп – Тасалж болохгүй  ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ. Монголын гэр бааз, аялал, морьт харваа, соёлын наадам, малчдын бүтээгдэхүүнийг онлайнаар захиалах платформ.",
  keywords:
    "Малчин Кэмп, MalchinCamp, Тасалж болохгүй  ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ, malchincamp.mn, гэр бааз, ger camp, Mongolia travel, Монгол аялал, нүүдэлчин соёл, морьт харваа, малчдын бүтээгдэхүүн, nomadic culture, adventure tourism, Архангай, Цэнхэр",
  // Canonical URL
  metadataBase: new URL("https://www.malchincamp.mn"),
  alternates: {
    canonical: "/",
  },
  // Open Graph tags for social media and Google
  openGraph: {
    title: "Малчин Кэмп – Тасалж болохгүй  ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ",
    description:
      "Малчин Кэмп – Тасалж болохгүй  ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ. Монголын гэр бааз, аялал, малчдын бүтээгдэхүүнийг онлайнаар захиалах платформ.",
    url: "https://www.malchincamp.mn",
    siteName: "MalchinCamp",
    type: "website",
    locale: "mn_MN",
    images: [
      {
        url: "/header-bg.png",
        width: 1200,
        height: 630,
        alt: "MalchinCamp – Малчин Кэмп | Монголын гэр бааз",
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Малчин Кэмп – Тасалж болохгүй  ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ",
    description:
      "Малчин Кэмп – Тасалж болохгүй  ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ. Монголын гэр бааз, аялал, малчдын бүтээгдэхүүнийг онлайнаар захиалах платформ.",
    images: ["/header-bg.png"],
  },
  // Robots
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
  // Verification (placeholder — replace with actual codes from Search Console)
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_CODE",
  // },
  other: {
    "format-detection": "telephone=no",
  },
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="mn"
      className={montserrat.variable}
      suppressHydrationWarning={true}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ApolloClientProvider>
            <CartProvider>
              <SavedProvider>
                <GoogleOAuthProvider clientId={googleClientId}>
                  <AuthProvider>
                    <LanguageProvider>
                      <AiTranslationProvider>
                        <TooltipProvider>
                          <ClientHeader />
                          <main className="flex-1">{children}</main>
                          <Toaster />
                          <Footer />
                        </TooltipProvider>
                      </AiTranslationProvider>
                    </LanguageProvider>
                  </AuthProvider>
                </GoogleOAuthProvider>
              </SavedProvider>
            </CartProvider>
          </ApolloClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
