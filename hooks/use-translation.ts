"use client";

import { useEffect } from "react";
import { useAiTranslationContext } from "../components/providers/translation-context";

/**
 * Hook to get a translated text value.
 * Registers the text in the translation context on mount.
 */
export function useTranslatedValue(id: string, original: string): string {
  const { translatedTexts, currentLocale, registerText } = useAiTranslationContext();

  useEffect(() => {
    registerText(id, original);
  }, [id, original, registerText]);

  if (currentLocale === "mn") return original;
  return translatedTexts[id] ?? original;
}

/**
 * Hook to get a translated price.
 * Registers the price in the translation context on mount.
 */
export function useTranslatedPrice(id: string, originalAmount: number, originalCurrency: string = "MNT") {
  const { translatedPrices, currentCurrency, registerPrice } = useAiTranslationContext();

  useEffect(() => {
    registerPrice(id, originalAmount, originalCurrency);
  }, [id, originalAmount, originalCurrency, registerPrice]);

  if (currentCurrency === "MNT") {
    return `${originalAmount.toLocaleString()}₮`;
  }

  const p = translatedPrices[id];
  return p ? p.formatted : `${originalAmount.toLocaleString()}₮`;
}
