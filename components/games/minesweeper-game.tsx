"use client"

import { useCallback, useEffect, useState } from "react"
import { Bomb, Flag, RotateCcw, Trophy } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface Cell {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adjacent: number
}

const SIZE = 9
const MINES = 10
const SCORE_KEY = "fj_game_best_minesweeper"

function emptyBoard(): Cell[][] {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  )
}

function populateMines(board: Cell[][], safeR: number, safeC: number): Cell[][] {
  const next = board.map((row) => row.map((c) => ({ ...c })))
  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * SIZE)
    const c = Math.floor(Math.random() * SIZE)
    if (next[r][c].mine) continue
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue
    next[r][c].mine = true
    placed++
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (next[r][c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && next[nr][nc].mine) {
            count++
          }
        }
      }
      next[r][c].adjacent = count
    }
  }
  return next
}

function floodReveal(board: Cell[][], r: number, c: number) {
  const stack: [number, number][] = [[r, c]]
  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!
    const cell = board[cr][cc]
    if (cell.revealed || cell.flagged) continue
    cell.revealed = true
    if (cell.adjacent === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = cr + dr
          const nc = cc + dc
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !board[nr][nc].revealed) {
            stack.push([nr, nc])
          }
        }
      }
    }
  }
}

const NUM_COLORS: Record<number, string> = {
  1: "text-blue-600 dark:text-blue-400",
  2: "text-emerald-600 dark:text-emerald-400",
  3: "text-rose-600 dark:text-rose-400",
  4: "text-indigo-600 dark:text-indigo-400",
  5: "text-amber-600 dark:text-amber-400",
  6: "text-cyan-600 dark:text-cyan-400",
  7: "text-foreground",
  8: "text-muted-foreground",
}

export default function MinesweeperGame() {
  const { language } = useLanguage()
  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard())
  const [initialized, setInitialized] = useState(false)
  const [flagMode, setFlagMode] = useState(false)
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "lost">("idle")
  const [seconds, setSeconds] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)

  useEffect(() => {
    setBestTime(readScore(SCORE_KEY))
  }, [])

  useEffect(() => {
    if (status !== "playing") return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [status])

  const restart = useCallback(() => {
    setBoard(emptyBoard())
    setInitialized(false)
    setStatus("idle")
    setSeconds(0)
    setIsNewBest(false)
  }, [])

  const toggleFlag = (r: number, c: number) => {
    if (status === "won" || status === "lost") return
    if (board[r][c].revealed) return
    const next = board.map((row) => row.map((cell) => ({ ...cell })))
    next[r][c].flagged = !next[r][c].flagged
    setBoard(next)
  }

  const handleCellClick = (r: number, c: number) => {
    if (status === "won" || status === "lost") return
    if (flagMode) {
      toggleFlag(r, c)
      return
    }
    if (board[r][c].flagged || board[r][c].revealed) return

    let working = board.map((row) => row.map((cell) => ({ ...cell })))
    if (!initialized) {
      working = populateMines(working, r, c)
      setInitialized(true)
      setStatus("playing")
    }

    if (working[r][c].mine) {
      for (const row of working) {
        for (const cell of row) {
          if (cell.mine) cell.revealed = true
        }
      }
      setBoard(working)
      setStatus("lost")
      return
    }

    floodReveal(working, r, c)
    setBoard(working)

    const safeRemaining = working.flat().some((cell) => !cell.mine && !cell.revealed)
    if (!safeRemaining) {
      setStatus("won")
      const elapsed = Math.max(2, seconds)
      const { best, isNew } = saveBestScore(SCORE_KEY, elapsed, true)
      setBestTime(best)
      setIsNewBest(isNew)
    }
  }

  const flagsCount = board.flat().filter((c) => c.flagged).length

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Controls & stats */}
      <div className="flex w-full max-w-[460px] flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-border bg-background px-3 py-1.5 text-center">
            <p className="eyebrow">Mines</p>
            <p className="font-mono text-lg font-semibold tabular-nums">{MINES - flagsCount}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-1.5 text-center">
            <p className="eyebrow">{language === "fr" ? "Temps" : "Time"}</p>
            <p className="font-mono text-lg font-semibold tabular-nums">{seconds} s</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-1.5 text-center">
            <p className="eyebrow inline-flex items-center gap-1">
              <Trophy className="h-3 w-3 text-primary" />
              {tr(gamesCopy.record, language)}
            </p>
            <p className="font-mono text-lg font-semibold tabular-nums">
              {bestTime !== null ? `${bestTime} s` : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFlagMode((v) => !v)}
            data-active={flagMode}
            className="chip h-9"
          >
            <Flag className="h-3.5 w-3.5" />
            {language === "fr" ? "Drapeau" : "Flag"}
          </button>
          <button type="button" onClick={restart} className="btn btn-outline h-9 px-3.5" aria-label={tr(gamesCopy.restart, language)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 9x9 Grid */}
      <div className="w-full max-w-[460px] rounded-md border border-border bg-muted/40 p-1.5 sm:p-2.5">
        <div className="grid grid-cols-9 gap-0.5 sm:gap-1">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  toggleFlag(r, c)
                }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded border font-mono text-sm font-bold transition-colors sm:text-base",
                  cell.revealed
                    ? cell.mine
                      ? "border-destructive bg-destructive/20 text-destructive"
                      : "border-border/60 bg-background"
                    : "border-border bg-card hover:border-primary/60 hover:bg-muted",
                )}
              >
                {cell.revealed ? (
                  cell.mine ? (
                    <Bomb className="h-4 w-4" />
                  ) : cell.adjacent > 0 ? (
                    <span className={NUM_COLORS[cell.adjacent]}>{cell.adjacent}</span>
                  ) : null
                ) : cell.flagged ? (
                  <Flag className="h-3.5 w-3.5 text-primary" />
                ) : null}
              </button>
            )),
          )}
        </div>
      </div>

      {(status === "won" || status === "lost") && (
        <div className="flex flex-col items-center gap-2.5 rounded-md border border-border bg-background px-6 py-4 text-center">
          <p className="font-serif text-2xl">
            {status === "won"
              ? language === "fr"
                ? `Zone déminée en ${seconds} s ! 🎉`
                : `Board cleared in ${seconds}s! 🎉`
              : language === "fr"
                ? "Boum ! Vous avez touché une mine."
                : "Boom! You hit a mine."}
          </p>
          {status === "won" && isNewBest && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
              <Trophy className="h-3.5 w-3.5" />
              {tr(gamesCopy.newRecord, language)}
            </span>
          )}
          <button type="button" onClick={restart} className="btn btn-solid h-9 px-5">
            <RotateCcw className="h-3.5 w-3.5" />
            {tr(gamesCopy.restart, language)}
          </button>
        </div>
      )}
    </div>
  )
}
