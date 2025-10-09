"use client";

import { Button } from "@/components/ui/button";
import { Globe, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-start pr-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Malchin Camp
                </span>
              </Link>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <nav className="hidden md:flex items-end space-x-8 pl-8">
              <Link
                href="/listings"
                className="text-gray-500 focus:text-gray-900 font-bold border-b-2 border-green-600 "
              >
                Гэр
              </Link>
              <Link
                href="/destinations"
                className="text-gray-500 hover:text-gray-900 font-bold"
              >
                Аялах газар
              </Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg"
              >
                <img
                  src="/mng-flag.jpg"
                  alt="Монгол туг"
                  className="w-6 h-6 rounded-full object-cover"
                />
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
            <Link href="/login" className="text-gray-700 hover:text-gray-900">
              Нэвтрэх
            </Link>
            <Link href="/register">
              <Button className="bg-green-700 hover:bg-green-800 text-white px-6">
                Бүртгүүлэх
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
