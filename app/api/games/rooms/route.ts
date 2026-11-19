import crypto from "crypto"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export type DuoGameType = "tictactoe" | "reaction" | "connect4" | "rps" | "quiz"
export type TttCell = "X" | "O" | null
export type C4Cell = "R" | "Y" | null
export type RpsChoice = "rock" | "paper" | "scissors"

export interface QuizQuestion {
  q: { fr: string; en: string }
  options: string[]
  answer: number
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
  // Timers (ms)
  matchStartedAt: string | null
  turnStartedAt: string | null
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
  updatedAt: string
  createdAt: string
}

type RoomsStore = Record<string, DuoRoom>

const PRIMARY_FILE = path.join(process.cwd(), "data", "rooms.json")
const FALLBACK_FILE = path.join(os.tmpdir(), "fj-rooms.json")
const MAX_ROOM_AGE_MS = 6 * 60 * 60 * 1000 // 6h
const SPECTATOR_TTL_MS = 45 * 1000 // 45s

const VALID_GAME_TYPES: DuoGameType[] = ["tictactoe", "reaction", "connect4", "rps", "quiz"]

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

const QUIZ_POOL: QuizQuestion[] = [
  {
    q: { fr: "Quel hook React gère un état local dans un composant ?", en: "Which React hook manages local state in a component?" },
    options: ["useEffect", "useState", "useRef", "useMemo"],
    answer: 1,
  },
  {
    q: { fr: "Quel code HTTP signifie « Ressource introuvable » ?", en: "Which HTTP status code means 'Not Found'?" },
    options: ["200", "301", "404", "500"],
    answer: 2,
  },
  {
    q: { fr: "Quelle commande Git envoie les commits locaux vers le dépôt distant ?", en: "Which Git command sends local commits to a remote repo?" },
    options: ["git pull", "git push", "git merge", "git fetch"],
    answer: 1,
  },
  {
    q: { fr: "Quelle propriété CSS active la mise en page Flexbox ?", en: "Which CSS property activates Flexbox layout?" },
    options: ["position: flex", "display: flex", "layout: flex", "align: flex"],
    answer: 1,
  },
  {
    q: { fr: "En TypeScript, que signifie le type « unknown » ?", en: "In TypeScript, what does the 'unknown' type represent?" },
    options: ["Un alias de null", "Un type sûr qui nécessite une vérification", "Un tableau vide", "Une fonction asynchrone"],
    answer: 1,
  },
  {
    q: { fr: "Quel port TCP est utilisé par défaut par HTTPS ?", en: "Which default TCP port does HTTPS use?" },
    options: ["22", "80", "443", "8080"],
    answer: 2,
  },
  {
    q: { fr: "Dans Next.js App Router, quel fichier définit la page 404 ?", en: "In Next.js App Router, which file defines the 404 page?" },
    options: ["404.tsx", "error.tsx", "not-found.tsx", "missing.tsx"],
    answer: 2,
  },
  {
    q: { fr: "Quelle structure de données suit le principe LIFO (dernier entré, premier sorti) ?", en: "Which data structure follows LIFO (Last In, First Out)?" },
    options: ["File (Queue)", "Pile (Stack)", "Arbre binaire", "Table de hachage"],
    answer: 1,
  },
  {
    q: { fr: "Quelle commande SQL permet de récupérer des lignes d'une table ?", en: "Which SQL command retrieves rows from a table?" },
    options: ["FETCH", "GET", "SELECT", "READ"],
    answer: 2,
  },
  {
    q: { fr: "Que signifie l'acronyme API ?", en: "What does the acronym API stand for?" },
    options: [
      "Application Programming Interface",
      "Advanced Protocol Integration",
      "Automated Process Index",
      "Active Page Interaction",
    ],
    answer: 0,
  },
]

function pickQuizQuestions(count = 5): QuizQuestion[] {
  const copy = [...QUIZ_POOL]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
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
    hostElapsedMs: Number(room.hostElapsedMs ?? 0),
    guestElapsedMs: Number(room.guestElapsedMs ?? 0),
    abandonedBy: room.abandonedBy ?? null,
    endedBy: room.endedBy ?? null,
    endReason: room.endReason ?? null,
  }
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

  // Heartbeat spectator presence if watching
  if (playerId) {
    const specIdx = room.spectators.findIndex((s) => s.id === playerId)
    if (specIdx !== -1) {
      room.spectators[specIdx].lastSeen = new Date().toISOString()
      await saveRoom(room)
    }
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
      const room: DuoRoom = {
        code,
        gameType,
        status: "waiting",
        host: { id: playerId, name: playerName, wins: 0 },
        guest: null,
        spectators: [],
        matchStartedAt: null,
        turnStartedAt: null,
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
      } else {
        room.host.wins += 1
        if (room.gameType === "tictactoe") room.winner = "X"
        if (room.gameType === "connect4") room.c4Winner = "R"
        if (room.gameType === "rps") room.rpsWinner = "host"
        if (room.gameType === "quiz") room.quizWinner = "host"
        if (room.gameType === "reaction") room.reactionWinner = "host"
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
      if (room.host.id === playerId) {
        if (room.rpsHostChoice === null) {
          room.rpsHostChoice = choice
          addPlayerElapsed(room, "host")
        }
      } else if (room.guest.id === playerId) {
        if (room.rpsGuestChoice === null) {
          room.rpsGuestChoice = choice
          addPlayerElapsed(room, "guest")
        }
      } else {
        return NextResponse.json({ error: "Non membre" }, { status: 403 })
      }

      if (room.rpsHostChoice && room.rpsGuestChoice) {
        const roundWinner = evalRps(room.rpsHostChoice, room.rpsGuestChoice)
        room.rpsLastRound = {
          host: room.rpsHostChoice,
          guest: room.rpsGuestChoice,
          winner: roundWinner,
        }
        if (roundWinner === "host") room.rpsHostScore += 1
        if (roundWinner === "guest") room.rpsGuestScore += 1

        room.rpsHostChoice = null
        room.rpsGuestChoice = null
        room.rpsRound += 1

        if (room.rpsHostScore >= room.rpsTarget) {
          room.rpsWinner = "host"
          room.status = "finished"
          room.host.wins += 1
        } else if (room.rpsGuestScore >= room.rpsTarget) {
          room.rpsWinner = "guest"
          room.status = "finished"
          room.guest.wins += 1
        }
      }
      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room: sanitizeRoomForPlayer(room, playerId) })
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

      room.updatedAt = now
      await saveRoom(room)
      return NextResponse.json({ room })
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
