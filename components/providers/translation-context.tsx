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
  
  // Track registered count to detect new items
  const [registeredCount, setRegisteredCount] = useState(0);

  // Use a ref to keep track of all registered items on the current page
  const registry = useRef<TranslationRegistry>({ texts: {}, prices: {} });

  const registerText = useCallback((id: string, value: string) => {
    if (registry.current.texts[id] === value) return;
    registry.current.texts[id] = value;
    setRegisteredCount(prev => prev + 1);
  }, []);

  const registerPrice = useCallback((id: string, amount: number, currency: string) => {
    if (registry.current.prices[id]?.amount === amount && registry.current.prices[id]?.currency === currency) return;
    registry.current.prices[id] = { amount, currency };
    setRegisteredCount(prev => prev + 1);
  }, []);

  const translatePage = async () => {
    if (currentLocale === "mn" && currentCurrency === "MNT") {
      setTranslatedTexts({});
      setTranslatedPrices({});
      return;
    }

    const snapshot = {
      texts: Object.entries(registry.current.texts).map(([id, value]) => ({ id, value })),
      prices: Object.entries(registry.current.prices).map(([id, p]) => ({ id, ...p })),
    };

    if (snapshot.texts.length === 0 && snapshot.prices.length === 0) return;

    setIsTranslating(true);
    try {
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

  // 1. Initial trigger when locale/currency changes
  React.useEffect(() => {
    translatePage();
  }, [currentLocale, currentCurrency]);

  // 2. Auto-sync: debounced trigger when new items are registered
  React.useEffect(() => {
    if (currentLocale === "mn" && currentCurrency === "MNT") return;
    if (isTranslating) return;

    const timer = setTimeout(() => {
      translatePage();
    }, 1000); // 1s debounce to batch registrations

    return () => clearTimeout(timer);
  }, [registeredCount, currentLocale, currentCurrency]);

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
