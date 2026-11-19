"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Heart, Pause, Play, RotateCcw, Trophy } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"

type Status = "idle" | "playing" | "paused" | "over"

interface Brick {
  x: number
  y: number
  w: number
  h: number
  row: number
  alive: boolean
}

const SCORE_KEY = "fj_game_best_breakout"
const W = 560
const H = 420
const COLS = 8
const ROWS = 5
const PADDLE_W = 96
const PADDLE_H = 12
const BALL_R = 7

function createBricks(): Brick[] {
  const padX = 20
  const gap = 8
  const brickW = (W - padX * 2 - gap * (COLS - 1)) / COLS
  const brickH = 20
  const topOffset = 42
  const list: Brick[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      list.push({
        x: padX + c * (brickW + gap),
        y: topOffset + r * (brickH + gap),
        w: brickW,
        h: brickH,
        row: r,
        alive: true,
      })
    }
  }
  return list
}

export default function BreakoutGame() {
  const { language } = useLanguage()
  const { resolvedTheme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [status, setStatus] = useState<Status>("idle")
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [isNewBest, setIsNewBest] = useState(false)

  const stateRef = useRef({
    paddleX: (W - PADDLE_W) / 2,
    ballX: W / 2,
    ballY: H - 56,
    dx: 3.4,
    dy: -3.6,
    bricks: createBricks(),
    score: 0,
    lives: 3,
    level: 1,
    leftPressed: false,
    rightPressed: false,
  })

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setBest(saved)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isDark = resolvedTheme === "dark"
    const bg = isDark ? "#131720" : "#f8f9fc"
    const paddleColor = isDark ? "#60a5fa" : "#2563eb"
    const ballColor = isDark ? "#f8fafc" : "#0f172a"
    const rowColors = isDark
      ? ["#3b82f6", "#6366f1", "#8b5cf6", "#f59e0b", "#10b981"]
      : ["#2563eb", "#4f46e5", "#7c3aed", "#d97706", "#059669"]

    const s = stateRef.current
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Bricks
    for (const b of s.bricks) {
      if (!b.alive) continue
      ctx.fillStyle = rowColors[b.row % rowColors.length]
      ctx.beginPath()
      ctx.roundRect(b.x, b.y, b.w, b.h, 4)
      ctx.fill()
    }

    // Paddle
    ctx.fillStyle = paddleColor
    ctx.beginPath()
    ctx.roundRect(s.paddleX, H - 28, PADDLE_W, PADDLE_H, 6)
    ctx.fill()

    // Ball
    ctx.fillStyle = ballColor
    ctx.beginPath()
    ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2)
    ctx.fill()
  }, [resolvedTheme])

  const resetBall = (lvl: number) => {
    const s = stateRef.current
    const speed = 3.6 + (lvl - 1) * 0.45
    const angle = (Math.random() * 0.6 - 0.3)
    s.paddleX = (W - PADDLE_W) / 2
    s.ballX = W / 2
    s.ballY = H - 56
    s.dx = Math.sin(angle) * speed + (Math.random() > 0.5 ? 1.8 : -1.8)
    s.dy = -speed
  }

  const startNewGame = useCallback(() => {
    const s = stateRef.current
    s.bricks = createBricks()
    s.score = 0
    s.lives = 3
    s.level = 1
    resetBall(1)
    setScore(0)
    setLives(3)
    setLevel(1)
    setIsNewBest(false)
    setStatus("playing")
    draw()
  }, [draw])

  useEffect(() => {
    draw()
  }, [draw])

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        stateRef.current.leftPressed = true
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        stateRef.current.rightPressed = true
      } else if (e.key === " " && (status === "playing" || status === "paused")) {
        e.preventDefault()
        setStatus((prev) => (prev === "playing" ? "paused" : "playing"))
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        stateRef.current.leftPressed = false
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        stateRef.current.rightPressed = false
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [status])

  // Animation loop
  useEffect(() => {
    if (status !== "playing") return
    let rafId = 0

    const step = () => {
      const s = stateRef.current
      if (s.leftPressed) s.paddleX = Math.max(0, s.paddleX - 6.5)
      if (s.rightPressed) s.paddleX = Math.min(W - PADDLE_W, s.paddleX + 6.5)

      s.ballX += s.dx
      s.ballY += s.dy

      // Wall bounce
      if (s.ballX - BALL_R < 0) {
        s.ballX = BALL_R
        s.dx = Math.abs(s.dx)
      } else if (s.ballX + BALL_R > W) {
        s.ballX = W - BALL_R
        s.dx = -Math.abs(s.dx)
      }
      if (s.ballY - BALL_R < 0) {
        s.ballY = BALL_R
        s.dy = Math.abs(s.dy)
      }

      // Paddle bounce
      const paddleTop = H - 28
      if (
        s.dy > 0 &&
        s.ballY + BALL_R >= paddleTop &&
        s.ballY - BALL_R <= paddleTop + PADDLE_H &&
        s.ballX >= s.paddleX - 4 &&
        s.ballX <= s.paddleX + PADDLE_W + 4
      ) {
        const hitPos = (s.ballX - (s.paddleX + PADDLE_W / 2)) / (PADDLE_W / 2)
        const speed = Math.min(7.5, Math.hypot(s.dx, s.dy) * 1.015)
        const maxAngle = Math.PI / 3
        const angle = hitPos * maxAngle
        s.dx = Math.sin(angle) * speed
        s.dy = -Math.cos(angle) * speed
        s.ballY = paddleTop - BALL_R
      }

      // Brick collisions
      for (const b of s.bricks) {
        if (!b.alive) continue
        if (
          s.ballX + BALL_R > b.x &&
          s.ballX - BALL_R < b.x + b.w &&
          s.ballY + BALL_R > b.y &&
          s.ballY - BALL_R < b.y + b.h
        ) {
          b.alive = false
          s.dy = -s.dy
          const pts = (ROWS - b.row) * 10
          s.score += pts
          setScore(s.score)
          const { best: updatedBest, isNew } = saveBestScore(SCORE_KEY, s.score)
          setBest(updatedBest)
          if (isNew) setIsNewBest(true)
          break
        }
      }

      // Level cleared
      if (s.bricks.every((b) => !b.alive)) {
        s.level += 1
        s.bricks = createBricks()
        setLevel(s.level)
        resetBall(s.level)
      }

      // Ball missed
      if (s.ballY - BALL_R > H) {
        s.lives -= 1
        setLives(s.lives)
        if (s.lives <= 0) {
          setStatus("over")
          draw()
          return
        }
        resetBall(s.level)
      }

      draw()
      rafId = window.requestAnimationFrame(step)
    }

    rafId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(rafId)
  }, [draw, status])

  const movePaddleToClientX = (clientX: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = W / rect.width
    const relX = (clientX - rect.left) * scaleX
    stateRef.current.paddleX = Math.max(0, Math.min(W - PADDLE_W, relX - PADDLE_W / 2))
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Header stats */}
      <div className="flex w-full max-w-[580px] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
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
          <div className="rounded-md border border-border bg-background px-3.5 py-2">
            <p className="eyebrow">Niv. {level}</p>
            <div className="mt-1 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <Heart
                  key={i}
                  className={i < lives ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4 text-muted-foreground/30"}
                />
              ))}
            </div>
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
          <button type="button" onClick={startNewGame} className="btn btn-outline h-9 px-3.5" aria-label={tr(gamesCopy.restart, language)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative aspect-[4/3] w-full max-w-[580px] overflow-hidden rounded-md border border-border shadow-sm touch-none select-none"
        onMouseMove={(e) => {
          if (status === "playing") movePaddleToClientX(e.clientX)
        }}
        onTouchStart={(e) => {
          if (status === "playing" && e.touches[0]) movePaddleToClientX(e.touches[0].clientX)
        }}
        onTouchMove={(e) => {
          if (status === "playing" && e.touches[0]) movePaddleToClientX(e.touches[0].clientX)
        }}
      >
        <canvas ref={canvasRef} width={W} height={H} className="block h-full w-full" />

        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 p-6 text-center backdrop-blur-sm">
            {status === "idle" && (
              <>
                <p className="font-serif text-3xl">{language === "fr" ? "Casse-Briques" : "Breakout"}</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Déplacez la raquette à la souris, au doigt ou avec les flèches ← →."
                    : "Move the paddle with mouse, touch, or ← → arrow keys."}
                </p>
                <button type="button" onClick={startNewGame} className="btn btn-solid">
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
                <button type="button" onClick={startNewGame} className="btn btn-solid">
                  <RotateCcw className="h-4 w-4" />
                  {tr(gamesCopy.restart, language)}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
