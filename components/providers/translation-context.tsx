"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";

type TranslatedText = { id: string; value: string };
type TranslatedPrice = { id: string; amount: number; currency: string; formatted: string };

type TranslationRegistry = {
  texts: Record<string, string>;
  prices: Record<string, { amount: number; currency: string }>;
};

interface AiTranslationContextType {
  currentLocale: string;
  currentCurrency: string;
  translatedTexts: Record<string, string>;
  translatedPrices: Record<string, TranslatedPrice>;
  isTranslating: boolean;
  setLocaleAndCurrency: (locale: string, currency: string) => void;
  registerText: (id: string, value: string) => void;
  registerPrice: (id: string, amount: number, currency: string) => void;
  translatePage: () => Promise<void>;
}

const AiTranslationContext = createContext<AiTranslationContextType | undefined>(undefined);

export function AiTranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState("mn");
  const [currentCurrency, setCurrentCurrency] = useState("MNT");
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [translatedPrices, setTranslatedPrices] = useState<Record<string, TranslatedPrice>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Use a ref to keep track of all registered items on the current page
  const registry = useRef<TranslationRegistry>({ texts: {}, prices: {} });

  const registerText = useCallback((id: string, value: string) => {
    registry.current.texts[id] = value;
  }, []);

  const registerPrice = useCallback((id: string, amount: number, currency: string) => {
    registry.current.prices[id] = { amount, currency };
  }, []);

  const translatePage = async () => {
    if (currentLocale === "mn" && currentCurrency === "MNT") {
      setTranslatedTexts({});
      setTranslatedPrices({});
      return;
    }

    setIsTranslating(true);
    try {
      const snapshot = {
        texts: Object.entries(registry.current.texts).map(([id, value]) => ({ id, value })),
        prices: Object.entries(registry.current.prices).map(([id, p]) => ({ id, ...p })),
      };

      const response = await fetch("/api/ai-translate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLocale: "mn",
          toLocale: currentLocale,
          toCurrency: currentCurrency,
          snapshot,
        }),
      });

      const data = await response.json();
      
      const newTexts: Record<string, string> = {};
      data.texts.forEach((t: TranslatedText) => {
        newTexts[t.id] = t.value;
      });

      const newPrices: Record<string, TranslatedPrice> = {};
      data.prices.forEach((p: TranslatedPrice) => {
        newPrices[p.id] = p;
      });

      setTranslatedTexts(newTexts);
      setTranslatedPrices(newPrices);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const setLocaleAndCurrency = (locale: string, currency: string) => {
    setCurrentLocale(locale);
    setCurrentCurrency(currency);
  };

  // Trigger translation when locale/currency changes (and it's not MN/MNT)
  React.useEffect(() => {
    translatePage();
  }, [currentLocale, currentCurrency]);

  return (
    <AiTranslationContext.Provider
      value={{
        currentLocale,
        currentCurrency,
        translatedTexts,
        translatedPrices,
        isTranslating,
        setLocaleAndCurrency,
        registerText,
        registerPrice,
        translatePage,
      }}
    >
      {children}
    </AiTranslationContext.Provider>
  );
}

export function useAiTranslationContext() {
  const context = useContext(AiTranslationContext);
  if (context === undefined) {
    throw new Error("useAiTranslationContext must be used within an AiTranslationProvider");
  }
  return context;
}
