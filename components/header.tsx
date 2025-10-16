"use client";

import { Button } from "@/components/ui/button";
import { Globe, ChevronDown, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

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
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-semibold text-gray-900">
                Malchin Camp
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center ml-8">
              <div className="h-6 w-px bg-gray-300 mr-8"></div>
              <nav className="flex items-end space-x-8">
                <Link
                  href="/listings"
                  className="text-gray-500 focus:text-gray-900 font-bold border-b-2 border-green-600"
                >
                  Гэр
                </Link>
              </nav>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Selector */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-50 p-1 sm:p-2 rounded-lg"
              >
                <img
                  src="/mng-flag.jpg"
                  alt="Монгол туг"
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                />
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <span>Бүх хэлийг харуулах</span>
                    </div>
                  </div>
                  <div className="p-2">
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
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md text-left"
                        onClick={() => setIsLanguageOpen(false)}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm text-gray-700">
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
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 hover:bg-gray-50 p-1 sm:p-2 rounded-lg"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="text-sm font-medium truncate">
                        {user?.name || user?.email}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href={
                          user?.role === "admin"
                            ? "/admin-dashboard"
                            : user?.role === "herder"
                            ? "/herder-dashboard"
                            : "/user-dashboard"
                        }
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md text-left"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="text-sm text-gray-700">
                          Хянах самбар
                        </span>
                      </Link>
                      <button
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md text-left"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                      >
                        <span className="text-sm font-semibold text-red-500">
                          Гарах
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 text-sm sm:text-base"
                >
                  Нэвтрэх
                </Link>
                <Link href="/register">
                  <Button className="bg-green-700 hover:bg-green-800 text-white px-3 sm:px-6 text-sm sm:text-base">
                    Бүртгүүлэх
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center w-8 h-8 hover:bg-gray-50 rounded-lg"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Mobile Menu */}
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <Link
                      href="/listings"
                      className="w-full flex items-center p-3 hover:bg-gray-50 rounded-md text-left"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm text-gray-700">Гэр</span>
                    </Link>
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
