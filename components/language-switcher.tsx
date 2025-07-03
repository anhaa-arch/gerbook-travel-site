"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { ensureTranslation } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  const languages = [
    { code: "mn", name: "Монгол", flag: "🇲🇳" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
  ]

  // Ensure language is properly set on component mount
  useEffect(() => {
    const lang = ensureTranslation()
    setCurrentLanguage(lang)
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    setCurrentLanguage(languageCode)
    ensureTranslation()
  }

  const currentLang = languages.find((lang) => lang.code === currentLanguage) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="font-medium hover:bg-gray-50 transition-colors rounded-md"
          aria-label="Select language"
        >
          <span className="flex items-center">
            <span className="mr-1.5 text-lg">{currentLang.flag || '🏳️'}</span>
            <span>{currentLang.name}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-sans min-w-[160px] p-1">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`font-medium cursor-pointer rounded-md transition-colors px-3 py-2 ${
              currentLanguage === language.code
                ? "bg-emerald-50 text-emerald-700"
                : "hover:bg-gray-50 hover:text-emerald-600"
            }`}
          >
            <span className="mr-3 text-lg">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
