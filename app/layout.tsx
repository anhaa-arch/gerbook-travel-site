import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { CartProvider } from "@/hooks/use-cart"
import { SavedProvider } from "@/hooks/use-saved"

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Malchin Camp - Discover Mongolia",
  description:
    "Experience authentic Mongolian culture through traditional ger camps, local products, and guided adventures.",
  keywords: "Mongolia, ger camps, travel, nomadic culture, adventure tourism",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning={true}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <CartProvider>
            <SavedProvider>
              <AuthProvider>
                <LanguageProvider>
                  <Header />
                  <main className="min-h-screen">{children}</main>
                </LanguageProvider>
              </AuthProvider>
            </SavedProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
