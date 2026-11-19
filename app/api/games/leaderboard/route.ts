import crypto from "crypto"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"
import type { GameId } from "@/lib/games"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface StoredEntry {
  id: string
  name: string
  score: number
  ipHash: string
  deviceHash?: string
  avatarUrl?: string | null
  updatedAt: string
}

type StoreData = Record<GameId, StoredEntry[]>

const VALID_GAMES: GameId[] = [
  "snake",
  "2048",
  "tictactoe",
  "memory",
  "reaction",
  "breakout",
  "minesweeper",
  "typing",
  "simon",
  "puzzle",
  "connect4",
  "duo-tictactoe",
  "rps",
  "quiz",
  "duo-reaction",
]

const LOWER_IS_BETTER: Record<GameId, boolean> = {
  snake: false,
  "2048": false,
  tictactoe: false,
  memory: true,
  reaction: true,
  breakout: false,
  minesweeper: true,
  typing: false,
  simon: false,
  puzzle: true,
  connect4: false,
  "duo-tictactoe": false,
  rps: false,
  quiz: false,
  "duo-reaction": false,
}

const SCORE_BOUNDS: Record<GameId, { min: number; max: number }> = {
  snake: { min: 1, max: 400 },
  "2048": { min: 4, max: 500_000 },
  tictactoe: { min: 1, max: 10_000 },
  memory: { min: 6, max: 500 },
  reaction: { min: 60, max: 5_000 },
  breakout: { min: 10, max: 200_000 },
  minesweeper: { min: 2, max: 3_600 },
  typing: { min: 5, max: 300 },
  simon: { min: 1, max: 200 },
  puzzle: { min: 5, max: 2_000 },
  connect4: { min: 1, max: 10_000 },
  "duo-tictactoe": { min: 1, max: 10_000 },
  rps: { min: 1, max: 10_000 },
  quiz: { min: 1, max: 10_000 },
  "duo-reaction": { min: 1, max: 10_000 },
}

const PRIMARY_FILE = path.join(process.cwd(), "data", "leaderboard.json")
const FALLBACK_FILE = path.join(os.tmpdir(), "fj-leaderboard.json")

function emptyStore(): StoreData {
  return {
    snake: [],
    "2048": [],
    tictactoe: [],
    memory: [],
    reaction: [],
    breakout: [],
    minesweeper: [],
    typing: [],
    simon: [],
    puzzle: [],
    connect4: [],
    "duo-tictactoe": [],
    rps: [],
    quiz: [],
    "duo-reaction": [],
  }
}

async function readFileStore(): Promise<StoreData> {
  for (const filePath of [PRIMARY_FILE, FALLBACK_FILE]) {
    try {
      const raw = await fs.readFile(filePath, "utf8")
      const parsed = JSON.parse(raw) as Partial<StoreData>
      return { ...emptyStore(), ...parsed }
    } catch {
      // Try next
    }
  }
  return emptyStore()
}

async function writeFileStore(data: StoreData): Promise<void> {
  const json = JSON.stringify(data, null, 2)
  try {
    await fs.mkdir(path.dirname(PRIMARY_FILE), { recursive: true })
    await fs.writeFile(PRIMARY_FILE, json, "utf8")
  } catch {
    await fs.writeFile(FALLBACK_FILE, json, "utf8")
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "127.0.0.1"
  )
}

function hashToken(namespace: string, value: string): string {
  const salt = process.env.LEADERBOARD_SALT || "fj-portfolio-games-v1"
  return crypto.createHash("sha256").update(`${salt}:${namespace}:${value}`).digest("hex").slice(0, 14)
}

function hashIp(ip: string): string {
  return hashToken("ip", ip)
}

function getDeviceHash(request: NextRequest, bodyDeviceId?: unknown): string | null {
  const raw =
    (typeof bodyDeviceId === "string" && bodyDeviceId.trim()) ||
    request.cookies.get("fj_device_id")?.value?.trim() ||
    ""
  if (raw.length < 8 || raw.length > 64) return null
  return hashToken("dev", raw)
}

function sanitizeName(raw: string): string {
  return raw
    .replace(/[<>"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24)
}

function sanitizeAvatarUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.startsWith("https://") && trimmed.length <= 512) {
    return trimmed
  }
  return null
}

