import type React from "react"
import type { Metadata, Viewport } from "next"
import "@/app/globals.css"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import Navbar from "@/components/navbar"
import SiteFooter from "@/components/site-footer"
import ChatButton from "@/components/chat-button"
import { Toaster } from "@/components/ui/toaster"
import { SITE_URL, defaultDescription, defaultTitle, keywords } from "@/lib/seo"

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
})

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#10100e" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: "%s | Foko Junior (F_Junior)",
  },
  description: defaultDescription,
  applicationName: "Foko Junior — Portfolio",
  keywords,
  authors: [{ name: "Foko Junior (FOKO TADJUIGE Benoît Junior)", url: SITE_URL }],
  creator: "Foko Junior",
  publisher: "Foko Junior",
  category: "technology",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "profile",
    firstName: "Junior Benoît",
    lastName: "FOKO TADJUIGE",
    username: "FokoJunior",
    locale: "fr_FR",
    alternateLocale: ["en_US", "de_DE", "zh_CN"],
    url: SITE_URL,
    siteName: "Foko Junior — Portfolio",
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    creator: "@FokoJunior",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body id="top" className="grain min-h-screen font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
            >
              Aller au contenu
            </a>
            <Navbar />
            <main id="main">{children}</main>
            <SiteFooter />
            <ChatButton />
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
