"use client";

import { Button } from "@/components/ui/button";
import { Globe, ChevronDown, Menu, X, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart } from "lucide-react";

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
            <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                Malchin Camp
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
                  Гэр
                </Link>
              </nav>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
            {/* Cart Icon */}
            <Link href="/cart" className="relative group" aria-label="Сагс">
              <div className="p-1 sm:p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {isMounted && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px] text-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </div>
              {/* Tooltip on hover for desktop */}
              <div className="hidden md:group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap z-50">
                Сагс үзэх
              </div>
            </Link>

            {/* Language Selector - Always visible */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 hover:bg-gray-50 p-1 sm:p-1.5 md:p-2 rounded-lg transition-colors"
                aria-label="Хэл солих"
              >
                <img
                  src="/mng-flag.jpg"
                  alt="Монгол туг"
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                />
                <ChevronDown className="hidden xs:block w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2 sm:p-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Бүх хэлийг харуулах</span>
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
                        className="w-full flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 hover:bg-gray-50 rounded-md text-left transition-colors"
                        onClick={() => setIsLanguageOpen(false)}
                      >
                        <span className="text-base sm:text-lg">{lang.flag}</span>
                        <span className="text-xs sm:text-sm text-gray-700">
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
                  <Button className="bg-green-700 hover:bg-green-800 text-white px-4 md:px-6 py-2 text-sm md:text-base h-9 md:h-10">
                    Бүртгүүлэх
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 hover:bg-gray-50 rounded-lg transition-colors"
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
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-1.5 sm:p-2">
                    {/* Navigation Links */}
                    <Link
                      href="/listings"
                      className="w-full flex items-center p-2.5 sm:p-3 hover:bg-gray-50 rounded-md text-left transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Гэр</span>
                    </Link>
                    <Link
                      href="/camps"
                      className="w-full flex items-center p-2.5 sm:p-3 hover:bg-gray-50 rounded-md text-left transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Бүх баазууд</span>
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-2"></div>

                    {/* user Section */}
                    {isAuthenticated ? (
                      <>
                        {/* user Info */}
                        <div className="px-2.5 sm:px-3 py-2 bg-gray-50 rounded-md mb-2">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {user?.name || user?.email}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 truncate">
                            {user?.email}
                          </div>
                        </div>

                        {/* Dashboard Link */}
                        <Link
                          href={
                            user?.role === "admin"
                              ? "/admin-dashboard"
                              : user?.role === "herder"
                                ? "/herder-dashboard"
                                : "/user-dashboard"
                          }
                          className="w-full flex items-center p-2.5 sm:p-3 hover:bg-gray-50 rounded-md text-left transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-2 text-gray-600" />
                          <span className="text-xs sm:text-sm text-gray-700 font-medium">
                            Хянах самбар
                          </span>
                        </Link>

                        {/* Logout Button */}
                        <button
                          className="w-full flex items-center p-2.5 sm:p-3 hover:bg-red-50 rounded-md text-left transition-colors"
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <span className="text-xs sm:text-sm font-semibold text-red-600">
                            Гарах
                          </span>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Login/Register Section */}
                        <div className="flex gap-2 pt-1">
                          <Link
                            href="/login"
                            className="flex-1 flex items-center justify-center py-2 px-3 hover:bg-gray-50 rounded-md transition-all border-2 border-gray-300 hover:border-gray-400"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="text-xs text-gray-800 font-semibold">
                              Нэвтрэх
                            </span>
                          </Link>

                          <Link
                            href="/register"
                            className="flex-1 flex items-center justify-center py-2 px-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-md transition-all shadow-sm hover:shadow-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="text-xs text-white font-bold">
                              Бүртгүүлэх
                            </span>
                          </Link>
                        </div>
                      </>
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
