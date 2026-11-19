"use client"

import { useMemo, useState } from "react"
import { Crown } from "lucide-react"

import {
  countDraughtsPieces,
  getLegalDraughtsMoves,
  isDarkSquare,
  isKing,
  pieceSide,
  type DraughtsMove,
  type DraughtsSide,
  type DraughtsState,
} from "@/lib/draughts"
import { cn } from "@/lib/utils"

interface DraughtsBoardProps {
  state: DraughtsState
  orientation?: DraughtsSide
  canInteractSide: DraughtsSide | "both" | null
  onMove: (move: DraughtsMove) => void
  whiteLabel: string
  blackLabel: string
}

export default function DraughtsBoard({
  state,
  orientation = "w",
  canInteractSide,
  onMove,
  whiteLabel,
  blackLabel,
}: DraughtsBoardProps) {
  const [selected, setSelected] = useState<[number, number] | null>(null)

  const canPlay =
    !state.winner &&
    canInteractSide !== null &&
    (canInteractSide === "both" || canInteractSide === state.turn)

  const legalMoves = useMemo(
    () => (canPlay ? getLegalDraughtsMoves(state.board, state.turn) : []),
    [canPlay, state.board, state.turn],
  )

  const mustCapture = legalMoves.length > 0 && legalMoves[0].captures.length > 0

  const movableFromSet = useMemo(() => {
    const set = new Set<string>()
    for (const m of legalMoves) set.add(`${m.from[0]},${m.from[1]}`)
    return set
  }, [legalMoves])

  const movesFromSelected = useMemo(() => {
    if (!selected) return []
    return legalMoves.filter((m) => m.from[0] === selected[0] && m.from[1] === selected[1])
  }, [legalMoves, selected])

  const destMap = useMemo(() => {
    const map = new Map<string, DraughtsMove>()
    for (const m of movesFromSelected) {
      map.set(`${m.to[0]},${m.to[1]}`, m)
    }
    return map
  }, [movesFromSelected])

  const counts = useMemo(() => countDraughtsPieces(state.board), [state.board])

  const handleSquareClick = (r: number, c: number) => {
    if (!canPlay) return
    const key = `${r},${c}`

    // Execute move if clicking a highlighted destination
    const chosenMove = destMap.get(key)
    if (chosenMove) {
      setSelected(null)
      onMove(chosenMove)
      return
    }

    // Select a movable piece of the current player
    if (movableFromSet.has(key)) {
      if (selected && selected[0] === r && selected[1] === c) {
        setSelected(null)
      } else {
        setSelected([r, c])
      }
      return
    }

    setSelected(null)
  }

  const rows = orientation === "w" ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  const cols = orientation === "w" ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

  return (
    <div className="flex w-full max-w-[520px] flex-col items-center gap-3 select-none touch-manipulation">
      {/* Mandatory capture notice */}
      {mustCapture && canPlay && (
        <div className="w-full rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-center font-mono text-[11px] text-amber-600 dark:text-amber-400">
          ⚡ Prise obligatoire ({legalMoves[0].captures.length}{" "}
          {legalMoves[0].captures.length > 1 ? "pions — rafle majoritaire !" : "pion"})
        </div>
      )}

      {/* 10x10 Board */}
      <div className="aspect-square w-full overflow-hidden rounded-md border border-border bg-card p-1 shadow-md sm:p-1.5">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
            gridTemplateRows: "repeat(10, minmax(0, 1fr))",
          }}
        >
          {rows.map((r) =>
            cols.map((c) => {
              const dark = isDarkSquare(r, c)
              const piece = state.board[r][c]
              const pSide = pieceSide(piece)
              const king = isKing(piece)
              const key = `${r},${c}`
              const isSel = selected?.[0] === r && selected?.[1] === c
              const destMove = destMap.get(key)
              const isMovable = movableFromSet.has(key)
              const isLastFrom =
                state.lastMove?.from[0] === r && state.lastMove?.from[1] === c
              const isLastTo =
                state.lastMove?.to[0] === r && state.lastMove?.to[1] === c

              return (
                <button
                  key={key}
                  type="button"
                  disabled={!dark || (!isMovable && !destMove && !isSel)}
                  onClick={() => handleSquareClick(r, c)}
                  aria-label={`Case ${r + 1}-${c + 1}`}
                  className={cn(
                    "relative flex items-center justify-center transition-colors",
                    dark
                      ? "bg-[#253047] dark:bg-[#1e2738]"
                      : "bg-[#dce3f0] dark:bg-[#2f3b52]/55",
                    (isLastFrom || isLastTo) && dark && "bg-primary/35",
                    isSel && "bg-primary/55 ring-2 ring-inset ring-primary",
                    destMove && "cursor-pointer hover:bg-emerald-500/25",
                    isMovable && !isSel && "cursor-pointer",
                  )}
                >
                  {/* Destination highlight dot */}
                  {destMove && !piece && (
                    <span
                      className={cn(
                        "h-[34%] w-[34%] rounded-full shadow-sm transition-transform",
                        destMove.captures.length > 0
                          ? "bg-amber-400 ring-4 ring-amber-400/35"
                          : "bg-primary ring-4 ring-primary/30",
                      )}
                    />
                  )}

                  {/* Sculpted 3D Piece */}
                  {piece && pSide && (
                    <span
                      className={cn(
                        "relative flex h-[78%] w-[78%] items-center justify-center rounded-full border-2 transition-transform duration-150",
                        pSide === "w"
                          ? "border-slate-200 bg-gradient-to-br from-white via-slate-100 to-slate-300 text-slate-900 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_3px_5px_rgba(0,0,0,0.45)]"
                          : "border-amber-300/70 bg-gradient-to-br from-slate-700 via-slate-900 to-black text-amber-400 shadow-[inset_0_2px_3px_rgba(255,255,255,0.25),0_3px_5px_rgba(0,0,0,0.65)]",
                        isSel && "scale-110 ring-2 ring-primary",
                        isMovable && mustCapture && !isSel && "ring-2 ring-amber-400 animate-pulse",
                      )}
                    >
                      {/* Inner carved ring */}
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-[16%] rounded-full border",
                          pSide === "w" ? "border-slate-300/90" : "border-white/15",
                        )}
                      />
                      {king && (
                        <Crown
                          className={cn(
                            "relative z-10 h-[55%] w-[55%]",
                            pSide === "w" ? "fill-amber-400 text-amber-600" : "fill-amber-400 text-amber-300",
                          )}
                        />
                      )}
                    </span>
                  )}
                </button>
              )
            }),
          )}
        </div>
      </div>

      {/* Piece counters */}
      <div className="flex w-full items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-slate-300 bg-white" />
          {whiteLabel} : <strong className="text-foreground">{counts.w}</strong>
          {counts.wKings > 0 && <span className="text-amber-500">({counts.wKings}♛)</span>}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-amber-400/70 bg-slate-900" />
          {blackLabel} : <strong className="text-foreground">{counts.b}</strong>
          {counts.bKings > 0 && <span className="text-amber-500">({counts.bKings}♛)</span>}
        </span>
      </div>
    </div>
  )
}
