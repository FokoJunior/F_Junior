import { del, list } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

import { isAdminRequest } from "@/lib/admin-auth"
import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export interface AdminScoreRow {
  game: string
  entryId: string
  playerName: string
  score: number
  ipHash: string
  deviceHash: string | null
  avatarUrl: string | null
  updatedAt: string
}

export interface AdminRoomRow {
  code: string
  gameType: string
  status: string
  hostName: string
  guestName: string | null
  hostWins: number
  guestWins: number
  updatedAt: string
}

export interface AdminBlobRow {
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const services = {
    neon: hasDatabase(),
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    smtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
  }

  let leaderboard: AdminScoreRow[] = []
  let rooms: AdminRoomRow[] = []
  let blobs: AdminBlobRow[] = []
  let uniquePlayers = 0

  if (services.neon) {
    try {
      await ensureGamesSchema()
      const sql = getSql()

      const [scoreRows, uniqueRows, roomRows] = await Promise.all([
        sql`
          SELECT game, entry_id, player_name, score, ip_hash, device_hash, avatar_url, updated_at
          FROM game_leaderboard
          ORDER BY updated_at DESC
          LIMIT 250
        `,
        sql`
          SELECT COUNT(DISTINCT COALESCE(device_hash, ip_hash))::int AS total
          FROM game_leaderboard
        `,
        sql`
          SELECT code, game_type, state, updated_at
          FROM game_rooms
          ORDER BY updated_at DESC
          LIMIT 60
        `,
      ])

      leaderboard = scoreRows.map((r) => ({
        game: String(r.game),
        entryId: String(r.entry_id),
        playerName: String(r.player_name),
        score: Number(r.score),
        ipHash: String(r.ip_hash),
        deviceHash: r.device_hash ? String(r.device_hash) : null,
        avatarUrl: r.avatar_url ? String(r.avatar_url) : null,
        updatedAt: new Date(r.updated_at as string | Date).toISOString(),
      }))

      uniquePlayers = Number(uniqueRows[0]?.total ?? 0)

      rooms = roomRows.map((r) => {
        const st = (r.state || {}) as {
          status?: string
          host?: { name?: string; wins?: number }
          guest?: { name?: string; wins?: number } | null
        }
        return {
          code: String(r.code),
          gameType: String(r.game_type),
          status: String(st.status || "waiting"),
          hostName: String(st.host?.name || "—"),
          guestName: st.guest?.name ? String(st.guest.name) : null,
          hostWins: Number(st.host?.wins ?? 0),
          guestWins: Number(st.guest?.wins ?? 0),
          updatedAt: new Date(r.updated_at as string | Date).toISOString(),
        }
      })
    } catch (err) {
      console.error("Admin Neon fetch error:", err)
    }
  }

  if (services.blob) {
    try {
      const res = await list({
        prefix: "games/avatars/",
        limit: 60,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      blobs = res.blobs.map((b) => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: new Date(b.uploadedAt).toISOString(),
      }))
    } catch (err) {
      console.error("Admin Blob list error:", err)
    }
  }

  return NextResponse.json({
    services,
    stats: {
      totalScores: leaderboard.length,
      uniquePlayers,
      activeRooms: rooms.length,
      totalBlobs: blobs.length,
    },
    leaderboard,
    rooms,
    blobs,
  })
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const type = body?.type as string | undefined

    if (type === "score" && hasDatabase()) {
      const game = String(body?.game || "")
      const entryId = String(body?.entryId || "")
      if (!game || !entryId) {
        return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
      }
      await ensureGamesSchema()
      const sql = getSql()
      await sql`DELETE FROM game_leaderboard WHERE game = ${game} AND entry_id = ${entryId}`
      return NextResponse.json({ ok: true })
    }

    if (type === "game_leaderboard" && hasDatabase()) {
      const game = String(body?.game || "")
      if (!game) {
        return NextResponse.json({ error: "Jeu requis" }, { status: 400 })
      }
      await ensureGamesSchema()
      const sql = getSql()
      await sql`DELETE FROM game_leaderboard WHERE game = ${game}`
      return NextResponse.json({ ok: true })
    }

    if (type === "room" && hasDatabase()) {
      const code = String(body?.code || "").toUpperCase()
      if (!code) {
        return NextResponse.json({ error: "Code requis" }, { status: 400 })
      }
      await ensureGamesSchema()
      const sql = getSql()
      await sql`DELETE FROM game_rooms WHERE code = ${code}`
      return NextResponse.json({ ok: true })
    }

    if (type === "prune_rooms" && hasDatabase()) {
      await ensureGamesSchema()
      const sql = getSql()
      await sql`DELETE FROM game_rooms WHERE updated_at < NOW() - INTERVAL '6 hours'`
      return NextResponse.json({ ok: true })
    }

    if (type === "blob" && process.env.BLOB_READ_WRITE_TOKEN) {
      const url = String(body?.url || "")
      if (!url.startsWith("https://")) {
        return NextResponse.json({ error: "URL invalide" }, { status: 400 })
      }
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
      if (hasDatabase()) {
        await ensureGamesSchema()
        const sql = getSql()
        await sql`UPDATE game_leaderboard SET avatar_url = NULL WHERE avatar_url = ${url}`
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Action non supportée" }, { status: 400 })
  } catch (err) {
    console.error("Admin DELETE error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