function sortEntries(entries: StoredEntry[], game: GameId): StoredEntry[] {
  const lower = LOWER_IS_BETTER[game]
  return [...entries].sort((a, b) => {
    if (a.score !== b.score) {
      return lower ? a.score - b.score : b.score - a.score
    }
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  })
}

function toPublic(entries: StoredEntry[], currentIpHash: string, currentDeviceHash: string | null) {
  return entries.slice(0, 15).map((e) => ({
    id: e.id,
    name: e.name,
    score: e.score,
    avatarUrl: e.avatarUrl ?? null,
    updatedAt: e.updatedAt,
    isCurrentPlayer:
      (currentDeviceHash !== null && e.deviceHash === currentDeviceHash) ||
      (!e.deviceHash && e.ipHash === currentIpHash),
  }))
}

async function fetchNeonEntries(game: GameId): Promise<StoredEntry[]> {
  await ensureGamesSchema()
  const sql = getSql()
  const lower = LOWER_IS_BETTER[game]
  const rows = lower
    ? await sql`
        SELECT entry_id, player_name, score, ip_hash, device_hash, avatar_url, updated_at
        FROM game_leaderboard
        WHERE game = ${game}
        ORDER BY score ASC, updated_at ASC
        LIMIT 15
      `
    : await sql`
        SELECT entry_id, player_name, score, ip_hash, device_hash, avatar_url, updated_at
        FROM game_leaderboard
        WHERE game = ${game}
        ORDER BY score DESC, updated_at ASC
        LIMIT 15
      `

  return rows.map((r) => ({
    id: String(r.entry_id),
    name: String(r.player_name),
    score: Number(r.score),
    ipHash: String(r.ip_hash),
    deviceHash: r.device_hash ? String(r.device_hash) : undefined,
    avatarUrl: r.avatar_url ? String(r.avatar_url) : null,
    updatedAt: new Date(r.updated_at as string | Date).toISOString(),
  }))
}

