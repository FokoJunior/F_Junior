"use client"

import { useMemo } from "react"
import { Dices, Star, Trophy } from "lucide-react"

import {
  getLegalLudoMoves,
  HOME_STRETCH_COORDS,
  SAFE_TRACK_INDICES,
  tokenToCoord,
  TRACK_COORDS,
  type LudoSide,
  type LudoState,
} from "@/lib/ludo"
import { cn } from "@/lib/utils"

interface LudoBoardProps {
  state: LudoState
  canInteractSide: LudoSide | "both" | null
  onRoll: () => void
  onMoveToken: (tokenIdx: number) => void
  rolling?: boolean
  hostLabel: string
  guestLabel: string
}

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]

export default function LudoBoard({
  state,
  canInteractSide,
  onRoll,
  onMoveToken,
  rolling = false,
  hostLabel,
  guestLabel,
}: LudoBoardProps) {
  const canControlTurn =
    !state.winner &&
    canInteractSide !== null &&
    (canInteractSide === "both" || canInteractSide === state.turn)

  const legalMoves = useMemo(() => {
    if (!canControlTurn || !state.hasRolled || state.dice === null) return new Set<number>()
    return new Set(getLegalLudoMoves(state, state.turn, state.dice))
  }, [canControlTurn, state])

  // Map grid coordinates "r,c" -> cell metadata
  const trackMap = useMemo(() => {
    const map = new Map<string, number>()
    TRACK_COORDS.forEach(([r, c], idx) => map.set(`${r},${c}`, idx))
    return map
  }, [])

  const hostHomeSet = useMemo(
    () => new Set(HOME_STRETCH_COORDS.host.map(([r, c]) => `${r},${c}`)),
    [],
  )
  const guestHomeSet = useMemo(
    () => new Set(HOME_STRETCH_COORDS.guest.map(([r, c]) => `${r},${c}`)),
    [],
  )

  // Group all tokens by "r,c"
  const tokensByCell = useMemo(() => {
    const map = new Map<string, { side: LudoSide; idx: number; progress: number }[]>()
    const add = (side: LudoSide, idx: number, progress: number) => {
      const [r, c] = tokenToCoord(side, idx, progress)
      const key = `${r},${c}`
      const list = map.get(key) || []
      list.push({ side, idx, progress })
      map.set(key, list)
    }
    state.hostTokens.forEach((p, idx) => add("host", idx, p))
    state.guestTokens.forEach((p, idx) => add("guest", idx, p))
    return map
  }, [state.guestTokens, state.hostTokens])

  const hostFinished = state.hostTokens.filter((p) => p === 56).length
  const guestFinished = state.guestTokens.filter((p) => p === 56).length

  return (
    <div className="flex w-full max-w-[520px] flex-col items-center gap-4 select-none touch-manipulation">
      {/* Dice & Turn Action Bar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3">
        <div className="min-w-0">
          <p className="eyebrow">
            {state.turn === "host" ? (
              <span className="text-primary">{hostLabel} (Bleu)</span>
            ) : (
              <span className="text-amber-500">{guestLabel} (Ambre)</span>
            )}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {state.lastEvent ||
              (state.hasRolled
                ? "Choisissez un pion lumineux à déplacer"
                : "Lancez le dé pour jouer")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {state.dice !== null && (
            <span
              className={cn(
                "grid h-11 w-11 place-items-center rounded-md border border-border bg-card text-3xl leading-none shadow-sm",
                rolling && "animate-bounce",
              )}
              aria-label={`Dé : ${state.dice}`}
            >
              {DICE_FACES[state.dice]}
            </span>
          )}

          <button
            type="button"
            disabled={!canControlTurn || state.hasRolled || rolling}
            onClick={onRoll}
            className="btn btn-solid h-10 px-4 text-xs"
          >
            <Dices className={cn("h-4 w-4", rolling && "animate-spin")} />
            Lancer le dé
          </button>
        </div>
      </div>

      {/* 15x15 Ludo Board */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-card p-1 shadow-sm sm:p-1.5">
        <div className="grid h-full w-full grid-cols-15 grid-rows-15 gap-[1px] bg-border/60" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))", gridTemplateRows: "repeat(15, minmax(0, 1fr))" }}>
          {Array.from({ length: 15 * 15 }, (_, flatIdx) => {
            const r = Math.floor(flatIdx / 15)
            const c = flatIdx % 15
            const key = `${r},${c}`

            const isTopLeftYard = r < 6 && c < 6
            const isTopRightYard = r < 6 && c >= 9
            const isBottomLeftYard = r >= 9 && c < 6
            const isBottomRightYard = r >= 9 && c >= 9
            const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8

            const trackIdx = trackMap.get(key)
            const isSafe = trackIdx !== undefined && SAFE_TRACK_INDICES.has(trackIdx)
            const isBlueStart = trackIdx === 0
            const isAmberStart = trackIdx === 26
            const isHostStretch = hostHomeSet.has(key)
            const isGuestStretch = guestHomeSet.has(key)

            const cellTokens = tokensByCell.get(key) || []

            let cellBg = "bg-background"
            if (isBottomLeftYard) cellBg = "bg-primary/15"
            else if (isTopRightYard) cellBg = "bg-amber-500/15"
            else if (isTopLeftYard || isBottomRightYard) cellBg = "bg-muted/40"
            else if (isCenter) cellBg = r === 7 && c === 7 ? "bg-foreground/10" : "bg-card"
            else if (isBlueStart || isHostStretch) cellBg = "bg-primary/30"
            else if (isAmberStart || isGuestStretch) cellBg = "bg-amber-500/30"

            return (
              <div
                key={key}
                className={cn("relative flex items-center justify-center", cellBg)}
              >
                {isSafe && cellTokens.length === 0 && (
                  <Star className="h-2.5 w-2.5 text-muted-foreground/60 sm:h-3 sm:w-3" />
                )}
                {r === 7 && c === 7 && (
                  <Trophy className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                )}

                {/* Render tokens in this cell */}
                {cellTokens.length > 0 && (
                  <div className="relative flex h-full w-full items-center justify-center">
                    {cellTokens.map((tok, i) => {
                      const isMovable =
                        tok.side === state.turn && legalMoves.has(tok.idx)
                      const offset =
                        cellTokens.length > 1 ? (i - (cellTokens.length - 1) / 2) * 3 : 0
                      return (
                        <button
                          key={`${tok.side}-${tok.idx}`}
                          type="button"
                          disabled={!isMovable}
                          onClick={() => isMovable && onMoveToken(tok.idx)}
                          style={{ transform: `translate(${offset}px, ${-offset}px)` }}
                          aria-label={`${tok.side} pion ${tok.idx + 1}`}
                          className={cn(
                            "absolute h-[72%] w-[72%] rounded-full border-2 shadow-sm transition-transform",
                            tok.side === "host"
                              ? "border-white bg-primary"
                              : "border-slate-950 bg-amber-400",
                            isMovable &&
                              "z-20 scale-110 cursor-pointer ring-2 ring-foreground animate-pulse",
                          )}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Home progress pills */}
      <div className="flex w-full items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          {hostLabel} : <strong className="text-foreground">{hostFinished}/4</strong>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          {guestLabel} : <strong className="text-foreground">{guestFinished}/4</strong>
        </span>
      </div>
    </div>
  )
}
