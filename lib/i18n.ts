export type Lang = "fr" | "en" | "de" | "zh"

/** Texte traduit ; le français sert de repli. */
export type T = { fr: string; en: string; de: string; zh: string }

export function tr(value: T | string | undefined, lang: string): string {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[lang as Lang] || value.fr
}
