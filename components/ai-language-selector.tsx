"use client";

import React, { useState } from "react";
import { Globe, Check, ChevronDown, Coins, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAiTranslationContext } from "./providers/translation-context";
import { useTranslation } from "react-i18next";

const OPTIONS = [
  { label: "Монгол / MNT", locale: "mn", currency: "MNT", flag: "🇲🇳" },
  { label: "English / USD", locale: "en", currency: "USD", flag: "🇬🇧" },
  { label: "한국어 / KRW", locale: "ko", currency: "KRW", flag: "🇰🇷" },
];

export function AiLanguageSelector() {
  const { currentLocale, currentCurrency, setLocaleAndCurrency, isTranslating } = useAiTranslationContext();
  const { i18n } = useTranslation();

  const currentOption = OPTIONS.find(
    (o) => o.locale === currentLocale && o.currency === currentCurrency
  ) || OPTIONS[0];

  const handleSelect = (locale: string, currency: string) => {
    // 1. Change i18n locale (for static translations)
    i18n.changeLanguage(locale);
    // 2. Change AI context (for dynamic translations and currency)
    setLocaleAndCurrency(locale, currency);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-3 sm:px-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 flex items-center gap-2 group transition-all"
            disabled={isTranslating}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentOption.flag}</span>
              <span className="hidden sm:inline text-xs font-bold text-gray-700">
                {currentOption.label.split(" / ")[1]}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:text-[#1b7c53]`} strokeWidth={2.5} />
            {isTranslating && (
              <Zap className="w-3 h-3 text-[#1b7c53] animate-pulse fill-[#1b7c53]" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-gray-100">
          <DropdownMenuLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1b7c53] px-2 py-3">
            <Globe className="w-3.5 h-3.5" />
            AI Language & Currency
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-50" />
          <div className="space-y-1 mt-1">
            {OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.locale}
                onClick={() => handleSelect(opt.locale, opt.currency)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  currentLocale === opt.locale ? "bg-[#1b7c53]/5" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.flag}</span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${currentLocale === opt.locale ? "text-[#1b7c53]" : "text-gray-900"}`}>
                      {opt.label}
                    </span>
                  </div>
                </div>
                {currentLocale === opt.locale && (
                  <Check className="w-4 h-4 text-[#1b7c53]" strokeWidth={3} />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
