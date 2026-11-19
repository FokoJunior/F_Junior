import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { isAdminRequest } from "@/lib/admin-auth"
import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export interface AdminPlayerRow {
  playerKey: string
  playerName: string
  ipHash: string | null
  deviceHash: string | null
  avatarUrl: string | null
  banned: boolean
  notes: string | null
  gamesCount: number
  games: string[]
  lastSeen: string
}

function sanitizeName(raw: string): string {
  return raw
    .replace(/[<>"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24)
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ players: [] })
  }

  try {
    await ensureGamesSchema()
    const sql = getSql()

    // Backfill any players from game_leaderboard that aren't in game_players yet
    await sql`
      INSERT INTO game_players (player_key, player_name, ip_hash, device_hash, avatar_url, last_seen)
      SELECT DISTINCT ON (entry_id)
        entry_id,
        player_name,
        ip_hash,
        device_hash,
        avatar_url,
        updated_at
      FROM game_leaderboard
      ORDER BY entry_id, updated_at DESC
      ON CONFLICT (player_key) DO NOTHING
    `

    const rows = await sql`
      SELECT
        p.player_key,
        p.player_name,
        p.ip_hash,
        p.device_hash,
        p.avatar_url,
        p.banned,
        p.notes,
        p.last_seen,
        COALESCE(COUNT(l.game)::int, 0) AS games_count,
        COALESCE(ARRAY_AGG(l.game) FILTER (WHERE l.game IS NOT NULL), ARRAY[]::text[]) AS games
      FROM game_players p
      LEFT JOIN game_leaderboard l ON l.entry_id = p.player_key
      GROUP BY p.player_key
      ORDER BY p.last_seen DESC
      LIMIT 200
    `

    const players: AdminPlayerRow[] = rows.map((r) => ({
      playerKey: String(r.player_key),
      playerName: String(r.player_name),
      ipHash: r.ip_hash ? String(r.ip_hash) : null,
      deviceHash: r.device_hash ? String(r.device_hash) : null,
      avatarUrl: r.avatar_url ? String(r.avatar_url) : null,
      banned: Boolean(r.banned),
      notes: r.notes ? String(r.notes) : null,
      gamesCount: Number(r.games_count ?? 0),
      games: Array.isArray(r.games) ? (r.games as string[]) : [],
      lastSeen: new Date(r.last_seen as string | Date).toISOString(),
    }))

    return NextResponse.json({ players })
  } catch (err) {
    console.error("Admin players GET error:", err)
    return NextResponse.json({ error: "Erreur lecture joueurs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Neon non configuré" }, { status: 503 })
  }

  try {
    const body = await request.json()
    const name = sanitizeName(typeof body?.playerName === "string" ? body.playerName : "")
    const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 300) : null
    const avatarUrl =
      typeof body?.avatarUrl === "string" && body.avatarUrl.trim().startsWith("https://")
        ? body.avatarUrl.trim().slice(0, 512)
        : null

    if (name.length < 2) {
      return NextResponse.json({ error: "Nom requis (2 caractères min.)" }, { status: 400 })
    }

    const playerKey = `manual:${crypto.randomBytes(6).toString("hex")}`
    await ensureGamesSchema()
    const sql = getSql()
    await sql`
      INSERT INTO game_players (player_key, player_name, avatar_url, notes, last_seen)
      VALUES (${playerKey}, ${name}, ${avatarUrl}, ${notes}, NOW())
    `

    return NextResponse.json({ ok: true, playerKey })
  } catch {
    return NextResponse.json({ error: "Erreur création joueur" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Neon non configuré" }, { status: 503 })
  }

  try {
    const body = await request.json()
    const playerKey = typeof body?.playerKey === "string" ? body.playerKey.trim() : ""
    if (!playerKey) {
      return NextResponse.json({ error: "playerKey requis" }, { status: 400 })
    }

    await ensureGamesSchema()
    const sql = getSql()

    const existing = await sql`SELECT * FROM game_players WHERE player_key = ${playerKey} LIMIT 1`
    if (existing.length === 0) {
      return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 })
    }

    const curr = existing[0]
    const nextName =
      typeof body?.playerName === "string" && sanitizeName(body.playerName).length >= 2
        ? sanitizeName(body.playerName)
        : String(curr.player_name)
    const nextBanned = typeof body?.banned === "boolean" ? body.banned : Boolean(curr.banned)
    const nextNotes =
      typeof body?.notes === "string"
        ? body.notes.trim().slice(0, 300) || null
        : curr.notes
          ? String(curr.notes)
          : null
    const nextAvatar =
      body?.avatarUrl === null
        ? null
        : typeof body?.avatarUrl === "string" && body.avatarUrl.trim().startsWith("https://")
          ? body.avatarUrl.trim().slice(0, 512)
          : curr.avatar_url
            ? String(curr.avatar_url)
            : null

    await sql`
      UPDATE game_players
      SET
        player_name = ${nextName},
        banned = ${nextBanned},
        notes = ${nextNotes},
        avatar_url = ${nextAvatar}
      WHERE player_key = ${playerKey}
    `

    // Sync renamed player / avatar across all leaderboard rows
    await sql`
      UPDATE game_leaderboard
      SET player_name = ${nextName}, avatar_url = ${nextAvatar}
      WHERE entry_id = ${playerKey}
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Admin players PATCH error:", err)
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Neon non configuré" }, { status: 503 })
  }

  try {
    const body = await request.json()
    const playerKey = typeof body?.playerKey === "string" ? body.playerKey.trim() : ""
    if (!playerKey) {
      return NextResponse.json({ error: "playerKey requis" }, { status: 400 })
    }

    await ensureGamesSchema()
    const sql = getSql()
    await sql`DELETE FROM game_leaderboard WHERE entry_id = ${playerKey}`
    await sql`DELETE FROM game_players WHERE player_key = ${playerKey}`

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 })
  }
}
