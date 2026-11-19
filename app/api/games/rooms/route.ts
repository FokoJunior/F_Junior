import crypto from "crypto"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { Chess } from "chess.js"
import { NextRequest, NextResponse } from "next/server"

import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"
import {
  applyLudoMove,
  applyLudoRoll,
  createInitialLudoState,
  type LudoState,
} from "@/lib/ludo"
import { pickQuizQuestions as pickBankQuizQuestions } from "@/lib/quiz-bank"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export type DuoGameType = "tictactoe" | "reaction" | "connect4" | "rps" | "quiz" | "chess" | "ludo"
export type TttCell = "X" | "O" | null
export type C4Cell = "R" | "Y" | null
export type RpsChoice = "rock" | "paper" | "scissors"

export interface QuizQuestion {
  q: { fr: string; en: string }
  options: string[]
  answer: number
  category?: string
  difficulty?: 1 | 2 | 3
  explanation?: string
}

export interface DuoPlayer {
  id: string
  name: string
  wins: number
}

export interface DuoSpectator {
  id: string
  name: string
  lastSeen: string
}

export interface DuoRoom {
  code: string
  gameType: DuoGameType
  status: "waiting" | "playing" | "finished" | "ended"
  host: DuoPlayer
  guest: DuoPlayer | null
  spectators: DuoSpectator[]
  // Timers (ms) & Turn Thinking Limit
  matchStartedAt: string | null
  turnStartedAt: string | null
  turnLimitSec: number // 0 = unlimited, e.g. 4, 10, 15, 30
  lastTimeoutNotice: string | null
  hostElapsedMs: number
  guestElapsedMs: number
  // Forfeit / End tracking
  abandonedBy: "host" | "guest" | null
  endedBy: string | null
  endReason: "forfeit" | "ended" | null
  // Tic-Tac-Toe
  board: TttCell[]
  turn: "X" | "O"
  starter: "X" | "O"
  winner: "X" | "O" | "draw" | null
  winLine: number[] | null
  // Reaction Duel (3 rounds)
  reactionTargetRounds: number
  hostTimes: number[]
  guestTimes: number[]
  reactionWinner: "host" | "guest" | "draw" | null
  // Connect 4 (7 cols x 6 rows = 42 cells)
  c4Board: C4Cell[]
  c4Turn: "R" | "Y"
  c4Starter: "R" | "Y"
  c4Winner: "R" | "Y" | "draw" | null
  c4WinLine: number[] | null
  // Rock-Paper-Scissors (first to 3)
  rpsTarget: number
  rpsRound: number
  rpsHostScore: number
  rpsGuestScore: number
  rpsHostChoice: RpsChoice | null
  rpsGuestChoice: RpsChoice | null
  rpsLastRound: {
    host: RpsChoice
    guest: RpsChoice
    winner: "host" | "guest" | "draw"
  } | null
  rpsWinner: "host" | "guest" | null
  // Quiz Dev 1v1 (5 questions)
  quizQuestions: QuizQuestion[]
  quizHostAnswers: number[]
  quizGuestAnswers: number[]
  quizHostScore: number
  quizGuestScore: number
  quizWinner: "host" | "guest" | "draw" | null
  // Chess 1v1
  chessFen: string
  chessWhiteSide: "host" | "guest"
  chessLastMove: { from: string; to: string } | null
  chessWinner: "host" | "guest" | "draw" | null
  // Ludo 1v1
  ludoState: LudoState
  updatedAt: string
  createdAt: string
}

type RoomsStore = Record<string, DuoRoom>

const PRIMARY_FILE = path.join(process.cwd(), "data", "rooms.json")
const FALLBACK_FILE = path.join(os.tmpdir(), "fj-rooms.json")
const MAX_ROOM_AGE_MS = 6 * 60 * 60 * 1000 // 6h
const SPECTATOR_TTL_MS = 45 * 1000 // 45s

const VALID_GAME_TYPES: DuoGameType[] = ["tictactoe", "reaction", "connect4", "rps", "quiz", "chess", "ludo"]
const INITIAL_CHESS_FEN = new Chess().fen()

const TTT_LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function pickQuizQuestions(count = 5): QuizQuestion[] {
  return pickBankQuizQuestions(count, "all", "all").map((item) => ({
    q: { fr: item.q, en: item.q },
    options: item.options,
    answer: item.correctIdx,
    category: item.category,
    difficulty: item.difficulty,
    ...(item.explanation ? { explanation: item.explanation } : {}),
  }))
}

function evalTtt(board: TttCell[]): { winner: "X" | "O" | "draw" | null; line: number[] | null } {
  for (const [a, b, c] of TTT_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] }
    }
  }
  if (board.every((c) => c !== null)) return { winner: "draw", line: null }
  return { winner: null, line: null }
}

