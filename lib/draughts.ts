export type DraughtsSide = "w" | "b"
export type DraughtsPiece = "w" | "W" | "b" | "B" | null

export interface DraughtsMove {
  from: [number, number]
  to: [number, number]
  /** Full landing path (length >= 2: [from, ..., to]) */
  path: [number, number][]
  /** Coordinates of captured opponent pieces along this move */
  captures: [number, number][]
  promotes: boolean
}

export interface DraughtsState {
  /** 10x10 board: 'w'/'W' = white pawn/king (host), 'b'/'B' = black pawn/king (guest) */
  board: DraughtsPiece[][]
  turn: DraughtsSide
  winner: DraughtsSide | "draw" | null
  lastMove: { from: [number, number]; to: [number, number]; captures: number } | null
  movesWithoutCapture: number
  lastEvent: string | null
}

const SIZE = 10
const DIRS: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
]

export function pieceSide(p: DraughtsPiece): DraughtsSide | null {
  if (!p) return null
  return p === "w" || p === "W" ? "w" : "b"
}

export function isKing(p: DraughtsPiece): boolean {
  return p === "W" || p === "B"
}

export function isDarkSquare(r: number, c: number): boolean {
  return (r + c) % 2 === 1
}

export function createInitialDraughtsState(): DraughtsState {
  const board: DraughtsPiece[][] = Array.from({ length: SIZE }, () => Array<DraughtsPiece>(SIZE).fill(null))
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!isDarkSquare(r, c)) continue
      if (r < 4) board[r][c] = "b"
      else if (r >= 6) board[r][c] = "w"
    }
  }
  return {
    board,
    turn: "w",
    winner: null,
    lastMove: null,
    movesWithoutCapture: 0,
    lastEvent: null,
  }
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE
}

function cloneBoard(board: DraughtsPiece[][]): DraughtsPiece[][] {
  return board.map((row) => [...row])
}

/**
 * Recursively find all complete capture chains starting from (r, c) for piece `piece`.
 * Follows FMJD International Draughts rules:
 * - Pawns capture both forward and backward (1-square jump).
 * - Flying Kings capture at any distance along a diagonal and may land on any empty square beyond.
 * - Already-captured pieces in the same chain cannot be jumped a second time.
 */
function findCaptureChains(
  board: DraughtsPiece[][],
  r: number,
  c: number,
  piece: Exclude<DraughtsPiece, null>,
  capturedSet: Set<string>,
  path: [number, number][],
  captures: [number, number][],
): DraughtsMove[] {
  const side = pieceSide(piece)!
  const king = isKing(piece)
  const results: DraughtsMove[] = []

  for (const [dr, dc] of DIRS) {
    if (!king) {
      const mr = r + dr
      const mc = c + dc
      const lr = r + dr * 2
      const lc = c + dc * 2
      if (!inBounds(lr, lc)) continue
      const midPiece = board[mr][mc]
      const midKey = `${mr},${mc}`
      if (midPiece && pieceSide(midPiece) !== side && !capturedSet.has(midKey) && board[lr][lc] === null) {
        const nextSet = new Set(capturedSet)
        nextSet.add(midKey)
        const nextBoard = cloneBoard(board)
        nextBoard[r][c] = null
        nextBoard[lr][lc] = piece
        const nextPath: [number, number][] = [...path, [lr, lc]]
        const nextCaps: [number, number][] = [...captures, [mr, mc]]
        const deeper = findCaptureChains(nextBoard, lr, lc, piece, nextSet, nextPath, nextCaps)
        if (deeper.length > 0) {
          results.push(...deeper)
        } else {
          results.push({
            from: path[0],
            to: [lr, lc],
            path: nextPath,
            captures: nextCaps,
            promotes: !king && ((side === "w" && lr === 0) || (side === "b" && lr === SIZE - 1)),
          })
        }
      }
    } else {
      // Flying king: scan along diagonal for first occupied square
      let cr = r + dr
      let cc = c + dc
      while (inBounds(cr, cc) && board[cr][cc] === null) {
        cr += dr
        cc += dc
      }
      if (!inBounds(cr, cc)) continue
      const targetPiece = board[cr][cc]
      const targetKey = `${cr},${cc}`
      if (!targetPiece || pieceSide(targetPiece) === side || capturedSet.has(targetKey)) continue

      // Every empty square beyond (cr, cc) along (dr, dc) is a potential landing square
      let lr = cr + dr
      let lc = cc + dc
      while (inBounds(lr, lc) && board[lr][lc] === null) {
        const nextSet = new Set(capturedSet)
        nextSet.add(targetKey)
        const nextBoard = cloneBoard(board)
        nextBoard[r][c] = null
        nextBoard[lr][lc] = piece
        const nextPath: [number, number][] = [...path, [lr, lc]]
        const nextCaps: [number, number][] = [...captures, [cr, cc]]
        const deeper = findCaptureChains(nextBoard, lr, lc, piece, nextSet, nextPath, nextCaps)
        if (deeper.length > 0) {
          results.push(...deeper)
        } else {
          results.push({
            from: path[0],
            to: [lr, lc],
            path: nextPath,
            captures: nextCaps,
            promotes: false,
          })
        }
        lr += dr
        lc += dc
      }
    }
  }

  return results
}

