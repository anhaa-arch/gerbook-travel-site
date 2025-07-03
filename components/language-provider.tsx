"use client"

import { type ReactNode, useEffect } from "react"
import { ensureTranslation } from "@/lib/i18n"

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Ensure the document language is set correctly on mount
  useEffect(() => {
    ensureTranslation()
  }, [])

  return <>{children}</>
}
