"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  CheckCircle2,
  Database,
  FileText,
  FolderKanban,
  Gamepad2,
  HardDrive,
  Image as ImageIcon,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Users,
  XCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface OverviewStats {
  services: { neon: boolean; blob: boolean; smtp: boolean }
  scores: number
  uniquePlayers: number
  rooms: number
  blobs: number
  projectsTotal: number
  postsTotal: number
  messagesTotal: number
  unreadMessages: number
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [dashRes, projRes, blogRes, msgRes] = await Promise.all([
        fetch("/api/admin/dashboard", { cache: "no-store" }),
        fetch("/api/admin/projects", { cache: "no-store" }),
        fetch("/api/admin/blog", { cache: "no-store" }),
        fetch("/api/admin/messages", { cache: "no-store" }),
      ])
      const [dash, proj, blog, msg] = await Promise.all([
        dashRes.ok ? dashRes.json() : null,
        projRes.ok ? projRes.json() : null,
        blogRes.ok ? blogRes.json() : null,
        msgRes.ok ? msgRes.json() : null,
      ])

      setStats({
        services: dash?.services ?? { neon: false, blob: false, smtp: false },
        scores: dash?.stats?.totalScores ?? 0,
        uniquePlayers: dash?.stats?.uniquePlayers ?? 0,
        rooms: dash?.stats?.activeRooms ?? 0,
        blobs: dash?.stats?.totalBlobs ?? 0,
        projectsTotal: proj?.total ?? 0,
        postsTotal: blog?.total ?? 0,
        messagesTotal: msg?.messages?.length ?? 0,
        unreadMessages: msg?.unreadCount ?? 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const kpis = [
    { label: "Projets", value: stats?.projectsTotal ?? 0, href: "/admin/projets", Icon: FolderKanban },
    { label: "Articles Blog", value: stats?.postsTotal ?? 0, href: "/admin/blog", Icon: FileText },
    {
      label: "Messages",
      value: stats?.messagesTotal ?? 0,
      sub: stats?.unreadMessages ? `${stats.unreadMessages} non lu(s)` : undefined,
      href: "/admin/messages",
      Icon: Mail,
    },
    { label: "Scores Jeux", value: stats?.scores ?? 0, href: "/admin/jeux", Icon: Trophy },
    { label: "Joueurs uniques", value: stats?.uniquePlayers ?? 0, href: "/admin/jeux", Icon: Users },
    { label: "Médias Blob", value: stats?.blobs ?? 0, href: "/admin/medias", Icon: ImageIcon },
  ]

  const modules = [
    {
      href: "/admin/projets",
      title: "Projets",
      desc: "Gérez votre catalogue de projets et ajoutez de nouvelles réalisations avec couverture Vercel Blob.",
      Icon: FolderKanban,
    },
    {
      href: "/admin/blog",
      title: "Blog",
      desc: "Rédigez, publiez ou passez en brouillon vos articles techniques en Markdown.",
      Icon: FileText,
    },
    {
      href: "/admin/jeux",
      title: "Jeux & Classements",
      desc: "Modérez les scores des 15 jeux sur Neon PostgreSQL et supervisez les salons Duo 1v1.",
      Icon: Gamepad2,
    },
    {
      href: "/admin/messages",
      title: "Messages Contact",
      desc: "Consultez les messages envoyés depuis le formulaire du portfolio et répondez rapidement.",
      Icon: Mail,
    },
    {
      href: "/admin/medias",
      title: "Médias Vercel Blob",
      desc: "Uploadez des images, copiez leurs URLs publiques et nettoyez les fichiers inutilisés.",
      Icon: ImageIcon,
    },
    {
      href: "/admin/securite",
      title: "Sécurité & Compte",
      desc: "Modifiez votre email et votre mot de passe administrateur stockés dans Neon (scrypt).",
      Icon: ShieldCheck,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Tableau de bord</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Vue d&apos;ensemble</h1>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn btn-outline h-9 px-4 text-xs">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => {
          const Icon = k.Icon
          return (
            <Link
              key={k.label}
              href={k.href}
              className="group rounded-md border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-primary" />
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-3 font-serif text-3xl tabular-nums">{k.value}</p>
              <p className="eyebrow mt-1 truncate">{k.label}</p>
              {k.sub && <p className="mt-1 font-mono text-[10px] text-primary">{k.sub}</p>}
            </Link>
          )
        })}
      </div>

      {/* Services status */}
      <div className="rounded-md border border-border bg-card p-5">
        <p className="eyebrow mb-3">Infrastructure connectée</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Neon PostgreSQL", ok: stats?.services.neon, Icon: Database },
            { label: "Vercel Blob Storage", ok: stats?.services.blob, Icon: HardDrive },
            { label: "Serveur SMTP", ok: stats?.services.smtp, Icon: Mail },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <s.Icon className="h-4 w-4 text-primary" />
                {s.label}
              </span>
              {s.ok ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Actif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  <XCircle className="h-3.5 w-3.5" /> Inactif
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modules grid */}
      <div>
        <p className="eyebrow mb-3">Modules d&apos;administration</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const Icon = m.Icon
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group flex flex-col justify-between rounded-md border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-md border border-border bg-background text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <h2 className="mt-4 font-serif text-2xl group-hover:text-primary">{m.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
