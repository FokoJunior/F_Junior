"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Ban,
  Check,
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react"

import type { AdminPlayerRow } from "@/app/api/admin/players/route"
import { useConfirm } from "@/components/confirm-provider"
import { gamesList } from "@/lib/games"
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

export default function AdminPlayersPage() {
  const confirm = useConfirm()
  const [players, setPlayers] = useState<AdminPlayerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all")

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inline edit state
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editNotes, setEditNotes] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/players", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setPlayers(data.players || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const gameTitleMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const g of gamesList) m[g.id] = g.title.fr
    return m
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return players.filter((p) => {
      if (statusFilter === "active" && p.banned) return false
      if (statusFilter === "banned" && !p.banned) return false
      if (
        q &&
        !p.playerName.toLowerCase().includes(q) &&
        !(p.notes || "").toLowerCase().includes(q) &&
        !p.playerKey.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [players, search, statusFilter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: newName, notes: newNotes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur")
        return
      }
      setNewName("")
      setNewNotes("")
      setShowCreate(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (p: AdminPlayerRow) => {
    setEditingKey(p.playerKey)
    setEditName(p.playerName)
    setEditNotes(p.notes || "")
  }

  const saveEdit = async (playerKey: string) => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/players", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerKey, playerName: editName, notes: editNotes }),
      })
      if (res.ok) {
        setEditingKey(null)
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleBan = async (p: AdminPlayerRow) => {
    const res = await fetch("/api/admin/players", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerKey: p.playerKey, banned: !p.banned }),
    })
    if (res.ok) load()
  }

  const handleDelete = async (p: AdminPlayerRow) => {
    const ok = await confirm({
      title: `Supprimer ${p.playerName} ?`,
      description: `Ce profil joueur ainsi que ses ${p.gamesCount} score(s) enregistrés seront définitivement supprimés.`,
      confirmLabel: "Supprimer le joueur",
      variant: "danger",
    })
    if (!ok) return
    const res = await fetch("/api/admin/players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerKey: p.playerKey }),
    })
    if (res.ok) load()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Module Joueurs · CRUD</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Joueurs ({players.length})</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} disabled={loading} className="btn btn-outline h-10 px-4 text-xs">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Actualiser
          </button>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="btn btn-solid h-10 px-5 text-xs"
          >
            <Plus className="h-4 w-4" />
            {showCreate ? "Fermer" : "Nouveau joueur"}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="space-y-4 rounded-md border border-primary/30 bg-card p-5">
          <p className="eyebrow text-primary">Créer un profil joueur dans Neon</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="eyebrow mb-1.5 block">Pseudo *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                minLength={2}
                maxLength={24}
                placeholder="Ex : Junior_237"
                className="h-10 w-full rounded-md border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">Note admin (optionnel)</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Ex : Joueur VIP, ami…"
                className="h-10 w-full rounded-md border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button type="submit" disabled={saving} className="btn btn-solid h-9 px-5 text-xs">
            {saving ? "Création…" : "Créer le joueur"}
          </button>
        </form>
      )}

      {/* Search & Status filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, note ou ID…"
            className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "active", "banned"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              data-active={statusFilter === st}
              className="chip"
            >
              {st === "all" ? "Tous" : st === "active" ? "Actifs" : "Bannis"}
            </button>
          ))}
        </div>
      </div>

      {/* Players list */}
      {loading ? (
        <p className="eyebrow animate-pulse">Chargement des joueurs…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
          Aucun joueur trouvé.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const isEditing = editingKey === p.playerKey
            return (
              <div
                key={p.playerKey}
                className={cn(
                  "rounded-md border p-4 transition-colors",
                  p.banned ? "border-destructive/40 bg-destructive/5" : "border-border bg-card",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.playerName}
                        className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">
                        {p.playerName.slice(0, 2).toUpperCase()}
                      </span>
                    )}

                    <div className="min-w-0 flex-1 space-y-1.5">
                      {isEditing ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            minLength={2}
                            maxLength={24}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            placeholder="Nouveau nom"
                          />
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            placeholder="Note admin"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-serif text-2xl leading-none">{p.playerName}</p>
                            {p.banned ? (
                              <span className="rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[10px] uppercase text-destructive">
                                Banni
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-600 dark:text-emerald-400">
                                Actif
                              </span>
                            )}
                            <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {p.gamesCount} jeu(x)
                            </span>
                          </div>
                          {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                          <p className="font-mono text-[11px] text-muted-foreground">
                            Vu le {fmtDate(p.lastSeen)} · clé: {p.playerKey.slice(0, 18)}
                          </p>
                          {p.games.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {p.games.map((g) => (
                                <span
                                  key={g}
                                  className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                                >
                                  {gameTitleMap[g] || g}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* CRUD Action Buttons */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => saveEdit(p.playerKey)}
                          className="btn btn-solid h-8 px-3 text-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary"
                          title="Modifier le nom / note"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleBan(p)}
                          className={cn(
                            "grid h-8 w-8 place-items-center rounded-md border border-border transition-colors",
                            p.banned
                              ? "text-emerald-500 hover:border-emerald-500"
                              : "text-muted-foreground hover:border-amber-500 hover:text-amber-500",
                          )}
                          title={p.banned ? "Débannir" : "Bannir"}
                        >
                          {p.banned ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                          title="Supprimer le joueur et ses scores"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