/**
 * Compute all legal FMJD International Draughts moves for `side`.
 * Enforces mandatory maximum capture (prise majoritaire).
 */
export function getLegalDraughtsMoves(board: DraughtsPiece[][], side: DraughtsSide): DraughtsMove[] {
  const allCaptures: DraughtsMove[] = []
  const allQuiet: DraughtsMove[] = []

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const piece = board[r][c]
      if (!piece || pieceSide(piece) !== side) continue

      // 1. Captures
      const chains = findCaptureChains(board, r, c, piece, new Set<string>(), [[r, c]], [])
      if (chains.length > 0) {
        allCaptures.push(...chains)
        continue
      }

      // 2. Quiet moves (only needed if no captures exist globally)
      if (allCaptures.length > 0) continue
      const king = isKing(piece)
      if (!king) {
        const forwardRow = side === "w" ? -1 : 1
        for (const dc of [-1, 1]) {
          const nr = r + forwardRow
          const nc = c + dc
          if (inBounds(nr, nc) && board[nr][nc] === null) {
            allQuiet.push({
              from: [r, c],
              to: [nr, nc],
              path: [
                [r, c],
                [nr, nc],
              ],
              captures: [],
              promotes: (side === "w" && nr === 0) || (side === "b" && nr === SIZE - 1),
            })
          }
        }
      } else {
        for (const [dr, dc] of DIRS) {
          let nr = r + dr
          let nc = c + dc
          while (inBounds(nr, nc) && board[nr][nc] === null) {
            allQuiet.push({
              from: [r, c],
              to: [nr, nc],
              path: [
                [r, c],
                [nr, nc],
              ],
              captures: [],
              promotes: false,
            })
            nr += dr
            nc += dc
          }
        }
      }
    }
  }

  if (allCaptures.length > 0) {
    // Official FMJD rule: mandatory maximum capture (prise majoritaire)
    const maxCap = Math.max(...allCaptures.map((m) => m.captures.length))
    return allCaptures.filter((m) => m.captures.length === maxCap)
  }

  return allQuiet
}

