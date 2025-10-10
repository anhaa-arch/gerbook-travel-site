import type React from "react";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ClientHeader } from "@/components/client-header";
// import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import ApolloClientProvider from "@/components/apollo-client-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/hooks/use-cart";
import { SavedProvider } from "@/hooks/use-saved";
import dynamic from "next/dynamic";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Malchin Camp - Discover Mongolia",
  description:
    "Experience authentic Mongolian culture through traditional ger camps, local products, and guided adventures.",
  keywords: "Mongolia, ger camps, travel, nomadic culture, adventure tourism",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={montserrat.variable}
      suppressHydrationWarning={true}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {" "}
          <ApolloClientProvider>
            <CartProvider>
              <SavedProvider>
                <AuthProvider>
                  <LanguageProvider>
                    <ClientHeader />
                    <main className="flex-1">{children}</main>
                    <Toaster />
                    <Footer />
                  </LanguageProvider>
                </AuthProvider>
              </SavedProvider>
            </CartProvider>
          </ApolloClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