function evalC4(board: C4Cell[]): { winner: "R" | "Y" | "draw" | null; line: number[] | null } {
  const rows = 6
  const cols = 7
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r * cols + c]
      if (!cell) continue
      for (const [dr, dc] of dirs) {
        const line = [r * cols + c]
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k
          const nc = c + dc * k
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break
          if (board[nr * cols + nc] !== cell) break
          line.push(nr * cols + nc)
        }
        if (line.length === 4) return { winner: cell, line }
      }
    }
  }
  if (board.every((c) => c !== null)) return { winner: "draw", line: null }
  return { winner: null, line: null }
}

function evalRps(host: RpsChoice, guest: RpsChoice): "host" | "guest" | "draw" {
  if (host === guest) return "draw"
  if (
    (host === "rock" && guest === "scissors") ||
    (host === "paper" && guest === "rock") ||
    (host === "scissors" && guest === "paper")
  ) {
    return "host"
  }
  return "guest"
}

function sanitizeName(raw: string): string {
  return raw
    .replace(/[<>"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24)
}

function generateCode(existing: RoomsStore): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = ""
    const bytes = crypto.randomBytes(6)
    for (let i = 0; i < 6; i++) {
      code += alphabet[bytes[i] % alphabet.length]
    }
    if (!existing[code]) return code
  }
  return crypto.randomBytes(3).toString("hex").toUpperCase()
}

function normalizeRoom(room: DuoRoom): DuoRoom {
  const now = Date.now()
  const activeSpectators = Array.isArray(room.spectators)
    ? room.spectators.filter((s) => now - new Date(s.lastSeen).getTime() <= SPECTATOR_TTL_MS)
    : []
  return {
    ...room,
    spectators: activeSpectators,
    matchStartedAt: room.matchStartedAt ?? null,
    turnStartedAt: room.turnStartedAt ?? null,
    turnLimitSec: Number(room.turnLimitSec ?? 0),
    lastTimeoutNotice: room.lastTimeoutNotice ?? null,
    hostElapsedMs: Number(room.hostElapsedMs ?? 0),
    guestElapsedMs: Number(room.guestElapsedMs ?? 0),
    abandonedBy: room.abandonedBy ?? null,
    endedBy: room.endedBy ?? null,
    endReason: room.endReason ?? null,
    chessFen: room.chessFen || INITIAL_CHESS_FEN,
    chessWhiteSide: room.chessWhiteSide || "host",
    chessLastMove: room.chessLastMove ?? null,
    chessWinner: room.chessWinner ?? null,
    ludoState: room.ludoState ?? createInitialLudoState("host"),
  }
}

/**
 * Checks if the active player exceeded `turnLimitSec` and automatically passes the turn.
 * Returns true if the room state was modified.
 */
function applyTurnTimeoutIfNeeded(room: DuoRoom): boolean {
  if (room.status !== "playing" || !room.guest || !room.turnLimitSec || room.turnLimitSec <= 0 || !room.turnStartedAt) {
    return false
  }
  const elapsedMs = Date.now() - new Date(room.turnStartedAt).getTime()
  if (elapsedMs < room.turnLimitSec * 1000) return false

  const nowIso = new Date().toISOString()

  if (room.gameType === "tictactoe") {
    const timedOutHost = room.turn === "X"
    const timedOutName = timedOutHost ? room.host.name : room.guest.name
    addPlayerElapsed(room, timedOutHost ? "host" : "guest")
    room.turn = timedOutHost ? "O" : "X"
    room.turnStartedAt = nowIso
    room.lastTimeoutNotice = `Temps écoulé pour ${timedOutName} — tour passé !`
    room.updatedAt = nowIso
    return true
  }

  if (room.gameType === "connect4") {
    const timedOutHost = room.c4Turn === "R"
    const timedOutName = timedOutHost ? room.host.name : room.guest.name
    addPlayerElapsed(room, timedOutHost ? "host" : "guest")
    room.c4Turn = timedOutHost ? "Y" : "R"
    room.turnStartedAt = nowIso
    room.lastTimeoutNotice = `Temps écoulé pour ${timedOutName} — tour passé !`
    room.updatedAt = nowIso
    return true
  }

  if (room.gameType === "rps") {
    if (room.rpsHostChoice && !room.rpsGuestChoice) {
      room.rpsHostScore += 1
      room.lastTimeoutNotice = `${room.guest.name} n'a pas joué à temps (+1 pour ${room.host.name}) !`
    } else if (room.rpsGuestChoice && !room.rpsHostChoice) {
      room.rpsGuestScore += 1
      room.lastTimeoutNotice = `${room.host.name} n'a pas joué à temps (+1 pour ${room.guest.name}) !`
    } else {
      room.lastTimeoutNotice = "Temps écoulé — nouvelle manche !"
    }
    room.rpsHostChoice = null
    room.rpsGuestChoice = null
    room.rpsRound += 1
    room.turnStartedAt = nowIso
    if (room.rpsHostScore >= room.rpsTarget) {
      room.rpsWinner = "host"
      room.status = "finished"
      room.host.wins += 1
    } else if (room.rpsGuestScore >= room.rpsTarget) {
      room.rpsWinner = "guest"
      room.status = "finished"
      room.guest.wins += 1
    }
    room.updatedAt = nowIso
    return true
  }

  if (room.gameType === "chess") {
    const chess = new Chess(room.chessFen || INITIAL_CHESS_FEN)
    const activeSide: "host" | "guest" =
      (chess.turn() === "w" && room.chessWhiteSide === "host") ||
      (chess.turn() === "b" && room.chessWhiteSide === "guest")
        ? "host"
        : "guest"
    const winnerSide: "host" | "guest" = activeSide === "host" ? "guest" : "host"
    addPlayerElapsed(room, activeSide)
    room.abandonedBy = activeSide
    room.endReason = "forfeit"
    room.chessWinner = winnerSide
    room.status = "finished"
    if (winnerSide === "host") room.host.wins += 1
    else room.guest.wins += 1
    room.lastTimeoutNotice = `Temps écoulé pour ${activeSide === "host" ? room.host.name : room.guest.name} !`
    room.updatedAt = nowIso
    return true
  }

  if (room.gameType === "ludo") {
    const timedOutHost = room.ludoState.turn === "host"
    const timedOutName = timedOutHost ? room.host.name : room.guest.name
    addPlayerElapsed(room, timedOutHost ? "host" : "guest")
    room.ludoState = {
      ...room.ludoState,
      turn: timedOutHost ? "guest" : "host",
      hasRolled: false,
      lastEvent: `Temps écoulé pour ${timedOutName} — tour passé !`,
    }
    room.turnStartedAt = nowIso
    room.lastTimeoutNotice = `Temps écoulé pour ${timedOutName} — tour passé !`
    room.updatedAt = nowIso
    return true
  }

  return false
}

