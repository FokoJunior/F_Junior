"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Gamepad2,
  HardDrive,
  Image as ImageIcon,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  Users,
  XCircle,
} from "lucide-react"

import type { AdminBlobRow, AdminRoomRow, AdminScoreRow } from "@/app/api/admin/dashboard/route"
import { formatScore, gamesList, type GameId } from "@/lib/games"
import { cn } from "@/lib/utils"

type AdminTab = "overview" | "leaderboard" | "rooms" | "blobs" | "security"

interface DashboardPayload {
  services: { neon: boolean; blob: boolean; smtp: boolean }
  stats: {
    totalScores: number
    uniquePlayers: number
    activeRooms: number
    totalBlobs: number
  }
  leaderboard: AdminScoreRow[]
  rooms: AdminRoomRow[]
  blobs: AdminBlobRow[]
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

export default function AdminDashboard() {
  const [checking, setChecking] = useState(true)
  const [configured, setConfigured] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string>("")
  const [authStorage, setAuthStorage] = useState<string>("neon")

  // Login form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Security / Credentials update form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingCreds, setSavingCreds] = useState(false)
  const [credsFeedback, setCredsFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Dashboard state
  const [tab, setTab] = useState<AdminTab>("overview")
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [gameFilter, setGameFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const fetchDashboard = useCallback(async () => {
    setLoadingData(true)
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" })
      if (res.status === 401) {
        setAuthenticated(false)
        return
      }
      if (!res.ok) return
      const payload = (await res.json()) as DashboardPayload
      setData(payload)
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        setConfigured(Boolean(res.configured))
        setAuthenticated(Boolean(res.authenticated))
        if (res.email) {
          setAdminEmail(res.email)
          setNewEmail(res.email)
        }
        if (res.storage) setAuthStorage(res.storage)
        if (res.authenticated) fetchDashboard()
      })
      .finally(() => setChecking(false))
  }, [fetchDashboard])

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
        setAuthError(json.error || "Connexion refusée")
        return
      }
      setAuthenticated(true)
      if (json.email) {
        setAdminEmail(json.email)
        setNewEmail(json.email)
      }
      setPassword("")
      await fetchDashboard()
    } catch {
      setAuthError("Erreur réseau")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    setAuthenticated(false)
    setData(null)
  }

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setCredsFeedback(null)
    if (newPassword && newPassword !== confirmPassword) {
      setCredsFeedback({ type: "err", text: "Les deux nouveaux mots de passe ne correspondent pas." })
      return
    }
    setSavingCreds(true)
    try {
      const res = await fetch("/api/admin/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setCredsFeedback({ type: "err", text: json.error || "Erreur lors de la mise à jour." })
        return
      }
      if (json.email) {
        setAdminEmail(json.email)
        setNewEmail(json.email)
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setCredsFeedback({
        type: "ok",
        text: "Identifiants mis à jour dans Neon PostgreSQL (mot de passe hashé avec scrypt).",
      })
    } catch {
      setCredsFeedback({ type: "err", text: "Erreur réseau." })
    } finally {
      setSavingCreds(false)
    }
  }

  const adminDelete = async (key: string, body: Record<string, unknown>) => {
    setBusyKey(key)
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) await fetchDashboard()
    } finally {
      setBusyKey(null)
    }
  }

  const gameMap = useMemo(() => {
    const m: Record<string, (typeof gamesList)[number]> = {}
    for (const g of gamesList) m[g.id] = g
    return m
  }, [])

  const filteredScores = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.leaderboard.filter((row) => {
      if (gameFilter !== "all" && row.game !== gameFilter) return false
      if (q && !row.playerName.toLowerCase().includes(q) && !row.game.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [data, gameFilter, search])

  const countsByGame = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const row of data?.leaderboard ?? []) {
      counts[row.game] = (counts[row.game] || 0) + 1
    }
    return counts
  }, [data])

  if (checking) {
    return (
      <section className="container flex min-h-[75svh] items-center justify-center pt-24">
        <p className="eyebrow animate-pulse">Vérification de la session…</p>
    </section>
    )
  }

  // Login screen
  if (!authenticated) {
    return (
      <section className="container flex min-h-[82svh] items-center justify-center px-4 pb-16 pt-28">
        <div className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <p className="eyebrow">Espace privé · F_Junior</p>
          <h1 className="mt-1 font-serif text-4xl">
            Administration<span className="text-primary">.</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Connectez-vous pour gérer les classements Neon PostgreSQL, les salons Duo 1v1 et les avatars Vercel Blob.
          </p>

          {!configured && (
            <div className="mt-5 rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-xs leading-relaxed text-foreground">
              <p className="font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Configuration requise
              </p>
              <p className="mt-1.5 text-muted-foreground">
                Ajoutez <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">ADMIN_PASSWORD=votre_mot_de_passe</code> dans votre fichier <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">.env.local</code> (et sur Vercel) puis redémarrez le serveur.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-3.5">
            <div>
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
            </div>

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

            <button type="submit" disabled={submitting || !configured} className="btn btn-solid w-full">
              <ShieldCheck className="h-4 w-4" />
              {submitting ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
    </section>
    )
  }

  // Authenticated Dashboard
  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "leaderboard", label: "Classements", count: data?.stats.totalScores },
    { id: "rooms", label: "Salons Duo", count: data?.stats.activeRooms },
    { id: "blobs", label: "Avatars Blob", count: data?.stats.totalBlobs },
    { id: "security", label: "Sécurité / Compte" },
  ]

  return (
    <section className="mx-auto w-full max-w-[1440px] px-3 pb-24 pt-24 sm:px-6 sm:pt-28 lg:px-10">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-primary">Dashboard Administrateur</p>
          <h1 className="mt-1 font-serif text-4xl leading-none sm:text-6xl">
            Admin<span className="text-primary">.</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loadingData}
            className="btn btn-outline h-9 px-4 text-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loadingData && "animate-spin")} />
            Actualiser
          </button>
          <Link href="/jeux" className="btn btn-outline h-9 px-4 text-xs">
            <Gamepad2 className="h-3.5 w-3.5" />
            Voir /jeux
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline h-9 px-4 text-xs hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-4 sm:p-5">
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Scores enregistrés
          </p>
          <p className="mt-2 font-serif text-3xl tabular-nums sm:text-4xl">{data?.stats.totalScores ?? 0}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4 sm:p-5">
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            Joueurs uniques
          </p>
          <p className="mt-2 font-serif text-3xl tabular-nums sm:text-4xl">{data?.stats.uniquePlayers ?? 0}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4 sm:p-5">
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Gamepad2 className="h-3.5 w-3.5 text-primary" />
            Salons Duo 1v1
          </p>
          <p className="mt-2 font-serif text-3xl tabular-nums sm:text-4xl">{data?.stats.activeRooms ?? 0}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4 sm:p-5">
          <p className="eyebrow inline-flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-primary" />
            Avatars Blob
          </p>
          <p className="mt-2 font-serif text-3xl tabular-nums sm:text-4xl">{data?.stats.totalBlobs ?? 0}</p>
        </div>
      </div>

      {/* Navigation Tabs (horizontal swipe on mobile) */}
      <div className="mt-6 -mx-3 flex flex-nowrap gap-2 overflow-x-auto border-b border-border px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            data-active={tab === t.id}
            className="chip shrink-0"
          >
            {t.label}
            {typeof t.count === "number" && <span className="opacity-60">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {tab === "overview" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Services Health */}
          <div className="rounded-md border border-border bg-card p-5 lg:col-span-4">
            <p className="eyebrow mb-4">État des services</p>
            <div className="space-y-3">
              {[
                { label: "Neon PostgreSQL", ok: data?.services.neon, Icon: Database },
                { label: "Vercel Blob Storage", ok: data?.services.blob, Icon: HardDrive },
                { label: "Serveur SMTP Contact", ok: data?.services.smtp, Icon: Mail },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3"
                >
                  <span className="inline-flex items-center gap-2.5 text-sm font-medium">
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

          {/* Breakdown by game */}
          <div className="rounded-md border border-border bg-card p-5 lg:col-span-8">
            <p className="eyebrow mb-4">Activité par jeu ({gamesList.length} jeux)</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {gamesList.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGameFilter(g.id)
                    setTab("leaderboard")
                  }}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3.5 py-2.5 text-left transition-colors hover:border-primary"
                >
                  <span className="truncate text-sm font-medium">{g.title.fr}</span>
                  <span className="ml-2 shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary">
                    {countsByGame[g.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEADERBOARD MODERATION */}
      {tab === "leaderboard" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un joueur…"
                  className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">Tous les jeux ({data?.leaderboard.length ?? 0})</option>
                {gamesList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title.fr} ({countsByGame[g.id] ?? 0})
                  </option>
                ))}
              </select>
            </div>

            {gameFilter !== "all" && (countsByGame[gameFilter] ?? 0) > 0 && (
              <button
                type="button"
                disabled={busyKey === `clear-${gameFilter}`}
                onClick={() => {
                  if (window.confirm(`Vider tout le classement de "${gameMap[gameFilter]?.title.fr || gameFilter}" ?`)) {
                    adminDelete(`clear-${gameFilter}`, { type: "game_leaderboard", game: gameFilter })
                  }
                }}
                className="btn btn-outline h-10 px-4 text-xs hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vider ce classement
              </button>
            )}
          </div>

          {filteredScores.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Aucun score trouvé pour ce filtre.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredScores.map((row) => {
                const meta = gameMap[row.game as GameId]
                const key = `score-${row.game}-${row.entryId}`
                return (
                  <div
                    key={key}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {row.avatarUrl ? (
                        <img
                          src={row.avatarUrl}
                          alt={row.playerName}
                          className="h-8 w-8 shrink-0 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                          {row.playerName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                          <span className="truncate">{row.playerName}</span>
                          <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                            {meta ? meta.title.fr : row.game}
                          </span>
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {fmtDate(row.updatedAt)} · id:{(row.deviceHash || row.ipHash).slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {formatScore(row.score, meta?.scoreUnit, "fr")}
                      </span>
                      <button
                        type="button"
                        disabled={busyKey === key}
                        onClick={() => adminDelete(key, { type: "score", game: row.game, entryId: row.entryId })}
                        className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Supprimer ce score"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DUO ROOMS */}
      {tab === "rooms" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">Salons 1v1 stockés dans Neon PostgreSQL</p>
            <button
              type="button"
              disabled={busyKey === "prune"}
              onClick={() => adminDelete("prune", { type: "prune_rooms" })}
              className="btn btn-outline h-9 px-4 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Nettoyer les salons expirés (&gt; 6h)
            </button>
          </div>

          {!data || data.rooms.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Aucun salon Duo enregistré.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.rooms.map((room) => (
                <div
                  key={room.code}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold tracking-widest text-primary">
                        {room.code}
                      </span>
                      <span className="font-mono text-xs uppercase text-muted-foreground">{room.gameType}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase",
                          room.status === "playing" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                          room.status === "waiting" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                          room.status === "finished" && "bg-muted text-muted-foreground",
                        )}
                      >
                        {room.status}
                      </span>
                    </div>
                    <p className="truncate text-sm">
                      <strong>{room.hostName}</strong> ({room.hostWins}) vs{" "}
                      <strong>{room.guestName || "En attente…"}</strong> ({room.guestWins})
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">{fmtDate(room.updatedAt)}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Link
                      href={`/jeux?room=${room.code}`}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary"
                      aria-label="Ouvrir le salon"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      disabled={busyKey === `room-${room.code}`}
                      onClick={() => adminDelete(`room-${room.code}`, { type: "room", code: room.code })}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Supprimer le salon"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: VERCEL BLOB AVATARS */}
      {tab === "blobs" && (
        <div className="mt-6 space-y-4">
          <p className="eyebrow">Images stockées dans Vercel Blob (games/avatars/)</p>
          {!data || data.blobs.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Aucun avatar envoyé pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.blobs.map((blob) => (
                <div key={blob.url} className="overflow-hidden rounded-md border border-border bg-card">
                  <div className="aspect-square w-full overflow-hidden bg-muted/40">
                    <img src={blob.url} alt={blob.pathname} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {blob.pathname.split("/").pop()}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fmtBytes(blob.size)}</span>
                      <span>{fmtDate(blob.uploadedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <a
                        href={blob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline h-8 flex-1 px-2 text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ouvrir
                      </a>
                      <button
                        type="button"
                        disabled={busyKey === `blob-${blob.url}`}
                        onClick={() => adminDelete(`blob-${blob.url}`, { type: "blob", url: blob.url })}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Supprimer l'avatar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* TAB 5: SECURITY / ACCOUNT */}
      {tab === "security" && (
        <div className="mt-6 max-w-xl">
          <div className="rounded-md border border-border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <p className="eyebrow text-primary">Compte administrateur</p>
                <p className="mt-1 font-serif text-2xl">{adminEmail || "Administrateur"}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                <Database className="h-3 w-3" />
                {authStorage === "neon" ? "Neon PostgreSQL · scrypt" : "Env local"}
              </span>
            </div>

            <form onSubmit={handleUpdateCredentials} className="mt-5 space-y-4">
              <div>
                <label className="eyebrow mb-1.5 block">Email administrateur</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="eyebrow mb-1.5 block">Mot de passe actuel (requis)</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="eyebrow mb-1.5 block">Nouveau mot de passe (optionnel)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    placeholder="6 caractères min."
                    className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="eyebrow mb-1.5 block">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    placeholder="Répétez le mot de passe"
                    className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {credsFeedback && (
                <p
                  className={cn(
                    "rounded-md border px-3.5 py-2.5 text-xs",
                    credsFeedback.type === "ok"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-destructive/40 bg-destructive/10 text-destructive",
                  )}
                >
                  {credsFeedback.text}
                </p>
              )}

              <button type="submit" disabled={savingCreds} className="btn btn-solid w-full sm:w-auto">
                <ShieldCheck className="h-4 w-4" />
                {savingCreds ? "Enregistrement…" : "Enregistrer dans Neon"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
