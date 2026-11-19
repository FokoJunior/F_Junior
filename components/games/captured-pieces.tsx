"use client"

import { useMemo } from "react"

import { countDraughtsPieces, type DraughtsPiece } from "@/lib/draughts"
import { cn } from "@/lib/utils"

const START_COUNTS: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 }
const VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }
const ORDER = ["q", "r", "b", "n", "p"]
const GLYPH_WHITE: Record<string, string> = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" }
const GLYPH_BLACK: Record<string, string> = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" }

/** Pieces missing from each side, derived from the FEN piece placement field. */
export function computeChessCaptures(fen: string) {
  const placement = fen.split(" ")[0] ?? ""
  const onBoard: Record<"w" | "b", Record<string, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
  }
  for (const ch of placement) {
    const lower = ch.toLowerCase()
    if (!(lower in START_COUNTS)) continue
    onBoard[ch === lower ? "b" : "w"][lower] += 1
  }
  const missing = (side: "w" | "b") => {
    const list: string[] = []
    for (const t of ORDER) {
      const diff = Math.max(0, START_COUNTS[t] - onBoard[side][t])
      for (let i = 0; i < diff; i++) list.push(t)
    }
    return list
  }
  const whiteLost = missing("w")
  const blackLost = missing("b")
  const val = (arr: string[]) => arr.reduce((s, t) => s + VALUES[t], 0)
  // Material currently on board (excluding kings) => advantage = difference of captured values
  const advantage = val(blackLost) - val(whiteLost) // > 0 : White ahead
  return { whiteLost, blackLost, advantage }
}

interface ChessCapturedBarProps {
  fen: string
  whiteLabel: string
  blackLabel: string
  className?: string
}

export function ChessCapturedBar({ fen, whiteLabel, blackLabel, className }: ChessCapturedBarProps) {
  const { whiteLost, blackLost, advantage } = useMemo(() => computeChessCaptures(fen), [fen])

  const Row = ({
    label,
    captured,
    glyphs,
    lead,
    dotClass,
  }: {
    label: string
    captured: string[]
    glyphs: Record<string, string>
    lead: number
    dotClass: string
  }) => (
    <div className="flex min-h-[28px] items-center justify-between gap-2">
      <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full border", dotClass)} />
        <span className="truncate">{label}</span>
      </span>
      <span className="flex min-w-0 flex-wrap items-center justify-end gap-x-0.5 text-lg leading-none text-foreground/90">
        {captured.length === 0 ? (
          <span className="font-mono text-[10px] text-muted-foreground/60">—</span>
        ) : (
          captured.map((t, i) => (
            <span key={`${t}-${i}`} className="-ml-0.5 first:ml-0">
              {glyphs[t]}
            </span>
          ))
        )}
        {lead > 0 && (
          <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
            +{lead}
          </span>
        )}
      </span>
    </div>
  )

  return (
    <div className={cn("w-full rounded-md border border-border bg-background px-3 py-2", className)}>
      {/* Pieces captured BY White = black pieces lost */}
      <Row
        label={`${whiteLabel} a pris`}
        captured={blackLost}
        glyphs={GLYPH_BLACK}
        lead={advantage > 0 ? advantage : 0}
        dotClass="border-slate-300 bg-white"
      />
      <Row
        label={`${blackLabel} a pris`}
        captured={whiteLost}
        glyphs={GLYPH_WHITE}
        lead={advantage < 0 ? -advantage : 0}
        dotClass="border-amber-400/70 bg-slate-900"
      />
    </div>
  )
}

interface DraughtsCapturedBarProps {
  board: DraughtsPiece[][]
  whiteLabel: string
  blackLabel: string
  className?: string
}

export function DraughtsCapturedBar({ board, whiteLabel, blackLabel, className }: DraughtsCapturedBarProps) {
  const counts = useMemo(() => countDraughtsPieces(board), [board])
  const whiteLost = 20 - counts.w // captured by Black
  const blackLost = 20 - counts.b // captured by White

  const Discs = ({ n, tone }: { n: number; tone: "w" | "b" }) => (
    <span className="flex min-w-0 flex-wrap items-center justify-end gap-0.5">
      {n === 0 ? (
        <span className="font-mono text-[10px] text-muted-foreground/60">—</span>
      ) : (
        Array.from({ length: n }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-3.5 w-3.5 rounded-full border shadow-sm",
              tone === "w"
                ? "border-slate-300 bg-gradient-to-br from-white to-slate-300"
                : "border-amber-300/70 bg-gradient-to-br from-slate-700 to-black",
            )}
          />
        ))
      )}
    </span>
  )

  const diff = blackLost - whiteLost

  return (
    <div className={cn("w-full rounded-md border border-border bg-background px-3 py-2", className)}>
      <div className="flex min-h-[28px] items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" />
          {whiteLabel} a pris
          <strong className="text-foreground">{blackLost}</strong>
          {diff > 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">+{diff}</span>
          )}
        </span>
        <Discs n={blackLost} tone="b" />
      </div>
      <div className="flex min-h-[28px] items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full border border-amber-400/70 bg-slate-900" />
          {blackLabel} a pris
          <strong className="text-foreground">{whiteLost}</strong>
          {diff < 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">+{-diff}</span>
          )}
        </span>
        <Discs n={whiteLost} tone="w" />
      </div>
    </div>
  )
}

/** Compact strip for a single player's captures in 1v1 Top/Bottom layout */
export function ChessPlayerCaptures({
  fen,
  side,
  className,
}: {
  fen: string
  side: "w" | "b"
  className?: string
}) {
  const { whiteLost, blackLost, advantage } = useMemo(() => computeChessCaptures(fen), [fen])
  // Pieces captured BY 'w' are black pieces lost
  const captured = side === "w" ? blackLost : whiteLost
  const glyphs = side === "w" ? GLYPH_BLACK : GLYPH_WHITE
  const lead = side === "w" ? (advantage > 0 ? advantage : 0) : advantage < 0 ? -advantage : 0

  if (captured.length === 0 && lead === 0) return null

  return (
    <div className={cn("inline-flex items-center gap-1 font-mono text-xs", className)}>
      <span className="flex flex-wrap items-center -space-x-0.5 text-base leading-none text-foreground/85">
        {captured.map((t, i) => (
          <span key={`${t}-${i}`}>{glyphs[t]}</span>
        ))}
      </span>
      {lead > 0 && (
        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
          +{lead}
        </span>
      )}
    </div>
  )
}

/** Compact strip for a single player's draughts captures in 1v1 Top/Bottom layout */
export function DraughtsPlayerCaptures({
  board,
  side,
  className,
}: {
  board: DraughtsPiece[][]
  side: "w" | "b"
  className?: string
}) {
  const counts = useMemo(() => countDraughtsPieces(board), [board])
  // Discs captured BY 'w' are black discs lost
  const taken = side === "w" ? 20 - counts.b : 20 - counts.w
  const oppTaken = side === "w" ? 20 - counts.w : 20 - counts.b
  const lead = taken - oppTaken

  if (taken === 0 && lead <= 0) return null

  return (
    <div className={cn("inline-flex items-center gap-1 font-mono text-xs", className)}>
      <span className="flex items-center -space-x-1">
        {Array.from({ length: Math.min(taken, 8) }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full border shadow-sm",
              side === "w"
                ? "border-amber-400/80 bg-slate-900"
                : "border-slate-300 bg-white",
            )}
          />
        ))}
        {taken > 8 && <span className="ml-1 text-[10px] text-muted-foreground">+{taken - 8}</span>}
      </span>
      {lead > 0 && (
        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
          +{lead}
        </span>
      )}
    </div>
  )
}
