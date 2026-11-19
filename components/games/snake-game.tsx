"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw, Trophy } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"

type Point = { x: number; y: number }
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Status = "idle" | "playing" | "paused" | "over"

const GRID = 20
const SCORE_KEY = "fj_game_best_snake"

const OPPOSITE: Record<Dir, Dir> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
}

const DELTA: Record<Dir, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

function randomFood(snake: Point[]): Point {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`))
  const free: Point[] = []
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y })
    }
  }
  if (free.length === 0) return { x: 0, y: 0 }
  return free[Math.floor(Math.random() * free.length)]
}

function initialSnake(): Point[] {
  return [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]
}

export default function SnakeGame() {
  const { language } = useLanguage()
  const { resolvedTheme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const snakeRef = useRef<Point[]>(initialSnake())
  const foodRef = useRef<Point>({ x: 15, y: 10 })
  const dirRef = useRef<Dir>("RIGHT")
  const queueRef = useRef<Dir[]>([])

  const [status, setStatus] = useState<Status>("idle")
  const [score, setScore] = useState(0)
  const [best, setBest] = useState<number>(0)
  const [isNewBest, setIsNewBest] = useState(false)

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setBest(saved)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = canvas.clientWidth || 400
    if (canvas.width !== Math.round(size * dpr) || canvas.height !== Math.round(size * dpr)) {
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const isDark = resolvedTheme === "dark"
    const bg = isDark ? "#131720" : "#f8f9fc"
    const gridColor = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.055)"
    const headColor = isDark ? "#60a5fa" : "#2563eb"
    const bodyStart = isDark ? [96, 165, 250] : [37, 99, 235]
    const bodyEnd = isDark ? [148, 163, 184] : [100, 116, 139]
    const foodColor = isDark ? "#f97316" : "#ea580c"

    const cell = size / GRID

    // Background
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, size, size)

    // Subtle grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 1; i < GRID; i++) {
      const pos = Math.round(i * cell) + 0.5
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, size)
      ctx.moveTo(0, pos)
      ctx.lineTo(size, pos)
    }
    ctx.stroke()

    // Food (pulsing diamond / circle)
    const food = foodRef.current
    const fx = food.x * cell + cell / 2
    const fy = food.y * cell + cell / 2
    ctx.save()
    ctx.fillStyle = foodColor
    ctx.shadowColor = foodColor
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(fx, fy, cell * 0.34, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Snake
    const snake = snakeRef.current
    const pad = Math.max(1.5, cell * 0.1)
    snake.forEach((seg, idx) => {
      const t = snake.length > 1 ? idx / (snake.length - 1) : 0
      const r = Math.round(bodyStart[0] + (bodyEnd[0] - bodyStart[0]) * t)
      const g = Math.round(bodyStart[1] + (bodyEnd[1] - bodyStart[1]) * t)
      const b = Math.round(bodyStart[2] + (bodyEnd[2] - bodyStart[2]) * t)
      ctx.fillStyle = idx === 0 ? headColor : `rgb(${r},${g},${b})`

      const rx = seg.x * cell + pad
      const ry = seg.y * cell + pad
      const rw = cell - pad * 2
      const radius = idx === 0 ? cell * 0.28 : cell * 0.2

      ctx.beginPath()
      ctx.roundRect(rx, ry, rw, rw, radius)
      ctx.fill()

      // Eyes on head
      if (idx === 0) {
        ctx.fillStyle = isDark ? "#0b1120" : "#ffffff"
        const eyeR = Math.max(1.5, cell * 0.09)
        const dir = dirRef.current
        const cx = seg.x * cell + cell / 2
        const cy = seg.y * cell + cell / 2
        const fwd = cell * 0.18
        const side = cell * 0.17
        let e1: Point
        let e2: Point
        if (dir === "RIGHT") {
          e1 = { x: cx + fwd, y: cy - side }
          e2 = { x: cx + fwd, y: cy + side }
        } else if (dir === "LEFT") {
          e1 = { x: cx - fwd, y: cy - side }
          e2 = { x: cx - fwd, y: cy + side }
        } else if (dir === "UP") {
          e1 = { x: cx - side, y: cy - fwd }
          e2 = { x: cx + side, y: cy - fwd }
        } else {
          e1 = { x: cx - side, y: cy + fwd }
          e2 = { x: cx + side, y: cy + fwd }
        }
        ctx.beginPath()
        ctx.arc(e1.x, e1.y, eyeR, 0, Math.PI * 2)
        ctx.arc(e2.x, e2.y, eyeR, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }, [resolvedTheme])

  const resetGame = useCallback(
    (autoStart = true) => {
      const fresh = initialSnake()
      snakeRef.current = fresh
      foodRef.current = randomFood(fresh)
      dirRef.current = "RIGHT"
      queueRef.current = []
      setScore(0)
      setIsNewBest(false)
      setStatus(autoStart ? "playing" : "idle")
      draw()
    },
    [draw],
  )

  const enqueueDirection = useCallback(
    (next: Dir) => {
      if (status === "idle") {
        resetGame(true)
      }
      if (status === "paused") {
        setStatus("playing")
      }
      if (status === "over") return

      const lastPlanned = queueRef.current.length > 0 ? queueRef.current[queueRef.current.length - 1] : dirRef.current
      if (next !== lastPlanned && OPPOSITE[next] !== lastPlanned && queueRef.current.length < 2) {
        queueRef.current.push(next)
      }
    },
    [resetGame, status],
  )

  // Initial & theme redraw
  useEffect(() => {
    draw()
  }, [draw])

  // Resize observer for crisp canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => draw())
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [draw])

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      const keyMap: Record<string, Dir> = {
        ArrowUp: "UP",
        w: "UP",
        W: "UP",
        ArrowDown: "DOWN",
        s: "DOWN",
        S: "DOWN",
        ArrowLeft: "LEFT",
        a: "LEFT",
        A: "LEFT",
        ArrowRight: "RIGHT",
        d: "RIGHT",
        D: "RIGHT",
      }

      const mapped = keyMap[e.key]
      if (mapped) {
        if (status === "playing" || status === "paused") {
          e.preventDefault()
          enqueueDirection(mapped)
        }
        return
      }

      if (e.key === " " && (status === "playing" || status === "paused")) {
        e.preventDefault()
        setStatus((prev) => (prev === "playing" ? "paused" : "playing"))
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enqueueDirection, status])

  // Game tick loop
  useEffect(() => {
    if (status !== "playing") return

    const tickMs = Math.max(68, 138 - Math.floor(score / 2) * 5)
    const id = window.setInterval(() => {
      if (queueRef.current.length > 0) {
        dirRef.current = queueRef.current.shift()!
      }

      const snake = snakeRef.current
      const delta = DELTA[dirRef.current]
      const head = { x: snake[0].x + delta.x, y: snake[0].y + delta.y }

      const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID
      const willEat = head.x === foodRef.current.x && head.y === foodRef.current.y
      const bodyToCheck = willEat ? snake : snake.slice(0, -1)
      const hitSelf = bodyToCheck.some((seg) => seg.x === head.x && seg.y === head.y)

      if (hitWall || hitSelf) {
        setStatus("over")
        const currentScore = snake.length - 3
        if (currentScore > 0) {
          const { best: updatedBest, isNew } = saveBestScore(SCORE_KEY, currentScore)
          setBest(updatedBest)
          setIsNewBest(isNew)
        }
        draw()
        return
      }

      const nextSnake = [head, ...snake]
      if (willEat) {
        foodRef.current = randomFood(nextSnake)
        const nextScore = nextSnake.length - 3
        setScore(nextScore)
        const { best: updatedBest, isNew } = saveBestScore(SCORE_KEY, nextScore)
        setBest(updatedBest)
        if (isNew) setIsNewBest(true)
      } else {
        nextSnake.pop()
      }

      snakeRef.current = nextSnake
      draw()
    }, tickMs)

    return () => window.clearInterval(id)
  }, [draw, score, status])

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    touchStartRef.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    if (Math.abs(dx) > Math.abs(dy)) {
      enqueueDirection(dx > 0 ? "RIGHT" : "LEFT")
    } else {
      enqueueDirection(dy > 0 ? "DOWN" : "UP")
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Scoreboard bar */}
      <div className="flex w-full max-w-[560px] flex-wrap items-center justify-between gap-3">
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
          {status === "playing" && (
            <button type="button" onClick={() => setStatus("paused")} className="btn btn-outline h-9 px-4">
              <Pause className="h-3.5 w-3.5" />
              {tr(gamesCopy.pause, language)}
            </button>
          )}
          {status === "paused" && (
            <button type="button" onClick={() => setStatus("playing")} className="btn btn-solid h-9 px-4">
              <Play className="h-3.5 w-3.5" />
              {tr(gamesCopy.resume, language)}
            </button>
          )}
          <button type="button" onClick={() => resetGame(true)} className="btn btn-outline h-9 px-3.5" aria-label={tr(gamesCopy.restart, language)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas board */}
      <div
        className="relative aspect-square w-full max-w-[560px] overflow-hidden rounded-md border border-border shadow-sm touch-none select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />

        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 p-6 text-center backdrop-blur-sm">
            {status === "idle" && (
              <>
                <p className="font-serif text-3xl">Snake</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Utilisez les flèches, WASD ou glissez sur l'écran pour diriger le serpent."
                    : "Use Arrow keys, WASD, or swipe to steer the snake."}
                </p>
                <button type="button" onClick={() => resetGame(true)} className="btn btn-solid">
                  <Play className="h-4 w-4" />
                  {tr(gamesCopy.start, language)}
                </button>
              </>
            )}

            {status === "paused" && (
              <>
                <p className="font-serif text-3xl">{tr(gamesCopy.pause, language)}</p>
                <button type="button" onClick={() => setStatus("playing")} className="btn btn-solid">
                  <Play className="h-4 w-4" />
                  {tr(gamesCopy.resume, language)}
                </button>
              </>
            )}

            {status === "over" && (
              <>
                <p className="eyebrow text-destructive">{tr(gamesCopy.gameOver, language)}</p>
                <p className="font-serif text-4xl tabular-nums">{score} pts</p>
                {isNewBest && score > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
                    <Trophy className="h-3.5 w-3.5" />
                    {tr(gamesCopy.newRecord, language)}
                  </span>
                )}
                <button type="button" onClick={() => resetGame(true)} className="btn btn-solid">
                  <RotateCcw className="h-4 w-4" />
                  {tr(gamesCopy.restart, language)}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Touch / Click D-Pad */}
      <div className="grid grid-cols-3 gap-2.5 sm:hidden" aria-label="Directional controls">
        <div />
        <button
          type="button"
          onClick={() => enqueueDirection("UP")}
          className="grid h-14 w-14 touch-manipulation select-none place-items-center rounded-lg border border-border bg-background active:bg-primary active:text-primary-foreground"
          aria-label="Up"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
        <div />
        <button
          type="button"
          onClick={() => enqueueDirection("LEFT")}
          className="grid h-14 w-14 touch-manipulation select-none place-items-center rounded-lg border border-border bg-background active:bg-primary active:text-primary-foreground"
          aria-label="Left"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => enqueueDirection("DOWN")}
          className="grid h-14 w-14 touch-manipulation select-none place-items-center rounded-lg border border-border bg-background active:bg-primary active:text-primary-foreground"
          aria-label="Down"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => enqueueDirection("RIGHT")}
          className="grid h-14 w-14 touch-manipulation select-none place-items-center rounded-lg border border-border bg-background active:bg-primary active:text-primary-foreground"
          aria-label="Right"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
