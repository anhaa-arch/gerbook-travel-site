"use client";

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import mnTranslations from "../locales/mn"
import enTranslations from "../locales/en"
import koTranslations from "../locales/ko"

// Translation resources
const resources = {
  en: {
    translation: enTranslations,
  },
  mn: {
    translation: mnTranslations,
  },
  ko: {
    translation: koTranslations,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "mn", // Default language is Mongolian
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  })

export const ensureTranslation = () => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = i18n.language;
  }
  return i18n.language;
};

export default i18n
