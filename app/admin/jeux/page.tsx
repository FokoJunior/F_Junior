"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ExternalLink, RefreshCw, Search, Trash2 } from "lucide-react"

import type { AdminRoomRow, AdminScoreRow } from "@/app/api/admin/dashboard/route"
import { useConfirm } from "@/components/confirm-provider"
import { formatScore, gamesList, type GameId } from "@/lib/games"
import { cn } from "@/lib/utils"

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

export default function AdminGamesPage() {
  const confirm = useConfirm()
  const [subTab, setSubTab] = useState<"leaderboard" | "rooms">("leaderboard")
  const [scores, setScores] = useState<AdminScoreRow[]>([])
  const [rooms, setRooms] = useState<AdminRoomRow[]>([])
  const [loading, setLoading] = useState(true)
  const [gameFilter, setGameFilter] = useState("all")
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setScores(data.leaderboard || [])
      setRooms(data.rooms || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const adminDelete = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/dashboard", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) load()
  }

  const gameMap = useMemo(() => {
    const m: Record<string, (typeof gamesList)[number]> = {}
    for (const g of gamesList) m[g.id] = g
    return m
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return scores.filter((row) => {
      if (gameFilter !== "all" && row.game !== gameFilter) return false
      if (q && !row.playerName.toLowerCase().includes(q) && !row.game.toLowerCase().includes(q)) return false
      return true
    })
  }, [gameFilter, scores, search])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Module Jeux</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Jeux & Classements</h1>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn btn-outline h-9 px-4 text-xs">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Actualiser
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setSubTab("leaderboard")}
          data-active={subTab === "leaderboard"}
          className="chip"
        >
          Classements ({scores.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab("rooms")}
          data-active={subTab === "rooms"}
          className="chip"
        >
          Salons Duo 1v1 ({rooms.length})
        </button>
      </div>

      {subTab === "leaderboard" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un joueur…"
                  className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm"
                />
              </div>
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="all">Tous les jeux ({scores.length})</option>
                {gamesList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title.fr}
                  </option>
                ))}
              </select>
            </div>

            {gameFilter !== "all" && (
              <button
                type="button"
                onClick={async () => {
                  const ok = await confirm({
                    title: `Vider le classement de ${gameMap[gameFilter]?.title.fr} ?`,
                    description: "Tous les scores enregistrés pour ce jeu seront définitivement effacés.",
                    confirmLabel: "Vider le classement",
                    variant: "danger",
                  })
                  if (ok) adminDelete({ type: "game_leaderboard", game: gameFilter })
                }}
                className="btn btn-outline h-10 px-4 text-xs hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vider ce classement
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Aucun score enregistré pour ce filtre.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((row) => {
                const meta = gameMap[row.game as GameId]
                return (
                  <div
                    key={`${row.game}-${row.entryId}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {row.avatarUrl ? (
                        <img
                          src={row.avatarUrl}
                          alt={row.playerName}
                          className="h-8 w-8 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                          {row.playerName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                          <span>{row.playerName}</span>
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
                        onClick={() => adminDelete({ type: "score", game: row.game, entryId: row.entryId })}
                        className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                        aria-label="Supprimer"
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
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => adminDelete({ type: "prune_rooms" })}
              className="btn btn-outline h-9 px-4 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Nettoyer les salons expirés (&gt; 6h)
            </button>
          </div>
          {rooms.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Aucun salon Duo enregistré.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {rooms.map((room) => (
                <div
                  key={room.code}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                        {room.code}
                      </span>
                      <span className="font-mono text-xs uppercase text-muted-foreground">{room.gameType}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase">
                        {room.status}
                      </span>
                    </div>
                    <p className="truncate text-sm">
                      <strong>{room.hostName}</strong> ({room.hostWins}) vs{" "}
                      <strong>{room.guestName || "En attente…"}</strong> ({room.guestWins})
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">{fmtDate(room.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/jeux?room=${room.code}`}
                      target="_blank"
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => adminDelete({ type: "room", code: room.code })}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
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
    </div>
  )
}
