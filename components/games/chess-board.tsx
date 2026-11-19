"use client"

import { useMemo, useState } from "react"
import { Chess, type Square } from "chess.js"

import { cn } from "@/lib/utils"

interface ChessBoardProps {
  fen: string
  orientation?: "w" | "b"
  interactive?: boolean
  allowedColor?: "w" | "b" | "both"
  lastMove?: { from: string; to: string } | null
  onMove: (from: string, to: string) => void
}

const PIECE_GLYPHS: Record<string, string> = {
  wp: "♙",
  wn: "♘",
  wb: "♗",
  wr: "♖",
  wq: "♕",
  wk: "♔",
  bp: "♟",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
  bk: "♚",
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"]
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"]

export default function ChessBoard({
  fen,
  orientation = "w",
  interactive = true,
  allowedColor = "both",
  lastMove = null,
  onMove,
}: ChessBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null)

  const chess = useMemo(() => {
    try {
      return new Chess(fen)
    } catch {
      return new Chess()
    }
  }, [fen])

  const turn = chess.turn()
  const inCheck = chess.inCheck()

  const legalTargets = useMemo(() => {
    if (!selected) return new Map<string, boolean>()
    const moves = chess.moves({ square: selected, verbose: true })
    const map = new Map<string, boolean>()
    for (const m of moves) {
      map.set(m.to, Boolean(m.captured))
    }
    return map
  }, [chess, selected])

  const files = orientation === "w" ? FILES : [...FILES].reverse()
  const ranks = orientation === "w" ? RANKS : [...RANKS].reverse()

  const canControlTurn = interactive && (allowedColor === "both" || allowedColor === turn)

  const handleSquareClick = (sq: Square) => {
    if (!canControlTurn) return

    // If clicking a legal target for the selected piece -> execute move
    if (selected && legalTargets.has(sq)) {
      const from = selected
      setSelected(null)
      onMove(from, sq)
      return
    }

    const piece = chess.get(sq)
    if (piece && piece.color === turn) {
      setSelected(selected === sq ? null : sq)
    } else {
      setSelected(null)
    }
  }

  return (
    <div className="w-full max-w-[520px] overflow-hidden rounded-md border border-border shadow-sm select-none touch-manipulation">
      <div className="grid aspect-square w-full grid-cols-8 grid-rows-8">
        {ranks.map((rank, rIdx) =>
          files.map((file, fIdx) => {
            const sq = `${file}${rank}` as Square
            const isLight = (FILES.indexOf(file) + Number(rank)) % 2 === 1
            const piece = chess.get(sq)
            const isSelected = selected === sq
            const isTarget = legalTargets.has(sq)
            const isCaptureTarget = legalTargets.get(sq) === true
            const isLastMove = lastMove?.from === sq || lastMove?.to === sq
            const isCheckedKing = inCheck && piece?.type === "k" && piece?.color === turn

            return (
              <button
                key={sq}
                type="button"
                onClick={() => handleSquareClick(sq)}
                aria-label={`${sq}${piece ? ` ${piece.color}${piece.type}` : ""}`}
                className={cn(
                  "relative flex items-center justify-center transition-colors",
                  isLight
                    ? "bg-[#e2e8f0] dark:bg-[#2a3346]"
                    : "bg-[#94a3b8] dark:bg-[#171d29]",
                  isLastMove && "bg-primary/35 dark:bg-primary/35",
                  isSelected && "bg-primary/55 dark:bg-primary/55",
                  isCheckedKing && "bg-destructive/65 dark:bg-destructive/65",
                  canControlTurn && (piece?.color === turn || isTarget) && "cursor-pointer",
                )}
              >
                {/* Rank coordinate on left column */}
                {fIdx === 0 && (
                  <span
                    className={cn(
                      "pointer-events-none absolute left-0.5 top-0.5 font-mono text-[9px] font-semibold leading-none opacity-60 sm:text-[10px]",
                      isLight ? "text-slate-700 dark:text-slate-300" : "text-slate-100 dark:text-slate-400",
                    )}
                  >
                    {rank}
                  </span>
                )}

                {/* File coordinate on bottom row */}
                {rIdx === 7 && (
                  <span
                    className={cn(
                      "pointer-events-none absolute bottom-0.5 right-0.5 font-mono text-[9px] font-semibold leading-none opacity-60 sm:text-[10px]",
                      isLight ? "text-slate-700 dark:text-slate-300" : "text-slate-100 dark:text-slate-400",
                    )}
                  >
                    {file}
                  </span>
                )}

                {/* Legal move indicator */}
                {isTarget && !isCaptureTarget && (
                  <span className="pointer-events-none h-3 w-3 rounded-full bg-primary/80 shadow-sm sm:h-3.5 sm:w-3.5" />
                )}
                {isTarget && isCaptureTarget && (
                  <span className="pointer-events-none absolute inset-1 rounded-full border-[3px] border-primary/85" />
                )}

                {/* Piece */}
                {piece && (
                  <span
                    className={cn(
                      "pointer-events-none text-[clamp(1.6rem,6.5vw,2.75rem)] leading-none",
                      piece.color === "w"
                        ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_0_1px_rgba(0,0,0,0.95)]"
                        : "text-slate-950 [text-shadow:0_1px_2px_rgba(255,255,255,0.45)]",
                    )}
                  >
                    {PIECE_GLYPHS[`${piece.color}${piece.type}`]}
                  </span>
                )}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
