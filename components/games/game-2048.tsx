"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RotateCcw, Trophy, Undo2 } from "lucide-react"

import GameEndBanner from "@/components/games/game-end-overlay"
import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { playMove, playScore } from "@/lib/game-sound"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Grid = number[][]
type Direction = "LEFT" | "RIGHT" | "UP" | "DOWN"

const SIZE = 4
const SCORE_KEY = "fj_game_best_2048"

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function cloneGrid(g: Grid): Grid {
  return g.map((row) => [...row])
}

function spawnTile(grid: Grid): Grid {
  const next = cloneGrid(grid)
  const empties: [number, number][] = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (next[r][c] === 0) empties.push([r, c])
    }
  }
  if (empties.length === 0) return next
  const [r, c] = empties[Math.floor(Math.random() * empties.length)]
  next[r][c] = Math.random() < 0.9 ? 2 : 4
  return next
}

function createInitialGrid(): Grid {
  return spawnTile(spawnTile(emptyGrid()))
}

function slideRowLeft(row: number[]): { row: number[]; gained: number; moved: boolean } {
  const nonZero = row.filter((v) => v !== 0)
  const merged: number[] = []
  let gained = 0
  let i = 0
  while (i < nonZero.length) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const val = nonZero[i] * 2
      merged.push(val)
      gained += val
      i += 2
    } else {
      merged.push(nonZero[i])
      i += 1
    }
  }
  while (merged.length < SIZE) merged.push(0)
  const moved = merged.some((v, idx) => v !== row[idx])
  return { row: merged, gained, moved }
}

function transpose(grid: Grid): Grid {
  return grid[0].map((_, c) => grid.map((row) => row[c]))
}

function reverseRows(grid: Grid): Grid {
  return grid.map((row) => [...row].reverse())
}

function moveGrid(grid: Grid, dir: Direction): { grid: Grid; gained: number; moved: boolean } {
  let working = cloneGrid(grid)
  if (dir === "RIGHT") working = reverseRows(working)
  else if (dir === "UP") working = transpose(working)
  else if (dir === "DOWN") working = reverseRows(transpose(working))

  let totalGained = 0
  let anyMoved = false
  const slid = working.map((row) => {
    const res = slideRowLeft(row)
    totalGained += res.gained
    if (res.moved) anyMoved = true
    return res.row
  })

  let result = slid
  if (dir === "RIGHT") result = reverseRows(result)
  else if (dir === "UP") result = transpose(result)
  else if (dir === "DOWN") result = transpose(reverseRows(result))

  return { grid: result, gained: totalGained, moved: anyMoved }
}

function hasMoves(grid: Grid): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true
    }
  }
  return false
}

function hasValue(grid: Grid, target: number): boolean {
  return grid.some((row) => row.some((v) => v >= target))
}

function tileStyle(value: number): string {
  switch (value) {
    case 0:
      return "bg-muted/50 text-transparent border-transparent"
    case 2:
      return "bg-background text-foreground border-border"
    case 4:
      return "bg-secondary text-secondary-foreground border-border"
    case 8:
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
    case 16:
      return "bg-blue-500/25 text-blue-800 dark:text-blue-200 border-blue-500/40"
    case 32:
      return "bg-blue-600/80 text-white border-blue-600"
    case 64:
      return "bg-primary text-primary-foreground border-primary"
    case 128:
      return "bg-indigo-600 text-white border-indigo-500"
    case 256:
      return "bg-violet-600 text-white border-violet-500"
    case 512:
      return "bg-amber-500 text-slate-950 border-amber-400"
    case 1024:
      return "bg-orange-500 text-white border-orange-400"
    default:
      return "bg-foreground text-background border-foreground ring-2 ring-primary/50"
  }
}

