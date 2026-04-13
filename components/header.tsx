"use client";

import { ShoppingCart, Menu, X, Globe, User, LogOut, Compass, ShoppingBag, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AiLanguageSelector } from "@/components/ai-language-selector";
import { useAiTranslationContext } from "@/components/providers/translation-context";

const OPTIONS = [
  { label: "MN / MNT", name: "Монгол", locale: "mn", currency: "MNT", flag: "🇲🇳" },
  { label: "GB / USD", name: "English", locale: "en", currency: "USD", flag: "🇬🇧" },
  { label: "KR / KRW", name: "한국어", locale: "ko", currency: "KRW", flag: "🇰🇷" },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { currentLocale, setLocaleAndCurrency, isTranslating } = useAiTranslationContext();

  const handleSelect = (locale: string, currency: string) => {
    i18n.changeLanguage(locale);
    setLocaleAndCurrency(locale, currency);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Outside click handler for mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="w-full flex flex-col bg-transparent shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)] relative z-50">

      {/* Top White Navbar Area */}
      <div className="w-full bg-white relative z-10 pt-4 sm:pt-6 pb-2">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between">

            {/* Logo Section */}
            <Link href="/" className="flex items-center group active:scale-95 transition-transform">
              <div className="relative h-24 w-64 sm:h-[10rem] sm:w-[28rem]">
                <Image
                  src="/header.png"
                  alt="Malchin Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation Menu - Removed as requested */}
            <div className="hidden md:block w-4 lg:w-8" />


            {/* Right side Actions (Cart & Hamburger) */}
            <div className="flex items-center space-x-3 sm:space-x-4">

              {/* AI Language & Currency Selector */}
              <div className="hidden sm:block">
                <AiLanguageSelector />
              </div>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 hover:bg-gray-50 rounded-xl sm:rounded-2xl transition-colors active:scale-95"
                aria-label="Сагс"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#1e293b]" strokeWidth={2.5} />
                {isMounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1b7c53] text-white text-[10px] sm:text-xs font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-300 border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu Button */}
              <div className="relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex items-center justify-center w-12 h-10 sm:w-14 sm:h-12 border-2 border-gray-100 hover:border-gray-200 bg-white rounded-xl sm:rounded-2xl transition-all active:scale-95 shadow-sm hover:shadow"
                  aria-label="Цэс"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#1e293b]" strokeWidth={2.5} />
                  ) : (
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-[#1e293b]" strokeWidth={2.5} />
                  )}
                </button>

                {/* The expanded Menu Panel */}
                {isMobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-4 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 animate-in slide-in-from-top-4 fade-in duration-300 overflow-hidden">
                    <div className="p-4 space-y-4">
                      {/* Navigation Links */}
                      <div className="space-y-1">
                        <Link
                          href="/listings"
                          className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl text-left transition-colors group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-[#1b7c53]/10 rounded-xl flex items-center justify-center mr-3 group-hover:bg-[#1b7c53]/20 transition-colors">
                            <Compass className="w-5 h-5 text-[#1b7c53]" />
                          </div>
                          <span className="text-sm text-gray-900 font-bold">MalchinCamp</span>
                        </Link>
                        <Link
                          href="/products"
                          className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl text-left transition-colors group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-[#1b7c53]/10 rounded-xl flex items-center justify-center mr-3 group-hover:bg-[#1b7c53]/20 transition-colors">
                            <ShoppingBag className="w-5 h-5 text-[#1b7c53]" />
                          </div>
                          <span className="text-sm text-gray-900 font-bold">{t("nav.products", "Бүтээгдэхүүн")}</span>
                        </Link>
                        <Link
                          href="/events"
                          className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl text-left transition-colors group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="w-10 h-10 bg-[#1b7c53]/10 rounded-xl flex items-center justify-center mr-3 group-hover:bg-[#1b7c53]/20 transition-colors">
                            <Calendar className="w-5 h-5 text-[#1b7c53]" />
                          </div>
                          <span className="text-sm text-gray-900 font-bold">Арга хэмжээ</span>
                        </Link>
                      </div>


                      <div className="h-px bg-gray-100 mx-3"></div>

                      {/* Auth/user Section */}
                      {isAuthenticated ? (
                        <div className="space-y-4 pt-1">
                          <div className="flex items-center space-x-3 px-3">
                            <div className="w-10 h-10 bg-[#1b7c53] rounded-full flex items-center justify-center shadow-lg shadow-[#1b7c53]/20 text-white font-black text-sm">
                              {user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                              <p className="text-[11px] text-gray-500 font-medium truncate">{user?.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <Link
                              href={
                                user?.role === "ADMIN"
                                  ? "/admin-dashboard"
                                  : user?.role === "HERDER"
                                    ? "/herder-dashboard"
                                    : "/user-dashboard"
                              }
                              className="w-full flex items-center justify-center p-3 bg-gray-900 hover:bg-black text-white rounded-2xl transition-all text-sm font-bold"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {user?.role === "ADMIN" ? t("nav.admin_dashboard", "Админ самбар") : 
                               user?.role === "HERDER" ? t("nav.herder_dashboard", "Малчны самбар") : 
                               t("nav.user_dashboard", "Хэрэглэгчийн самбар")}
                            </Link>

                            <button
                              className="w-full flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-colors text-sm font-bold"
                              onClick={() => {
                                logout();
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              {t("nav.logout", "Гарах")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 pt-1">
                          <Link
                            href="/login"
                            className="flex items-center justify-center p-3 w-full bg-white border-2 border-gray-100 hover:border-gray-200 rounded-2xl text-sm font-bold text-gray-900 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {t("nav.login", "Нэвтрэх")}
                          </Link>

                          <Link
                            href="/register"
                            className="flex items-center justify-center p-3 w-full bg-[#1b7c53] hover:bg-[#156040] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#1b7c53]/20 transition-all active:scale-95"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {t("nav.register", "Бүртгүүлэх")}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Graphic Banner that preserves ratio */}
      <div className="relative w-full overflow-hidden leading-[0] flex-shrink-0 bg-transparent flex justify-center -mt-1 sm:-mt-2">
        <Image
          src="/header-bg.png"
          alt="Traditional Mongolian Cloud Pattern"
          width={1920}
          height={300}
          className="w-full xl:max-w-none h-auto object-cover object-bottom"
          priority
          quality={100}
          unoptimized={true}
        />
      </div>
    </header>
  );
}
