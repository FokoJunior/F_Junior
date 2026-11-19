"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  Gamepad2,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface AdminSessionContextValue {
  adminEmail: string
  authStorage: string
  setAdminEmail: (email: string) => void
}

const AdminSessionContext = createContext<AdminSessionContextValue>({
  adminEmail: "",
  authStorage: "neon",
  setAdminEmail: () => {},
})

export function useAdminSession() {
  return useContext(AdminSessionContext)
}

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", Icon: LayoutDashboard, exact: true },
  { href: "/admin/projets", label: "Projets", Icon: FolderKanban },
  { href: "/admin/blog", label: "Blog", Icon: FileText },
  { href: "/admin/jeux", label: "Jeux & Scores", Icon: Gamepad2 },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
  { href: "/admin/medias", label: "Médias Blob", Icon: ImageIcon },
  { href: "/admin/securite", label: "Sécurité", Icon: ShieldCheck },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auth state
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [authStorage, setAuthStorage] = useState("neon")

  // Login form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        setAuthenticated(Boolean(res.authenticated))
        if (res.email) setAdminEmail(res.email)
        if (res.storage) setAuthStorage(res.storage)
      })
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setAuthError(null)
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setAuthError(json.error || "Email ou mot de passe incorrect")
        return
      }
      setAuthenticated(true)
      if (json.email) setAdminEmail(json.email)
      setPassword("")
    } catch {
      setAuthError("Erreur réseau")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    setAuthenticated(false)
    setAdminEmail("")
  }

  const isDark = mounted && resolvedTheme === "dark"
  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname?.startsWith(item.href) ?? false
  const currentItem = NAV_ITEMS.find((item) => isActive(item)) ?? NAV_ITEMS[0]

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="eyebrow animate-pulse">Chargement du panel admin…</p>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <Link href="/" className="mb-8 font-serif text-3xl tracking-tight">
          F<span className="text-primary">_</span>Junior
        </Link>

        <div className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <p className="eyebrow">Back-office · Administration</p>
          <h1 className="mt-1 font-serif text-4xl">
            Connexion<span className="text-primary">.</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Connectez-vous pour administrer vos projets, articles de blog, jeux, messages et médias.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-3.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email administrateur"
              autoComplete="email"
              required
              autoFocus
              className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />

            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                autoComplete="current-password"
                required
                className="h-11 w-full rounded-md border border-input bg-background pl-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Afficher le mot de passe"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {authError && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2 text-xs text-destructive">
                {authError}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn btn-solid w-full">
              <ShieldCheck className="h-4 w-4" />
              {submitting ? "Connexion…" : "Accéder au panel"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-card">
      <div>
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="font-serif text-2xl leading-none tracking-tight">
              F<span className="text-primary">_</span>Junior
            </span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modules nav */}
        <nav className="space-y-1 p-3" aria-label="Modules admin">
          <p className="eyebrow px-3 pb-1.5 pt-2">Modules</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.Icon
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Sidebar footer */}
      <div className="space-y-2 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <span>Voir le portfolio</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )

  return (
    <AdminSessionContext.Provider value={{ adminEmail, authStorage, setAdminEmail }}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop fixed sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block">
          {sidebarContent}
        </aside>

        {/* Mobile slide-over drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative z-10 w-72 max-w-[85vw] border-r border-border shadow-xl">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Right side: Sticky Top Navbar + Page Content */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground lg:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="eyebrow hidden sm:block">Admin / {currentItem.label}</p>
                <p className="font-serif text-xl leading-none sm:text-2xl">{currentItem.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Changer de thème"
              >
                {mounted ? isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" /> : <span className="h-4 w-4" />}
              </button>

              <Link
                href="/jeux"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-3.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground sm:inline-flex"
              >
                <Gamepad2 className="h-3.5 w-3.5 text-primary" />
                /jeux
              </Link>

              {adminEmail && (
                <Link
                  href="/admin/securite"
                  className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground md:inline-flex"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {adminEmail.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="max-w-[160px] truncate">{adminEmail}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                aria-label="Déconnexion"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </AdminSessionContext.Provider>
  )
}