function addPlayerElapsed(room: DuoRoom, side: "host" | "guest") {
  if (!room.turnStartedAt) return
  const delta = Math.max(0, Math.min(30 * 60 * 1000, Date.now() - new Date(room.turnStartedAt).getTime()))
  if (side === "host") room.hostElapsedMs = (room.hostElapsedMs ?? 0) + delta
  else room.guestElapsedMs = (room.guestElapsedMs ?? 0) + delta
  room.turnStartedAt = new Date().toISOString()
}

async function readRooms(): Promise<RoomsStore> {
  let store: RoomsStore = {}
  for (const filePath of [PRIMARY_FILE, FALLBACK_FILE]) {
    try {
      const raw = await fs.readFile(filePath, "utf8")
      store = JSON.parse(raw) as RoomsStore
      break
    } catch {
      // Try next
    }
  }
  const now = Date.now()
  for (const [code, room] of Object.entries(store)) {
    if (now - new Date(room.updatedAt).getTime() > MAX_ROOM_AGE_MS) {
      delete store[code]
    }
  }
  return store
}

async function writeRooms(store: RoomsStore): Promise<void> {
  const json = JSON.stringify(store, null, 2)
  try {
    await fs.mkdir(path.dirname(PRIMARY_FILE), { recursive: true })
    await fs.writeFile(PRIMARY_FILE, json, "utf8")
  } catch {
    await fs.writeFile(FALLBACK_FILE, json, "utf8")
  }
}

async function getRoomByCode(code: string): Promise<DuoRoom | null> {
  if (hasDatabase()) {
    try {
      await ensureGamesSchema()
      const sql = getSql()
      const rows = await sql`
        SELECT state
        FROM game_rooms
        WHERE code = ${code}
          AND updated_at > NOW() - INTERVAL '6 hours'
        LIMIT 1
      `
      if (rows.length > 0 && rows[0].state) {
        return normalizeRoom(rows[0].state as DuoRoom)
      }
      return null
    } catch (err) {
      console.error("Neon getRoomByCode error, falling back to file:", err)
    }
  }
  const store = await readRooms()
  return store[code] ? normalizeRoom(store[code]) : null
}

async function saveRoom(room: DuoRoom): Promise<void> {
  const clean = normalizeRoom(room)
  if (hasDatabase()) {
    try {
      await ensureGamesSchema()
      const sql = getSql()
      const stateJson = JSON.stringify(clean)
      await sql`
        INSERT INTO game_rooms (code, game_type, state, created_at, updated_at)
        VALUES (${clean.code}, ${clean.gameType}, ${stateJson}::jsonb, NOW(), NOW())
        ON CONFLICT (code) DO UPDATE
        SET state = EXCLUDED.state, updated_at = NOW()
      `
      if (Math.random() < 0.05) {
        await sql`DELETE FROM game_rooms WHERE updated_at < NOW() - INTERVAL '6 hours'`
      }
      return
    } catch (err) {
      console.error("Neon saveRoom error, falling back to file:", err)
    }
  }
  const store = await readRooms()
  store[clean.code] = clean
  await writeRooms(store)
}

