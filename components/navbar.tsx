"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useTheme } from "next-themes"
import { ArrowUpRight, Check, Moon, Sun } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LANGUAGES, useLanguage } from "@/components/language-provider"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/#about", label: "about" },
  { href: "/#skills", label: "skills" },
  { href: "/projects", label: "work" },
  { href: "/resume", label: "resume" },
  { href: "/blog", label: "blog" },
]

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif tracking-tight", className)}>
      F<span className="text-primary">_</span>Junior
    </span>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const { t, setLanguage, language } = useLanguage()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const isActive = (href: string) => !href.startsWith("/#") && pathname.startsWith(href)
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        {t("skipToContent")}
      </a>
      <header
        className={cn(
          "no-print fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || open
            ? "border-b border-border bg-background/85 backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link href="/" className="text-2xl leading-none" aria-label={t("homeLink")}>
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label={t("mainNav")}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "link-underline text-sm transition-colors",
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-9 rounded-full px-3 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                aria-label={t("changeLanguage")}
              >
                {language}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[9rem]">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="flex justify-between"
                  >
                    {lang.label}
                    {language === lang.code && <Check className="h-3.5 w-3.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("toggleTheme")}
            >
              {mounted ? isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" /> : <span className="h-4 w-4" />}
            </button>

            <Link href="/#contact" className="btn btn-solid ml-2 hidden h-9 px-4 md:inline-flex">
              {t("contactMe")}
              <ArrowUpRight />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="ml-1 grid h-9 w-9 place-items-center lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t("close") : t("menu")}
            >
              <span className="relative block h-3 w-5">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-px w-full bg-foreground transition-transform duration-300",
                    open && "translate-y-1.5 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-px w-full bg-foreground transition-transform duration-300",
                    open && "-translate-y-1.5 -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col bg-background pt-16 lg:hidden"
          >
            <nav className="container flex flex-1 flex-col justify-center gap-1" aria-label={t("mobileNav")}>
              {[...navLinks, { href: "/#contact", label: "contact" }].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-border py-4"
                  >
                    <span className="font-mono text-xs text-primary">0{i + 1}</span>
                    <span className="font-serif text-4xl">{t(link.label)}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="container flex flex-wrap items-center justify-between gap-4 pb-10 pt-6">
              <a href={`mailto:${site.email}`} className="text-sm text-muted-foreground">
                {site.email}
              </a>
              <a href={site.cv} download className="btn btn-outline h-9 px-4">
                {t("downloadCV")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
