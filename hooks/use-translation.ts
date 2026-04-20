"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAiTranslationContext } from "../components/providers/translation-context";

/**
 * Hook to get a translated text value.
 * First checks i18n keys (locales/*.ts), then falls back to AI translation context,
 * and finally uses the original string as a last resort.
 */
export function useTranslatedValue(id: string, original: string): string {
  const { t, i18n } = useTranslation();
  const { translatedTexts, currentLocale, registerText } = useAiTranslationContext();

  useEffect(() => {
    registerText(id, original);
  }, [id, original, registerText]);

  // Always check i18n first — this is where locales/mn.ts, en.ts, ko.ts live
  const i18nValue = t(id, { defaultValue: "" });
  if (i18nValue && i18nValue !== id && i18nValue !== "") {
    return i18nValue;
  }

  // For non-MN locales, try AI translation context
  if (currentLocale !== "mn") {
    return translatedTexts[id] ?? original;
  }

  // Final fallback: the original parameter
  return original;
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
