"use client"

import type React from "react"
import { usePathname } from "next/navigation"

import Navbar from "@/components/navbar"
import SiteFooter from "@/components/site-footer"
import ChatButton from "@/components/chat-button"

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return <main id="main">{children}</main>
  }

  return (
    <>
      <Navbar />
      <main id="main">{children}</main>
      <SiteFooter />
      <ChatButton />
    </>
  )
}