export default function Game2048() {
  const { language } = useLanguage()
  const [grid, setGrid] = useState<Grid>(() => createInitialGrid())
  const [prevState, setPrevState] = useState<{ grid: Grid; score: number } | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [won, setWon] = useState(false)
  const [keepPlaying, setKeepPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setBest(saved)
  }, [])

  const restart = useCallback(() => {
    setGrid(createInitialGrid())
    setPrevState(null)
    setScore(0)
    setWon(false)
    setKeepPlaying(false)
    setGameOver(false)
  }, [])

  const undo = useCallback(() => {
    if (!prevState) return
    setGrid(prevState.grid)
    setScore(prevState.score)
    setGameOver(false)
    setPrevState(null)
  }, [prevState])

  const applyMove = useCallback(
    (dir: Direction) => {
      if (gameOver || (won && !keepPlaying)) return
      const res = moveGrid(grid, dir)
      if (!res.moved) return
      if (res.gained > 0) playScore()
      else playMove()

      setPrevState({ grid: cloneGrid(grid), score })
      const spawned = spawnTile(res.grid)
      const nextScore = score + res.gained
      setGrid(spawned)
      setScore(nextScore)

      const { best: updatedBest } = saveBestScore(SCORE_KEY, nextScore)
      setBest(updatedBest)

      if (!won && !keepPlaying && hasValue(spawned, 2048)) {
        setWon(true)
      } else if (!hasMoves(spawned)) {
        setGameOver(true)
      }
    },
    [gameOver, grid, keepPlaying, score, won],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      const map: Record<string, Direction> = {
        ArrowLeft: "LEFT",
        a: "LEFT",
        A: "LEFT",
        ArrowRight: "RIGHT",
        d: "RIGHT",
        D: "RIGHT",
        ArrowUp: "UP",
        w: "UP",
        W: "UP",
        ArrowDown: "DOWN",
        s: "DOWN",
        S: "DOWN",
      }
      const dir = map[e.key]
      if (dir) {
        e.preventDefault()
        applyMove(dir)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [applyMove])

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    touchStartRef.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    if (Math.abs(dx) > Math.abs(dy)) {
      applyMove(dx > 0 ? "RIGHT" : "LEFT")
    } else {
      applyMove(dy > 0 ? "DOWN" : "UP")
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full max-w-[520px] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-border bg-background px-3.5 py-2">
            <p className="eyebrow">{tr(gamesCopy.score, language)}</p>
            <p className="font-mono text-xl font-semibold tabular-nums">{score}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3.5 py-2">
            <p className="eyebrow inline-flex items-center gap-1">
              <Trophy className="h-3 w-3 text-primary" />
              {tr(gamesCopy.record, language)}
            </p>
            <p className="font-mono text-xl font-semibold tabular-nums">{best}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!prevState}
            className="btn btn-outline h-9 px-3.5"
            aria-label={language === "fr" ? "Annuler" : "Undo"}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={restart} className="btn btn-outline h-9 px-4">
            <RotateCcw className="h-3.5 w-3.5" />
            {tr(gamesCopy.restart, language)}
          </button>
        </div>
      </div>

      <div
        className="relative aspect-square w-full max-w-[520px] rounded-md border border-border bg-muted/40 p-3 sm:p-3.5 touch-none select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-2 sm:gap-2.5">
          {grid.flatMap((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={cn(
                  "flex items-center justify-center rounded-md border font-mono font-bold tabular-nums transition-all duration-150",
                  val >= 1024 ? "text-base sm:text-2xl" : val >= 128 ? "text-xl sm:text-3xl" : "text-2xl sm:text-4xl",
                  tileStyle(val),
                )}
              >
                {val > 0 ? val : ""}
              </div>
            )),
          )}
        </div>

        {(won && !keepPlaying) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/85 p-4 backdrop-blur-sm">
            <GameEndBanner
              show={won && !keepPlaying}
              outcome="win"
              title={
                language === "fr"
                  ? "2048 — Victoire !"
                  : language === "de"
                    ? "2048 — Gewonnen!"
                    : language === "zh"
                      ? "2048 — 恭喜通关！"
                      : "2048 — You win!"
              }
              subtitle={`${score} pts`}
              primaryActionLabel={tr(gamesCopy.resume, language)}
              onPrimaryAction={() => setKeepPlaying(true)}
              secondaryActionLabel={tr(gamesCopy.restart, language)}
              onSecondaryAction={restart}
            />
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/85 p-4 backdrop-blur-sm">
            <GameEndBanner
              show={gameOver}
              outcome="gameover"
              title={`${score} pts`}
              subtitle={tr(gamesCopy.gameOver, language)}
              primaryActionLabel={tr(gamesCopy.restart, language)}
              onPrimaryAction={restart}
            />
          </div>
        )}
      </div>

      <p className="font-mono text-xs text-muted-foreground">
        {language === "fr"
          ? "Astuce : utilisez les flèches du clavier, WASD ou glissez sur la grille."
          : "Tip: use Arrow keys, WASD, or swipe on the board."}
      </p>
    </div>
  )
}
