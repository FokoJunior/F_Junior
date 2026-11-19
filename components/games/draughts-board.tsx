"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
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
import {
  playDraughtsCapture,
  playDraughtsKing,
  playDraughtsMove,
  playDraughtsSelect,
} from "@/lib/game-sound"
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
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

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

  // Move previewed on hover or by single forced move
  const previewMove = useMemo(() => {
    if (hoveredKey && destMap.has(hoveredKey)) {
      return destMap.get(hoveredKey) ?? null
    }
    if (movesFromSelected.length === 1 && movesFromSelected[0].captures.length > 0) {
      return movesFromSelected[0]
    }
    return null
  }, [destMap, hoveredKey, movesFromSelected])

  // Set of enemy piece coordinates targeted for capture in current preview
  const previewCapturesSet = useMemo(() => {
    const set = new Set<string>()
    if (previewMove) {
      for (const [r, c] of previewMove.captures) {
        set.add(`${r},${c}`)
      }
    }
    return set
  }, [previewMove])

  // Coordinates of pieces captured in the last played move (trace)
  const lastCapturedSet = useMemo(() => {
    const set = new Set<string>()
    if (state.lastMove?.capturedSquares) {
      for (const [r, c] of state.lastMove.capturedSquares) {
        set.add(`${r},${c}`)
      }
    }
    return set
  }, [state.lastMove?.capturedSquares])

  const counts = useMemo(() => countDraughtsPieces(state.board), [state.board])

  const handleSquareClick = (r: number, c: number) => {
    if (!canPlay) return
    const key = `${r},${c}`

    // Execute move if clicking a highlighted destination
    const chosenMove = destMap.get(key)
    if (chosenMove) {
      setSelected(null)
      setHoveredKey(null)
      if (chosenMove.promotes) {
        playDraughtsKing()
      } else if (chosenMove.captures.length > 0) {
        playDraughtsCapture(chosenMove.captures.length)
      } else {
        playDraughtsMove()
      }
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate(chosenMove.captures.length > 0 ? 25 : 12)
        }
      } catch {}
      onMove(chosenMove)
      return
    }

    // Select a movable piece of the current player
    if (movableFromSet.has(key)) {
      if (selected && selected[0] === r && selected[1] === c) {
        setSelected(null)
        setHoveredKey(null)
      } else {
        playDraughtsSelect()
        setSelected([r, c])
        setHoveredKey(null)
      }
      return
    }

    setSelected(null)
    setHoveredKey(null)
  }

  // Board display rows/cols according to orientation
  const rows = orientation === "w" ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  const cols = orientation === "w" ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

  // Convert (r, c) on board to SVG 0..100 coordinates
  const getSvgCoord = (r: number, c: number): [number, number] => {
    const x = (orientation === "w" ? c : 9 - c) * 10 + 5
    const y = (orientation === "w" ? r : 9 - r) * 10 + 5
    return [x, y]
  }

  const buildSvgPath = (points: [number, number][]): string => {
    if (points.length < 2) return ""
    return points
      .map(([r, c], i) => {
        const [x, y] = getSvgCoord(r, c)
        return `${i === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  const lastMovePath = state.lastMove?.path ?? (state.lastMove ? [state.lastMove.from, state.lastMove.to] : [])
  const hasLastCaptures = (state.lastMove?.captures ?? 0) > 0

  const previewPath = previewMove?.path ?? []

  return (
    <div className="flex w-full max-w-[520px] flex-col items-center gap-3 select-none touch-manipulation">
      {/* Mandatory capture notice */}
      {mustCapture && canPlay && (
        <div className="w-full rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-center font-mono text-[11px] text-amber-600 dark:text-amber-400">
          ⚡ Prise obligatoire ({legalMoves[0].captures.length}{" "}
          {legalMoves[0].captures.length > 1 ? "pions — rafle majoritaire !" : "pion"})
        </div>
      )}

      {/* 10x10 Board with SVG Trajectory Overlay */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-card p-1 shadow-md sm:p-1.5">
        {/* SVG Path Layer for Last Move & Previewed Move */}
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-1 z-20 h-[calc(100%-8px)] w-[calc(100%-8px)] sm:inset-1.5 sm:h-[calc(100%-12px)] sm:w-[calc(100%-12px)]"
        >
          <defs>
            <marker
              id="draughts-arrow-capture"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
            </marker>
            <marker
              id="draughts-arrow-move"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker
              id="draughts-arrow-preview"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* 1. Last move trajectory line & waypoints */}
          {lastMovePath.length >= 2 && (
            <g className="transition-opacity duration-300">
              <path
                d={buildSvgPath(lastMovePath)}
                fill="none"
                stroke={hasLastCaptures ? "#f43f5e" : "#38bdf8"}
                strokeWidth={hasLastCaptures ? "1.4" : "1.2"}
                strokeDasharray={hasLastCaptures ? "2.5 1.5" : "none"}
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={hasLastCaptures ? "url(#draughts-arrow-capture)" : "url(#draughts-arrow-move)"}
                opacity={hasLastCaptures ? 0.9 : 0.75}
              />
              {lastMovePath.map(([pr, pc], idx) => {
                const [px, py] = getSvgCoord(pr, pc)
                return (
                  <circle
                    key={`last-waypoint-${idx}`}
                    cx={px}
                    cy={py}
                    r={idx === 0 ? 1.6 : 1.2}
                    fill={hasLastCaptures ? "#f43f5e" : "#38bdf8"}
                    opacity="0.9"
                  />
                )
              })}
            </g>
          )}

          {/* 2. Previewed move trajectory line & waypoints */}
          {previewPath.length >= 2 && (
            <g>
              <path
                d={buildSvgPath(previewPath)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="2 1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd="url(#draughts-arrow-preview)"
                opacity="0.95"
              />
              {previewPath.map(([pr, pc], idx) => {
                const [px, py] = getSvgCoord(pr, pc)
                return (
                  <circle
                    key={`preview-waypoint-${idx}`}
                    cx={px}
                    cy={py}
                    r={idx === 0 ? 1.6 : 1.2}
                    fill="#f59e0b"
                    opacity="0.95"
                  />
                )
              })}
            </g>
          )}
        </svg>

        {/* The 10x10 Grid */}
        <div
          className="relative z-10 grid h-full w-full"
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
              const isLastCaptured = lastCapturedSet.has(key)
              const isTargetedCapture = previewCapturesSet.has(key)

              return (
                <button
                  key={key}
                  type="button"
                  disabled={!dark || (!isMovable && !destMove && !isSel)}
                  onClick={() => handleSquareClick(r, c)}
                  onMouseEnter={() => destMove && setHoveredKey(key)}
                  onMouseLeave={() => hoveredKey === key && setHoveredKey(null)}
                  aria-label={`Case ${r + 1}-${c + 1}`}
                  className={cn(
                    "relative flex items-center justify-center transition-colors",
                    dark
                      ? "bg-[#253047] dark:bg-[#1e2738]"
                      : "bg-[#dce3f0] dark:bg-[#2f3b52]/55",
                    (isLastFrom || isLastTo) && dark && "bg-primary/35",
                    isLastCaptured && dark && "bg-rose-950/45 ring-1 ring-inset ring-rose-500/50",
                    isSel && "bg-primary/55 ring-2 ring-inset ring-primary",
                    destMove && "cursor-pointer hover:bg-emerald-500/25",
                    isMovable && !isSel && "cursor-pointer",
                  )}
                >
                  {/* Origin ghost outline for last move */}
                  {isLastFrom && !piece && (
                    <span className="pointer-events-none absolute h-[32%] w-[32%] rounded-full border-2 border-dashed border-primary/60 opacity-80" />
                  )}

                  {/* Ghost capture marker ("Trace de la bouffe") with ripple */}
                  {isLastCaptured && !piece && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="absolute h-[62%] w-[62%] rounded-full bg-rose-500/25 animate-ping opacity-60" />
                      <span className="relative flex h-[50%] w-[50%] items-center justify-center rounded-full border border-rose-500/80 bg-rose-500/25 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                        <span className="font-mono text-[10px] font-black sm:text-xs">✕</span>
                      </span>
                    </div>
                  )}

                  {/* Destination highlight dot / badge with capture count */}
                  {destMove && !piece && (
                    <span
                      className={cn(
                        "relative z-10 flex items-center justify-center rounded-full shadow-sm transition-transform",
                        destMove.captures.length > 0
                          ? "h-[44%] w-[44%] bg-amber-400 ring-4 ring-amber-400/40 text-slate-950 font-mono text-[10px] font-black"
                          : "h-[34%] w-[34%] bg-primary ring-4 ring-primary/30",
                      )}
                    >
                      {destMove.captures.length > 0 && (
                        <span>+{destMove.captures.length}</span>
                      )}
                    </span>
                  )}

                  {/* Sculpted 3D Piece with smooth Framer Motion entrance & hover scale */}
                  <AnimatePresence mode="wait">
                    {piece && pSide && (
                      <motion.span
                        key={`piece-${pSide}-${king ? "k" : "p"}`}
                        layout
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{
                          scale: isSel ? 1.12 : isTargetedCapture ? 1.05 : 1,
                          opacity: 1,
                          y: isSel ? -2 : 0,
                        }}
                        exit={{ scale: 0.2, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 26 }}
                        className={cn(
                          "relative flex h-[78%] w-[78%] items-center justify-center rounded-full border-2 transition-shadow duration-150",
                          pSide === "w"
                            ? "border-slate-200 bg-gradient-to-br from-white via-slate-100 to-slate-300 text-slate-900 shadow-[inset_0_2px_3px_rgba(255,255,255,0.95),0_3px_6px_rgba(0,0,0,0.5)]"
                            : "border-amber-300/70 bg-gradient-to-br from-slate-700 via-slate-900 to-black text-amber-400 shadow-[inset_0_2px_3px_rgba(255,255,255,0.25),0_3px_6px_rgba(0,0,0,0.7)]",
                          isSel && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                          isTargetedCapture && "ring-4 ring-rose-500 bg-rose-500/30 animate-pulse",
                          isMovable && mustCapture && !isSel && "ring-2 ring-amber-400 animate-pulse",
                          isLastTo && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                        )}
                      >
                        {/* Target badge when piece is going to be eaten */}
                        {isTargetedCapture && (
                          <span className="pointer-events-none absolute -top-1 -right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-sm ring-1 ring-white">
                            ✕
                          </span>
                        )}

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
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )
            }),
          )}
        </div>
      </div>

      {/* Last Capture Info banner if pieces were eaten */}
      {state.lastMove && state.lastMove.captures > 0 && (
        <div className="flex w-full items-center justify-between rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1 font-mono text-xs text-rose-500 dark:text-rose-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              ✕
            </span>
            <span>
              Dernière prise : <strong>{state.lastMove.captures} pion{state.lastMove.captures > 1 ? "s" : ""}</strong> mangé{state.lastMove.captures > 1 ? "s" : ""} (tracé et cases marqués)
            </span>
          </span>
        </div>
      )}

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