function sanitizeRoomForPlayer(room: DuoRoom, playerId?: string | null): DuoRoom {
  if (room.gameType !== "rps" || room.status !== "playing") return room
  const bothChosen = room.rpsHostChoice !== null && room.rpsGuestChoice !== null
  if (bothChosen) return room
  return {
    ...room,
    rpsHostChoice: room.host.id === playerId ? room.rpsHostChoice : room.rpsHostChoice ? ("rock" as RpsChoice) : null,
    rpsGuestChoice:
      room.guest?.id === playerId ? room.rpsGuestChoice : room.rpsGuestChoice ? ("rock" as RpsChoice) : null,
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase()
  const playerId = request.nextUrl.searchParams.get("playerId")?.trim()
  if (!code) {
    return NextResponse.json({ error: "Code requis" }, { status: 400 })
  }
  const room = await getRoomByCode(code)
  if (!room) {
    return NextResponse.json({ error: "Salon introuvable ou expiré" }, { status: 404 })
  }

  let dirty = applyTurnTimeoutIfNeeded(room)

  // Heartbeat spectator presence if watching
  if (playerId) {
    const specIdx = room.spectators.findIndex((s) => s.id === playerId)
    if (specIdx !== -1) {
      room.spectators[specIdx].lastSeen = new Date().toISOString()
      dirty = true
    }
  }

  if (dirty) {
    await saveRoom(room)
  }

  return NextResponse.json({ room: sanitizeRoomForPlayer(room, playerId) })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body?.action as string | undefined
    const playerId = typeof body?.playerId === "string" ? body.playerId.trim().slice(0, 64) : ""
    const playerName = sanitizeName(typeof body?.playerName === "string" ? body.playerName : "")

    if (!playerId) {
      return NextResponse.json({ error: "Identifiant joueur requis" }, { status: 400 })
    }

    const now = new Date().toISOString()

    if (action === "create") {
      const requestedType = body?.gameType as DuoGameType
      const gameType: DuoGameType = VALID_GAME_TYPES.includes(requestedType) ? requestedType : "tictactoe"
      if (playerName.length < 2) {
        return NextResponse.json({ error: "Pseudo requis (2 caractères min.)" }, { status: 400 })
      }
      let code = generateCode({})
      for (let i = 0; i < 10; i++) {
        const exists = await getRoomByCode(code)
        if (!exists) break
        code = generateCode({})
      }
      const allowedLimits = [0, 4, 10, 15, 30, 60]
      const reqLimit = Number(body?.turnLimitSec)
      const turnLimitSec = allowedLimits.includes(reqLimit) ? reqLimit : gameType === "chess" ? 30 : 10
      const room: DuoRoom = {
        code,
        gameType,
        status: "waiting",
        host: { id: playerId, name: playerName, wins: 0 },
        guest: null,
        spectators: [],
        matchStartedAt: null,
        turnStartedAt: null,
        turnLimitSec,
        lastTimeoutNotice: null,
        hostElapsedMs: 0,
        guestElapsedMs: 0,
        abandonedBy: null,
        endedBy: null,
        endReason: null,
        board: Array(9).fill(null),
        turn: "X",
        starter: "X",
        winner: null,
        winLine: null,
        reactionTargetRounds: 3,
        hostTimes: [],
        guestTimes: [],
        reactionWinner: null,
        c4Board: Array(42).fill(null),
        c4Turn: "R",
        c4Starter: "R",
        c4Winner: null,
        c4WinLine: null,
        rpsTarget: 3,
        rpsRound: 1,
        rpsHostScore: 0,
        rpsGuestScore: 0,
        rpsHostChoice: null,
        rpsGuestChoice: null,
        rpsLastRound: null,
        rpsWinner: null,
        quizQuestions: gameType === "quiz" ? pickQuizQuestions(5) : [],
        quizHostAnswers: [],
        quizGuestAnswers: [],
        quizHostScore: 0,
        quizGuestScore: 0,
        quizWinner: null,
        chessFen: INITIAL_CHESS_FEN,
        chessWhiteSide: "host",
        chessLastMove: null,
        chessWinner: null,
        ludoState: createInitialLudoState("host"),
        createdAt: now,
        updatedAt: now,
      }
      await saveRoom(room)
      return NextResponse.json({ room, role: "host" })
    }

    const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : ""
    const room = await getRoomByCode(code)
    if (!room) {
      return NextResponse.json({ error: "Salon introuvable ou expiré" }, { status: 404 })
    }

    if (action === "spectate") {
      const specName = playerName.length >= 2 ? playerName : "Spectateur"
      const idx = room.spectators.findIndex((s) => s.id === playerId)
      if (idx === -1) {
        room.spectators.push({ id: playerId, name: specName, lastSeen: now })
      } else {
        room.spectators[idx] = { id: playerId, name: specName, lastSeen: now }
      }
      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room: sanitizeRoomForPlayer(room, playerId), role: "spectator" })
    }

    if (action === "join") {
      if (playerName.length < 2) {
        return NextResponse.json({ error: "Veuillez entrer votre nom (2 caractères min.)" }, { status: 400 })
      }
      let role: "host" | "guest" | "spectator" = "guest"
      if (room.host.id === playerId) {
        room.host.name = playerName
        role = "host"
      } else if (room.guest && room.guest.id === playerId) {
        room.guest.name = playerName
        role = "guest"
      } else if (!room.guest && room.status === "waiting") {
        room.guest = { id: playerId, name: playerName, wins: 0 }
        room.status = "playing"
        room.matchStartedAt = now
        room.turnStartedAt = now
        room.hostElapsedMs = 0
        room.guestElapsedMs = 0
        role = "guest"
      } else {
        // Room already has 2 players -> join automatically as spectator!
        const idx = room.spectators.findIndex((s) => s.id === playerId)
        if (idx === -1) {
          room.spectators.push({ id: playerId, name: playerName, lastSeen: now })
        } else {
          room.spectators[idx] = { id: playerId, name: playerName, lastSeen: now }
        }
        role = "spectator"
      }
      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room: sanitizeRoomForPlayer(room, playerId), role })
    }

    if (action === "forfeit") {
      if (room.status !== "playing" || !room.guest) {
        return NextResponse.json({ error: "Aucune manche en cours" }, { status: 400 })
      }
      const isHost = room.host.id === playerId
      const isGuest = room.guest.id === playerId
      if (!isHost && !isGuest) {
        return NextResponse.json({ error: "Action réservée aux joueurs" }, { status: 403 })
      }

      addPlayerElapsed(room, isHost ? "host" : "guest")
      room.abandonedBy = isHost ? "host" : "guest"
      room.endReason = "forfeit"
      room.status = "finished"

      if (isHost) {
        room.guest.wins += 1
        if (room.gameType === "tictactoe") room.winner = "O"
        if (room.gameType === "connect4") room.c4Winner = "Y"
        if (room.gameType === "rps") room.rpsWinner = "guest"
        if (room.gameType === "quiz") room.quizWinner = "guest"
        if (room.gameType === "reaction") room.reactionWinner = "guest"
        if (room.gameType === "chess") room.chessWinner = "guest"
        if (room.gameType === "ludo") room.ludoState.winner = "guest"
      } else {
        room.host.wins += 1
        if (room.gameType === "tictactoe") room.winner = "X"
        if (room.gameType === "connect4") room.c4Winner = "R"
        if (room.gameType === "rps") room.rpsWinner = "host"
        if (room.gameType === "quiz") room.quizWinner = "host"
        if (room.gameType === "reaction") room.reactionWinner = "host"
        if (room.gameType === "chess") room.chessWinner = "host"
        if (room.gameType === "ludo") room.ludoState.winner = "host"
      }

      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    if (action === "end_match") {
      const isHost = room.host.id === playerId
      const isGuest = room.guest?.id === playerId
      if (!isHost && !isGuest) {
        // Spectator leaving simply removes themselves from spectator list
        room.spectators = room.spectators.filter((s) => s.id !== playerId)
        room.updatedAt = now
        await saveRoom(room)
        return NextResponse.json({ room })
      }

      if (room.status === "playing" && room.guest) {
        addPlayerElapsed(room, isHost ? "host" : "guest")
        room.abandonedBy = isHost ? "host" : "guest"
        if (isHost) room.guest.wins += 1
        else room.host.wins += 1
      }
      room.status = "ended"
      room.endedBy = isHost ? room.host.name : room.guest?.name || "Joueur"
      room.endReason = "ended"
      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    if (action === "move") {
      if (room.gameType !== "tictactoe" || room.status !== "playing" || !room.guest) {
        return NextResponse.json({ error: "Partie non active" }, { status: 400 })
      }
      const index = Number(body?.index)
      if (!Number.isInteger(index) || index < 0 || index > 8 || room.board[index] !== null) {
        return NextResponse.json({ error: "Coup invalide" }, { status: 400 })
      }
      const symbol: "X" | "O" | null =
        room.host.id === playerId ? "X" : room.guest.id === playerId ? "O" : null
      if (!symbol || symbol !== room.turn) {
        return NextResponse.json({ error: "Ce n'est pas votre tour" }, { status: 400 })
      }

      addPlayerElapsed(room, symbol === "X" ? "host" : "guest")
      room.lastTimeoutNotice = null
      room.board[index] = symbol
      const res = evalTtt(room.board)
      if (res.winner) {
        room.winner = res.winner
        room.winLine = res.line
        room.status = "finished"
        if (res.winner === "X") room.host.wins += 1
        if (res.winner === "O") room.guest.wins += 1
      } else {
        room.turn = room.turn === "X" ? "O" : "X"
      }
      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    if (action === "c4_drop") {
      if (room.gameType !== "connect4" || room.status !== "playing" || !room.guest) {
        return NextResponse.json({ error: "Partie non active" }, { status: 400 })
      }
      const col = Number(body?.col)
      if (!Number.isInteger(col) || col < 0 || col > 6) {
        return NextResponse.json({ error: "Colonne invalide" }, { status: 400 })
      }
      const disc: "R" | "Y" | null =
        room.host.id === playerId ? "R" : room.guest.id === playerId ? "Y" : null
      if (!disc || disc !== room.c4Turn) {
        return NextResponse.json({ error: "Ce n'est pas votre tour" }, { status: 400 })
      }

      let targetIdx = -1
      for (let r = 5; r >= 0; r--) {
        const idx = r * 7 + col
        if (room.c4Board[idx] === null) {
          targetIdx = idx
          break
        }
      }
      if (targetIdx === -1) {
        return NextResponse.json({ error: "Colonne pleine" }, { status: 400 })
      }

      addPlayerElapsed(room, disc === "R" ? "host" : "guest")
      room.lastTimeoutNotice = null
      room.c4Board[targetIdx] = disc
      const res = evalC4(room.c4Board)
      if (res.winner) {
        room.c4Winner = res.winner
        room.c4WinLine = res.line
        room.status = "finished"
        if (res.winner === "R") room.host.wins += 1
        if (res.winner === "Y") room.guest.wins += 1
      } else {
        room.c4Turn = room.c4Turn === "R" ? "Y" : "R"
      }
      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    if (action === "rps_pick") {
      if (room.gameType !== "rps" || room.status !== "playing" || !room.guest) {
        return NextResponse.json({ error: "Partie non active" }, { status: 400 })
      }
      const choice = body?.choice as RpsChoice
      if (choice !== "rock" && choice !== "paper" && choice !== "scissors") {
        return NextResponse.json({ error: "Choix invalide" }, { status: 400 })
      }
      const isHostSide = room.host.id === playerId
      const isGuestSide = room.guest.id === playerId
      if (!isHostSide && !isGuestSide) {
        return NextResponse.json({ error: "Non membre" }, { status: 403 })
      }

      // Atomic JSONB update in Neon prevents simultaneous picks from overwriting each other
      let latestRoom = room
      if (hasDatabase()) {
        try {
          await ensureGamesSchema()
          const sql = getSql()
          const fieldPath = isHostSide ? "{rpsHostChoice}" : "{rpsGuestChoice}"
          const updatedRows = await sql`
            UPDATE game_rooms
            SET
              state = jsonb_set(state, ${fieldPath}::text[], to_jsonb(${choice}::text), true),
              updated_at = NOW()
            WHERE code = ${room.code}
            RETURNING state
          `
          if (updatedRows.length > 0 && updatedRows[0].state) {
            latestRoom = normalizeRoom(updatedRows[0].state as DuoRoom)
          }
        } catch (err) {
          console.error("Atomic rps_pick error:", err)
          if (isHostSide) latestRoom.rpsHostChoice = choice
          else latestRoom.rpsGuestChoice = choice
        }
      } else {
        if (isHostSide && latestRoom.rpsHostChoice === null) latestRoom.rpsHostChoice = choice
        if (isGuestSide && latestRoom.rpsGuestChoice === null) latestRoom.rpsGuestChoice = choice
      }

      addPlayerElapsed(latestRoom, isHostSide ? "host" : "guest")

      if (latestRoom.rpsHostChoice && latestRoom.rpsGuestChoice) {
        const roundWinner = evalRps(latestRoom.rpsHostChoice, latestRoom.rpsGuestChoice)
        latestRoom.rpsLastRound = {
          host: latestRoom.rpsHostChoice,
          guest: latestRoom.rpsGuestChoice,
          winner: roundWinner,
        }
        if (roundWinner === "host") latestRoom.rpsHostScore += 1
        if (roundWinner === "guest") latestRoom.rpsGuestScore += 1

        latestRoom.rpsHostChoice = null
        latestRoom.rpsGuestChoice = null
        latestRoom.rpsRound += 1

        if (latestRoom.rpsHostScore >= latestRoom.rpsTarget) {
          latestRoom.rpsWinner = "host"
          latestRoom.status = "finished"
          latestRoom.host.wins += 1
        } else if (latestRoom.rpsGuestScore >= latestRoom.rpsTarget) {
          latestRoom.rpsWinner = "guest"
          latestRoom.status = "finished"
          latestRoom.guest!.wins += 1
        }
      }
      latestRoom.updatedAt = now
      await saveRoom(latestRoom)
      return NextResponse.json({ room: sanitizeRoomForPlayer(latestRoom, playerId) })
    }

    if (action === "quiz_answer") {
      if (room.gameType !== "quiz" || room.status !== "playing" || !room.guest) {
        return NextResponse.json({ error: "Quiz non actif" }, { status: 400 })
      }
      const optionIdx = Number(body?.optionIdx)
      if (!Number.isInteger(optionIdx) || optionIdx < 0 || optionIdx > 3) {
        return NextResponse.json({ error: "Réponse invalide" }, { status: 400 })
      }
      const total = room.quizQuestions.length
      if (room.host.id === playerId) {
        if (room.quizHostAnswers.length < total) {
          const q = room.quizQuestions[room.quizHostAnswers.length]
          room.quizHostAnswers.push(optionIdx)
          if (optionIdx === q.answer) room.quizHostScore += 1
          addPlayerElapsed(room, "host")
        }
      } else if (room.guest.id === playerId) {
        if (room.quizGuestAnswers.length < total) {
          const q = room.quizQuestions[room.quizGuestAnswers.length]
          room.quizGuestAnswers.push(optionIdx)
          if (optionIdx === q.answer) room.quizGuestScore += 1
          addPlayerElapsed(room, "guest")
        }
      } else {
        return NextResponse.json({ error: "Non membre" }, { status: 403 })
      }

      if (room.quizHostAnswers.length >= total && room.quizGuestAnswers.length >= total) {
        room.status = "finished"
        if (room.quizHostScore > room.quizGuestScore) {
          room.quizWinner = "host"
          room.host.wins += 1
        } else if (room.quizGuestScore > room.quizHostScore) {
          room.quizWinner = "guest"
          room.guest.wins += 1
        } else {
          room.quizWinner = "draw"
        }
      }
      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    if (action === "reaction_result") {
      if (room.gameType !== "reaction" || room.status !== "playing" || !room.guest) {
        return NextResponse.json({ error: "Duel non actif" }, { status: 400 })
      }
      const ms = Math.round(Number(body?.ms))
      if (!Number.isFinite(ms) || ms < 50 || ms > 5000) {
        return NextResponse.json({ error: "Temps invalide" }, { status: 400 })
      }
      if (room.host.id === playerId) {
        if (room.hostTimes.length < room.reactionTargetRounds) {
          room.hostTimes.push(ms)
          room.hostElapsedMs = (room.hostElapsedMs ?? 0) + ms
        }
      } else if (room.guest.id === playerId) {
        if (room.guestTimes.length < room.reactionTargetRounds) {
          room.guestTimes.push(ms)
          room.guestElapsedMs = (room.guestElapsedMs ?? 0) + ms
        }
      } else {
        return NextResponse.json({ error: "Non membre du salon" }, { status: 403 })
      }

      if (
        room.hostTimes.length >= room.reactionTargetRounds &&
        room.guestTimes.length >= room.reactionTargetRounds
      ) {
        const hostAvg = room.hostTimes.reduce((a, b) => a + b, 0) / room.hostTimes.length
        const guestAvg = room.guestTimes.reduce((a, b) => a + b, 0) / room.guestTimes.length
        room.status = "finished"
        if (Math.round(hostAvg) < Math.round(guestAvg)) {
          room.reactionWinner = "host"
          room.host.wins += 1
        } else if (Math.round(guestAvg) < Math.round(hostAvg)) {
          room.reactionWinner = "guest"
          room.guest.wins += 1
        } else {
          room.reactionWinner = "draw"
        }
      }
      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    if (action === "chess_move") {
      if (room.gameType !== "chess" || room.status !== "playing" || !room.guest) {
        return NextResponse.json({ error: "Partie d'échecs non active" }, { status: 400 })
      }
      const from = typeof body?.from === "string" ? body.from.trim().toLowerCase() : ""
      const to = typeof body?.to === "string" ? body.to.trim().toLowerCase() : ""
      const isHostSide = room.host.id === playerId
      const isGuestSide = room.guest.id === playerId
      if (!isHostSide && !isGuestSide) {
        return NextResponse.json({ error: "Non membre" }, { status: 403 })
      }

      const chess = new Chess(room.chessFen || INITIAL_CHESS_FEN)
      const myColor: "w" | "b" =
        (isHostSide && room.chessWhiteSide === "host") || (isGuestSide && room.chessWhiteSide === "guest")
          ? "w"
          : "b"
      if (chess.turn() !== myColor) {
        return NextResponse.json({ error: "Ce n'est pas votre tour" }, { status: 400 })
      }

      try {
        const move = chess.move({ from, to, promotion: "q" })
        if (!move) {
          return NextResponse.json({ error: "Coup illégal" }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: "Coup illégal" }, { status: 400 })
      }

      addPlayerElapsed(room, isHostSide ? "host" : "guest")
      room.lastTimeoutNotice = null
      room.chessFen = chess.fen()
      room.chessLastMove = { from, to }

      if (chess.isCheckmate()) {
        room.status = "finished"
        const winnerSide: "host" | "guest" = isHostSide ? "host" : "guest"
        room.chessWinner = winnerSide
        if (winnerSide === "host") room.host.wins += 1
        else room.guest.wins += 1
      } else if (chess.isDraw() || chess.isStalemate()) {
        room.status = "finished"
        room.chessWinner = "draw"
      }

      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    if (action === "ludo_roll") {
      if (room.gameType !== "ludo" || room.status !== "playing" || !room.guest) {
        return NextResponse.json({ error: "Partie de Ludo non active" }, { status: 400 })
      }
      const isHostSide = room.host.id === playerId
      const isGuestSide = room.guest.id === playerId
      if (!isHostSide && !isGuestSide) {
        return NextResponse.json({ error: "Non membre" }, { status: 403 })
      }
      const side = isHostSide ? "host" : "guest"
      if (room.ludoState.turn !== side || room.ludoState.hasRolled) {
        return NextResponse.json({ error: "Ce n'est pas le moment de lancer le dé" }, { status: 400 })
      }

      const roll = Math.floor(Math.random() * 6) + 1
      const name = isHostSide ? room.host.name : room.guest.name
      room.ludoState = applyLudoRoll(room.ludoState, side, roll, name)
      room.lastTimeoutNotice = null
      if (!room.ludoState.hasRolled) {
        // No legal move -> turn passed automatically
        addPlayerElapsed(room, side)
      }
      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    if (action === "ludo_move") {
      if (room.gameType !== "ludo" || room.status !== "playing" || !room.guest) {
        return NextResponse.json({ error: "Partie de Ludo non active" }, { status: 400 })
      }
      const isHostSide = room.host.id === playerId
      const isGuestSide = room.guest.id === playerId
      if (!isHostSide && !isGuestSide) {
        return NextResponse.json({ error: "Non membre" }, { status: 403 })
      }
      const side = isHostSide ? "host" : "guest"
      const tokenIdx = Number(body?.tokenIdx)
      if (!Number.isInteger(tokenIdx) || tokenIdx < 0 || tokenIdx > 3) {
        return NextResponse.json({ error: "Pion invalide" }, { status: 400 })
      }

      const name = isHostSide ? room.host.name : room.guest.name
      room.ludoState = applyLudoMove(room.ludoState, side, tokenIdx, name)
      addPlayerElapsed(room, side)
      room.lastTimeoutNotice = null

      if (room.ludoState.winner) {
        room.status = "finished"
        if (room.ludoState.winner === "host") room.host.wins += 1
        else room.guest.wins += 1
      }

      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    if (action === "rematch") {
      if (room.host.id !== playerId && room.guest?.id !== playerId) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
      }
      if (!room.guest) {
        return NextResponse.json({ error: "En attente du 2e joueur" }, { status: 400 })
      }
      room.status = "playing"
      room.matchStartedAt = now
      room.turnStartedAt = now
      room.lastTimeoutNotice = null
      room.hostElapsedMs = 0
      room.guestElapsedMs = 0
      room.abandonedBy = null
      room.endedBy = null
      room.endReason = null
      // Reset Tic-Tac-Toe
      room.board = Array(9).fill(null)
      room.starter = room.starter === "X" ? "O" : "X"
      room.turn = room.starter
      room.winner = null
      room.winLine = null
      // Reset Reaction
      room.hostTimes = []
      room.guestTimes = []
      room.reactionWinner = null
      // Reset Connect 4
      room.c4Board = Array(42).fill(null)
      room.c4Starter = room.c4Starter === "R" ? "Y" : "R"
      room.c4Turn = room.c4Starter
      room.c4Winner = null
      room.c4WinLine = null
      // Reset RPS
      room.rpsRound = 1
      room.rpsHostScore = 0
      room.rpsGuestScore = 0
      room.rpsHostChoice = null
      room.rpsGuestChoice = null
      room.rpsLastRound = null
      room.rpsWinner = null
      // Reset Quiz
      room.quizQuestions = room.gameType === "quiz" ? pickQuizQuestions(5) : []
      room.quizHostAnswers = []
      room.quizGuestAnswers = []
      room.quizHostScore = 0
      room.quizGuestScore = 0
      room.quizWinner = null
      // Reset Chess (swap White & Black)
      room.chessFen = INITIAL_CHESS_FEN
      room.chessWhiteSide = room.chessWhiteSide === "host" ? "guest" : "host"
      room.chessLastMove = null
      room.chessWinner = null
      // Reset Ludo (alternate starter)
      room.ludoState = createInitialLudoState(room.ludoState.turn === "host" ? "guest" : "host")

      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
