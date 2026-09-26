"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations } from "@/lib/translations"

export const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
]

const SUPPORTED = LANGUAGES.map((l) => l.code)

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
    const browserLang = navigator.language.split("-")[0]
    if (SUPPORTED.includes(browserLang)) {
      setLanguage(browserLang)
    }

    try {
      const savedLang = localStorage.getItem("language")
      if (savedLang && SUPPORTED.includes(savedLang)) {
        setLanguage(savedLang)
      }
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    try {
      localStorage.setItem("language", lang)
    } catch {}
  }

  const t = (key: string) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key]
    }

    // Repli sur le français
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
