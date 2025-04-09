import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import Navbar from "@/components/navbar"
import CursorFollower from "@/components/cursor-follower"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "F_Junior | Développeur Full Stack",
  description: "Portfolio de FOKO TADJUIGE B. JUNIOR, développeur Full Stack et étudiant en Génie Logiciel",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <Navbar />
            <CursorFollower />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'