export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get("game") as GameId | null
  if (!game || !VALID_GAMES.includes(game)) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 })
  }

  const ipHash = hashIp(getClientIp(request))
  const deviceHash = getDeviceHash(request)

  if (hasDatabase()) {
    try {
      const entries = await fetchNeonEntries(game)
      return NextResponse.json({
        game,
        storage: "neon",
        entries: toPublic(entries, ipHash, deviceHash),
      })
    } catch (err) {
      console.error("Neon GET leaderboard error, falling back to file:", err)
    }
  }

  const store = await readFileStore()
  const sorted = sortEntries(store[game] || [], game)
  return NextResponse.json({
    game,
    storage: "file",
    entries: toPublic(sorted, ipHash, deviceHash),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const game = body?.game as GameId | undefined
    const rawName = typeof body?.name === "string" ? body.name : ""
    const score = Number(body?.score)

    if (!game || !VALID_GAMES.includes(game)) {
      return NextResponse.json({ error: "Jeu invalide" }, { status: 400 })
    }

    const name = sanitizeName(rawName)
    if (name.length < 2) {
      return NextResponse.json({ error: "Pseudo requis (2 caractères min.)" }, { status: 400 })
    }

    const bounds = SCORE_BOUNDS[game]
    if (!Number.isFinite(score) || score < bounds.min || score > bounds.max) {
      return NextResponse.json({ error: "Score invalide" }, { status: 400 })
    }

    const ipHash = hashIp(getClientIp(request))
    const deviceHash = getDeviceHash(request, body?.deviceId)
    const avatarUrl = sanitizeAvatarUrl(body?.avatarUrl)
    const normalizedName = name.toLowerCase()
    const entryId = deviceHash ? `dev:${deviceHash}` : `ip:${ipHash}:${normalizedName}`
    const roundedScore = Math.round(score)
    const lower = LOWER_IS_BETTER[game]

    // Neon PostgreSQL path
    if (hasDatabase()) {
      try {
        await ensureGamesSchema()
        const sql = getSql()

        // Check ban status & upsert player profile in game_players
        const playerRows = await sql`
          SELECT banned
          FROM game_players
          WHERE player_key = ${entryId}
             OR (${deviceHash}::text IS NOT NULL AND device_hash = ${deviceHash})
          LIMIT 1
        `
        if (playerRows.length > 0 && Boolean(playerRows[0].banned)) {
          return NextResponse.json({ error: "Ce compte joueur est suspendu." }, { status: 403 })
        }

        await sql`
          INSERT INTO game_players (player_key, player_name, ip_hash, device_hash, avatar_url, last_seen)
          VALUES (${entryId}, ${name}, ${ipHash}, ${deviceHash}, ${avatarUrl}, NOW())
          ON CONFLICT (player_key) DO UPDATE
          SET
            player_name = EXCLUDED.player_name,
            ip_hash = EXCLUDED.ip_hash,
            device_hash = COALESCE(EXCLUDED.device_hash, game_players.device_hash),
            avatar_url = COALESCE(EXCLUDED.avatar_url, game_players.avatar_url),
            last_seen = NOW()
        `

        const existing = await sql`
          SELECT score, player_name, avatar_url
          FROM game_leaderboard
          WHERE game = ${game} AND entry_id = ${entryId}
          LIMIT 1
        `

        let saved = false
        if (existing.length === 0) {
          await sql`
            INSERT INTO game_leaderboard (game, entry_id, player_name, score, ip_hash, device_hash, avatar_url, updated_at)
            VALUES (${game}, ${entryId}, ${name}, ${roundedScore}, ${ipHash}, ${deviceHash}, ${avatarUrl}, NOW())
          `
          saved = true
        } else {
          const prevScore = Number(existing[0].score)
          const prevName = String(existing[0].player_name)
          const prevAvatar = existing[0].avatar_url ? String(existing[0].avatar_url) : null
          const isBetter = lower ? roundedScore < prevScore : roundedScore > prevScore
          const nextAvatar = avatarUrl ?? prevAvatar

          if (isBetter || prevName !== name || nextAvatar !== prevAvatar) {
            await sql`
              UPDATE game_leaderboard
              SET
                player_name = ${name},
                score = ${isBetter ? roundedScore : prevScore},
                ip_hash = ${ipHash},
                device_hash = ${deviceHash},
                avatar_url = ${nextAvatar},
                updated_at = COALESCE(${isBetter ? new Date().toISOString() : null}::timestamptz, updated_at)
              WHERE game = ${game} AND entry_id = ${entryId}
            `
            saved = true
          }
        }

        const entries = await fetchNeonEntries(game)
        const rankIdx = entries.findIndex((item) => item.id === entryId)

        return NextResponse.json({
          game,
          storage: "neon",
          saved,
          rank: rankIdx !== -1 ? rankIdx + 1 : null,
          entries: toPublic(entries, ipHash, deviceHash),
        })
      } catch (err) {
        console.error("Neon POST leaderboard error, falling back to file:", err)
      }
    }

    // Local file fallback
    const store = await readFileStore()
    const list = store[game] || []
    const existingIdx = list.findIndex(
      (item) => item.id === entryId || (deviceHash && item.deviceHash === deviceHash),
    )

    let saved = false
    const now = new Date().toISOString()

    if (existingIdx === -1) {
      list.push({
        id: entryId,
        name,
        score: roundedScore,
        ipHash,
        deviceHash: deviceHash ?? undefined,
        avatarUrl,
        updatedAt: now,
      })
      saved = true
    } else {
      const current = list[existingIdx]
      const isBetter = lower ? roundedScore < current.score : roundedScore > current.score
      const nextAvatar = avatarUrl ?? current.avatarUrl ?? null
      if (isBetter || current.name !== name || nextAvatar !== (current.avatarUrl ?? null)) {
        list[existingIdx] = {
          ...current,
          id: entryId,
          name,
          score: isBetter ? roundedScore : current.score,
          ipHash,
          deviceHash: deviceHash ?? current.deviceHash,
          avatarUrl: nextAvatar,
          updatedAt: isBetter ? now : current.updatedAt,
        }
        saved = true
      }
    }

    const sorted = sortEntries(list, game)
    store[game] = sorted.slice(0, 100)
    if (saved) await writeFileStore(store)

    const rankIdx = sorted.findIndex((item) => item.id === entryId)
    return NextResponse.json({
      game,
      storage: "file",
      saved,
      rank: rankIdx !== -1 ? rankIdx + 1 : null,
      entries: toPublic(sorted, ipHash, deviceHash),
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
