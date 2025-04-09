"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Github, Mail, Menu, Moon, Sun, Globe, X, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/hooks/use-toast"

const navLinks = [
  { href: "/", label: "home" },
  { href: "/#about", label: "about" },
  { href: "/#skills", label: "skills" },
  { href: "/#projects", label: "projets" },
  { href: "/projects", label: "myProjects" },
  { href: "/#contact", label: "contact" },
  { href: "/blog", label: "blog" },
  { href: "/resume", label: "resume" },
]

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { t, setLanguage, language } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)

    // Check if dark mode is stored in localStorage
    const storedDarkMode = localStorage.getItem("darkMode")

    // Check system preference
    const isDark =
      storedDarkMode === "true" ||
      (storedDarkMode === null && window.matchMedia("(prefers-color-scheme: dark)").matches)

    setDarkMode(isDark)

    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Store preference in localStorage
    localStorage.setItem("darkMode", newDarkMode.toString())
  }

  const handleDownloadCV = () => {
    // URL vers le fichier CV (à remplacer par l'URL réelle)
    const cvUrl = "/CV_FOKO_JUNIOR.pdf"

    // Créer un élément a temporaire
    const link = document.createElement("a")
    link.href = cvUrl
    link.setAttribute("download", "CV_FOKO_JUNIOR.pdf")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Téléchargement démarré",
      description: "Votre téléchargement a commencé.",
    })

    // Fermer le menu mobile si ouvert
    setIsMenuOpen(false)
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    if (href.startsWith("/#")) {
      return pathname === "/" && href.includes(window.location.hash)
    }
    return pathname.startsWith(href)
  }

  const handleNavLinkClick = (href: string) => {
    // Fermer le menu mobile si ouvert
    setIsMenuOpen(false)
  }

  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "zh", label: "中文" },
  ]

  // Ne pas rendre sur le serveur
  if (!isMounted) {
    return <div className="h-16 border-b"></div>
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
        scrolled ? "bg-background/95 shadow-sm" : "bg-background/50"
      } transition-all duration-200`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="font-bold">
          <Link href="/" className="text-xl group">
            <motion.span
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              F_Junior
            </motion.span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href) ? "text-primary" : ""
              }`}
              onClick={() => handleNavLinkClick(link.href)}
            >
              {t(link.label)}
              {isActive(link.href) && <motion.div className="h-0.5 bg-primary mt-0.5" layoutId="navbar-indicator" />}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? "bg-muted" : ""}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="mr-2">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link
            href="https://github.com/FokoJunior"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex"
          >
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>

          <Link href="mailto:benitojunior2022@gmail.com" className="hidden md:inline-flex">
            <Button variant="ghost" size="icon">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={handleDownloadCV} className="hidden md:inline-flex gap-1">
            <Download className="h-4 w-4" />
            {t("downloadCV")}
          </Button>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      isActive(link.href) ? "text-primary" : ""
                    }`}
                    onClick={() => handleNavLinkClick(link.href)}
                  >
                    {t(link.label)}
                  </Link>
                ))}
                <Button
                  variant="outline"
                  onClick={handleDownloadCV}
                  className="mt-4 w-full flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t("downloadCV")}
                </Button>
                <div className="flex gap-4 mt-4 justify-center">
                  <Link href="https://github.com/FokoJunior" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon">
                      <Github className="h-5 w-5" />
                      <span className="sr-only">GitHub</span>
                    </Button>
                  </Link>
                  <Link href="mailto:benitojunior2022@gmail.com">
                    <Button variant="ghost" size="icon">
                      <Mail className="h-5 w-5" />
                      <span className="sr-only">Email</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
