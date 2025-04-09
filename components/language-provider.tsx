"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations } from "@/lib/translations"

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => any
}

const LanguageContext = createContext<LanguageContextType>({
  language: "fr",
  setLanguage: () => {},
  t: () => "",
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("fr")

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Get browser language
    const browserLang = navigator.language.split("-")[0]
    if (["fr", "en", "de", "zh"].includes(browserLang)) {
      setLanguage(browserLang)
    }

    // Check localStorage
    const savedLang = localStorage.getItem("language")
    if (savedLang && ["fr", "en", "de", "zh"].includes(savedLang)) {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key]
    }

    // Fallback to French
    if (translations.fr && translations.fr[key]) {
      return translations.fr[key]
    }

    return key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