export function applyDraughtsMove(state: DraughtsState, move: DraughtsMove): DraughtsState {
  const nextBoard = cloneBoard(state.board)
  const [fr, fc] = move.from
  const [tr, tc] = move.to
  const piece = nextBoard[fr][fc]
  if (!piece) return state

  const side = pieceSide(piece)!
  nextBoard[fr][fc] = null
  for (const [cr, cc] of move.captures) {
    nextBoard[cr][cc] = null
  }
  const promotedPiece: DraughtsPiece =
    move.promotes ? (side === "w" ? "W" : "B") : piece
  nextBoard[tr][tc] = promotedPiece

  const nextTurn: DraughtsSide = side === "w" ? "b" : "w"
  const nextMoves = getLegalDraughtsMoves(nextBoard, nextTurn)
  const movesWithoutCapture = move.captures.length > 0 || !isKing(piece) ? 0 : state.movesWithoutCapture + 1

  let winner: DraughtsSide | "draw" | null = null
  let lastEvent: string | null = null

  if (nextMoves.length === 0) {
    winner = side
    lastEvent = side === "w" ? "Victoire des Blancs !" : "Victoire des Noirs !"
  } else if (movesWithoutCapture >= 50) {
    winner = "draw"
    lastEvent = "Match nul (règle des 25 coups sans prise)."
  } else if (move.captures.length > 1) {
    lastEvent = `Rafle de ${move.captures.length} pions !`
  } else if (move.promotes) {
    lastEvent = "Promotion en Dame !"
  }

  return {
    board: nextBoard,
    turn: nextTurn,
    winner,
    lastMove: { from: move.from, to: move.to, captures: move.captures.length },
    movesWithoutCapture,
    lastEvent,
  }
}

export function countDraughtsPieces(board: DraughtsPiece[][]): { w: number; b: number; wKings: number; bKings: number } {
  let w = 0
  let b = 0
  let wKings = 0
  let bKings = 0
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c]
      if (p === "w") w++
      else if (p === "W") {
        w++
        wKings++
      } else if (p === "b") b++
      else if (p === "B") {
        b++
        bKings++
      }
    }
  }
  return { w, b, wKings, bKings }
}

function evaluateDraughts(board: DraughtsPiece[][]): number {
  let score = 0
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c]
      if (!p) continue
      const centerBonus = 4 - Math.abs(4.5 - c)
      if (p === "w") score += 100 + (9 - r) * 6 + centerBonus * 3
      else if (p === "W") score += 360 + centerBonus * 5
      else if (p === "b") score -= 100 + r * 6 + centerBonus * 3
      else if (p === "B") score -= 360 + centerBonus * 5
    }
  }
  return score
}

function minimaxDraughts(
  state: DraughtsState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingWhite: boolean,
): number {
  if (depth === 0 || state.winner !== null) {
    if (state.winner === "w") return 100_000 + depth
    if (state.winner === "b") return -100_000 - depth
    if (state.winner === "draw") return 0
    return evaluateDraughts(state.board)
  }

  const moves = getLegalDraughtsMoves(state.board, state.turn)
  if (moves.length === 0) {
    return state.turn === "w" ? -100_000 : 100_000
  }

  if (maximizingWhite) {
    let best = -Infinity
    for (const m of moves) {
      const val = minimaxDraughts(applyDraughtsMove(state, m), depth - 1, alpha, beta, false)
      if (val > best) best = val
      if (best > alpha) alpha = best
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const m of moves) {
      const val = minimaxDraughts(applyDraughtsMove(state, m), depth - 1, alpha, beta, true)
      if (val < best) best = val
      if (best < beta) beta = best
      if (beta <= alpha) break
    }
    return best
  }
}

export function pickDraughtsAiMove(
  state: DraughtsState,
  level: "easy" | "normal" | "hard",
): DraughtsMove | null {
  const moves = getLegalDraughtsMoves(state.board, state.turn)
  if (moves.length === 0) return null
  if (moves.length === 1) return moves[0]

  if (level === "easy" && Math.random() < 0.65) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  const depth = level === "hard" ? 4 : level === "normal" ? 2 : 1
  const maximizing = state.turn === "w"
  let bestScore = maximizing ? -Infinity : Infinity
  let bestMoves: DraughtsMove[] = []

  for (const m of moves) {
    const val = minimaxDraughts(applyDraughtsMove(state, m), depth - 1, -Infinity, Infinity, !maximizing)
    if (maximizing ? val > bestScore : val < bestScore) {
      bestScore = val
      bestMoves = [m]
    } else if (val === bestScore) {
      bestMoves.push(m)
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? moves[0]
}
