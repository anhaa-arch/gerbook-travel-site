"use client";

import { Button } from "@/components/ui/button";
import { Globe, ChevronDown, Menu, X, User, ShoppingCart, Home, Compass, LogOut, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

export function Header() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isuserMenuOpen, setIsuserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const languageRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Outside click handler for language menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setIsLanguageOpen(false);
      }
    };

    if (isLanguageOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLanguageOpen]);

  // Outside click handler for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsuserMenuOpen(false);
      }
    };

    if (isuserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isuserMenuOpen]);

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 active:scale-95 transition-transform">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm rotate-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-600 rounded-md"></div>
                </div>
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                MALCHIN
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center ml-4 md:ml-8">
              <div className="h-6 w-px bg-gray-300 mr-4 md:mr-8"></div>
              <nav className="flex items-end space-x-4 md:space-x-8">

                <Link
                  href="/listings"
                  className="text-gray-500 hover:text-gray-900 focus:text-gray-900 font-bold border-b-2 border-green-600 text-sm md:text-base"
                >
                  Амралт баазууд
                </Link>

              </nav>
            </div>
          </div>

          {/* Right side - Mobile and Desktop */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Cart Icon - Always visible */}
            <Link href="/cart" className="relative group active:scale-90 transition-transform" aria-label="Сагс">
              <div className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {isMounted && itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-md z-10 animate-in zoom-in duration-300">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden md:group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg whitespace-nowrap z-50 shadow-xl">
                Сагс үзэх
              </div>
            </Link>

            {/* Language Selector - Desktop Only (Hidden on Mobile) */}
            <div className="hidden lg:relative lg:block" ref={languageRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 hover:bg-gray-50 p-1.5 rounded-lg transition-colors min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] justify-center"
                aria-label="Хэл солих"
              >
                <img
                  src="/mng-flag.jpg"
                  alt="Монгол туг"
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shadow-sm border border-gray-100"
                />
                <ChevronDown className="hidden sm:block w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 sm:w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] animate-in fade-in zoom-in duration-200">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 font-bold">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>Хэл сонгох</span>
                    </div>
                  </div>
                  <div className="p-1.5 sm:p-2 max-h-[60vh] overflow-y-auto">
                    {[
                      { flag: "🇲🇳", name: "Монгол" },
                      { flag: "🇬🇧", name: "English" },
                      { flag: "🇨🇳", name: "中文" },
                      { flag: "🇯🇵", name: "日本語" },
                      { flag: "🇰🇷", name: "한국어" },
                      { flag: "🇷🇺", name: "Русский" },
                      { flag: "🇩🇪", name: "Deutsch" },
                    ].map((lang, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center space-x-3 p-2.5 sm:p-2 hover:bg-emerald-50 rounded-lg text-left transition-colors"
                        onClick={() => setIsLanguageOpen(false)}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm font-bold text-gray-700">
                          {lang.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsuserMenuOpen(!isuserMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-50 p-1 sm:p-1.5 rounded-lg transition-colors"
                  aria-label="Хэрэглэгчийн цэс"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                </button>

                {isuserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2.5 sm:p-3 border-b border-gray-100">
                      <div className="text-xs sm:text-sm font-medium truncate">
                        {user?.name || user?.email}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">
                        {user?.email}
                      </div>
                    </div>
                    <div className="p-1.5 sm:p-2">
                      <Link
                        href={
                          user?.role === "admin"
                            ? "/admin-dashboard"
                            : user?.role === "herder"
                              ? "/herder-dashboard"
                              : "/user-dashboard"
                        }
                        className="w-full flex items-center p-2 sm:p-2.5 hover:bg-gray-50 rounded-md text-left transition-colors"
                        onClick={() => setIsuserMenuOpen(false)}
                      >
                        <span className="text-xs sm:text-sm text-gray-700 font-medium">
                          Хянах самбар
                        </span>
                      </Link>
                      <button
                        className="w-full flex items-center p-2 sm:p-2.5 hover:bg-red-50 rounded-md text-left transition-colors"
                        onClick={() => {
                          logout();
                          setIsuserMenuOpen(false);
                        }}
                      >
                        <span className="text-xs sm:text-sm font-semibold text-red-600">
                          Гарах
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Desktop only - Login/Register buttons */}
                <Link
                  href="/login"
                  className="hidden lg:block text-gray-700 hover:text-gray-900 text-sm md:text-base font-medium transition-colors"
                >
                  Нэвтрэх
                </Link>
                <Link href="/register" className="hidden lg:block">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 md:px-6 py-2 text-sm md:text-base h-9 md:h-10">
                    Бүртгүүлэх
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                aria-label="Цэс"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                )}
              </button>

              {/* Mobile Menu */}
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-80 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300 overflow-hidden">
                  <div className="p-4 space-y-4">
                    {/* Navigation Links */}
                    <div className="space-y-1">
                      <Link
                        href="/listings"
                        className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl text-left transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mr-3">
                          <Compass className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-900 font-bold">Амралт баазууд</span>
                      </Link>
                      <Link
                        href="/products"
                        className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl text-left transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mr-3">
                          <ShoppingBag className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-900 font-bold">Бүтээгдэхүүн</span>
                      </Link>
                    </div>

                    {/* Language Switcher in Mobile Menu */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
                        <Globe className="w-3 h-3 text-emerald-600" />
                        <span>Хэл сонгох</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { flag: "🇲🇳", name: "Монгол" },
                          { flag: "🇬🇧", name: "English" },
                          { flag: "🇨🇳", name: "中文" },
                          { flag: "🇷🇺", name: "Русский" },
                        ].map((lang, index) => (
                          <button
                            key={index}
                            className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="text-base">{lang.flag}</span>
                            <span className="text-[11px] font-bold text-gray-700">{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 mx-2"></div>

                    {/* user Section */}
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 px-2">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 text-white font-black text-sm">
                            {user?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                            <p className="text-[11px] text-gray-400 font-medium truncate">{user?.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <Link
                            href={
                              user?.role === "admin"
                                ? "/admin-dashboard"
                                : user?.role === "herder"
                                  ? "/herder-dashboard"
                                  : "/user-dashboard"
                            }
                            className="w-full flex items-center p-3 bg-gray-900 hover:bg-black text-white rounded-2xl transition-all text-sm font-bold justify-center"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Хянах самбар
                          </Link>

                          <button
                            className="w-full flex items-center p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-colors text-sm font-bold justify-center"
                            onClick={() => {
                              logout();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Гарах
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/login"
                          className="flex items-center justify-center p-3 w-full bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Нэвтрэх
                        </Link>

                        <Link
                          href="/register"
                          className="flex items-center justify-center p-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Бүртгүүлэх
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
    </header>
  );
}
