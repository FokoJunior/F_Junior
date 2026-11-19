export type LudoSide = "host" | "guest"

export interface LudoState {
  // Each player has 4 tokens: -1 = in base, 0..50 = outer track progress, 51..55 = home stretch, 56 = home
  hostTokens: [number, number, number, number]
  guestTokens: [number, number, number, number]
  turn: LudoSide
  dice: number | null
  hasRolled: boolean
  winner: LudoSide | null
  lastEvent: string | null
}

/** 52-cell clockwise outer track on a 15x15 grid (row 0..14, col 0..14). */
export const TRACK_COORDS: [number, number][] = [
  // Blue start arm (bottom-left going up col 6) — index 0 is Blue's start (13, 6)
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // Left arm bottom row going left
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // Left end going up
  [7, 0], [6, 0],
  // Left arm top row going right (index 13 is safe start)
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // Top arm left col going up
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // Top end going right
  [0, 7], [0, 8],
  // Top arm right col going down — index 26 is Amber's start (1, 8)
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // Right arm top row going right
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // Right end going down
  [7, 14], [8, 14],
  // Right arm bottom row going left (index 39 is safe start)
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // Bottom arm right col going down
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // Bottom end going left
  [14, 7], [14, 6],
]

export const SAFE_TRACK_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47])

export const START_OFFSET: Record<LudoSide, number> = {
  host: 0,
  guest: 26,
}

export const HOME_STRETCH_COORDS: Record<LudoSide, [number, number][]> = {
  // Blue goes up col 7 from row 13 -> 9
  host: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7],
  ],
  // Amber goes down col 7 from row 1 -> 5
  guest: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
  ],
}

export const BASE_COORDS: Record<LudoSide, [number, number][]> = {
  // Bottom-left yard (rows 9..14, cols 0..5)
  host: [
    [10, 1],
    [10, 4],
    [13, 1],
    [13, 4],
  ],
  // Top-right yard (rows 0..5, cols 9..14)
  guest: [
    [1, 10],
    [1, 13],
    [4, 10],
    [4, 13],
  ],
}

export const FINISH_COORDS: Record<LudoSide, [number, number]> = {
  host: [8, 7],
  guest: [6, 7],
}

export function createInitialLudoState(starter: LudoSide = "host"): LudoState {
  return {
    hostTokens: [-1, -1, -1, -1],
    guestTokens: [-1, -1, -1, -1],
    turn: starter,
    dice: null,
    hasRolled: false,
    winner: null,
    lastEvent: null,
  }
}

export function tokenToGlobalTrack(side: LudoSide, progress: number): number | null {
  if (progress < 0 || progress > 50) return null
  return (START_OFFSET[side] + progress) % 52
}

export function tokenToCoord(side: LudoSide, tokenIdx: number, progress: number): [number, number] {
  if (progress < 0) return BASE_COORDS[side][tokenIdx]
  if (progress <= 50) return TRACK_COORDS[(START_OFFSET[side] + progress) % 52]
  if (progress <= 55) return HOME_STRETCH_COORDS[side][progress - 51]
  return FINISH_COORDS[side]
}

export function getLegalLudoMoves(state: LudoState, side: LudoSide, dice: number): number[] {
  const tokens = side === "host" ? state.hostTokens : state.guestTokens
  const legal: number[] = []
  tokens.forEach((pos, idx) => {
    if (pos === -1) {
      if (dice === 6) legal.push(idx)
    } else if (pos < 56 && pos + dice <= 56) {
      legal.push(idx)
    }
  })
  return legal
}

export function applyLudoRoll(state: LudoState, side: LudoSide, rollValue: number, playerName: string): LudoState {
  const next: LudoState = {
    ...state,
    hostTokens: [...state.hostTokens] as [number, number, number, number],
    guestTokens: [...state.guestTokens] as [number, number, number, number],
    dice: rollValue,
    hasRolled: true,
    lastEvent: `${playerName} a fait ${rollValue} !`,
  }

  const legal = getLegalLudoMoves(next, side, rollValue)
  if (legal.length === 0) {
    next.turn = side === "host" ? "guest" : "host"
    next.hasRolled = false
    next.lastEvent = `${playerName} a fait ${rollValue} — aucun coup possible.`
  }
  return next
}

export function applyLudoMove(state: LudoState, side: LudoSide, tokenIdx: number, playerName: string): LudoState {
  if (!state.hasRolled || state.dice === null || state.turn !== side) return state
  const dice = state.dice
  const legal = getLegalLudoMoves(state, side, dice)
  if (!legal.includes(tokenIdx)) return state

  const next: LudoState = {
    ...state,
    hostTokens: [...state.hostTokens] as [number, number, number, number],
    guestTokens: [...state.guestTokens] as [number, number, number, number],
  }

  const myTokens = side === "host" ? next.hostTokens : next.guestTokens
  const oppTokens = side === "host" ? next.guestTokens : next.hostTokens
  const oppSide: LudoSide = side === "host" ? "guest" : "host"

  const oldPos = myTokens[tokenIdx]
  const newPos = oldPos === -1 ? 0 : oldPos + dice
  myTokens[tokenIdx] = newPos

  let captured = false
  const globalPos = tokenToGlobalTrack(side, newPos)
  if (globalPos !== null && !SAFE_TRACK_INDICES.has(globalPos)) {
    for (let i = 0; i < 4; i++) {
      const oppGlobal = tokenToGlobalTrack(oppSide, oppTokens[i])
      if (oppGlobal !== null && oppGlobal === globalPos) {
        oppTokens[i] = -1
        captured = true
      }
    }
  }

  const reachedHome = newPos === 56
  const allHome = myTokens.every((p) => p === 56)

  if (allHome) {
    next.winner = side
    next.hasRolled = false
    next.lastEvent = `${playerName} a rentré ses 4 pions ! 🏆`
    return next
  }

  const bonusTurn = dice === 6 || captured || reachedHome
  next.hasRolled = false
  if (bonusTurn) {
    next.turn = side
    next.lastEvent = captured
      ? `${playerName} capture un pion adverse ! Rejouez !`
      : reachedHome
        ? `${playerName} rentre un pion à la maison ! Rejouez !`
        : `${playerName} a fait 6 — tour bonus !`
  } else {
    next.turn = oppSide
    next.lastEvent = `${playerName} a avancé un pion.`
  }

  return next
}
