import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import Navbar from "@/components/navbar"
import CursorFollower from "@/components/cursor-follower"
import { FloatingButtonsProvider } from "@/components/floating-buttons-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  metadataBase: new URL("https://fokojunior.com"), // Remplacez par votre domaine réel si différent
  title: {
    default: "F_Junior | Développeur Full Stack & IA",
    template: "%s | F_Junior Portfolio",
  },
  description:
    "Portfolio de FOKO TADJUIGE B. JUNIOR (F_Junior), étudiant en Génie Logiciel passionné par le développement Full Stack (Next.js, React, Node.js) et l'Intelligence Artificielle.",
  keywords: [
    "F_Junior",
    "Foko Junior",
    "Développeur Full Stack",
    "Génie Logiciel",
    "Intelligence Artificielle",
    "Next.js",
    "React",
    "Portfolio Développeur",
    "Cameroun",
    "Tailwind CSS",
  ],
  authors: [{ name: "F_Junior", url: "https://github.com/FokoJunior" }],
  creator: "F_Junior",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://fokojunior.com",
    title: "F_Junior | Développeur Full Stack & IA",
    description: "Découvrez mes projets et compétences en développement web et intelligence artificielle.",
    siteName: "F_Junior Portfolio",
    images: [
      {
        url: "/og-image.png", // Assurez-vous d'avoir une image à ce chemin
        width: 1200,
        height: 630,
        alt: "F_Junior Portfolio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "F_Junior | Développeur Full Stack & IA",
    description: "Portfolio de FOKO TADJUIGE B. JUNIOR. Projets Web & IA.",
    images: ["/og-image.png"],
    creator: "@FokoJunior", // À ajuster si vous avez un handle Twitter
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
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <FloatingButtonsProvider>
              <Navbar />
              <CursorFollower />
              {children}
            </FloatingButtonsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'