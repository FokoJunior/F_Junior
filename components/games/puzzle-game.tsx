"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Check, Eye, Hash, HelpCircle, ImagePlus, RotateCcw, Sparkles, Trophy, Wand2 } from "lucide-react"

import GameEndBanner from "@/components/games/game-end-overlay"
import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { playClick, playMove, playScore } from "@/lib/game-sound"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type GridSize = 3 | 4 | 5

const SCORE_KEY = "fj_game_best_puzzle"

const SUNSET_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="40%" stop-color="#831843"/>
          <stop offset="70%" stop-color="#be185d"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#sbg)"/>
      <circle cx="300" cy="290" r="120" fill="#fef08a" opacity="0.95"/>
      <rect y="360" width="600" height="240" fill="#0f172a" opacity="0.95"/>
      <rect x="80" y="395" width="440" height="12" rx="6" fill="#f59e0b" opacity="0.8"/>
      <rect x="140" y="430" width="320" height="10" rx="5" fill="#ec4899" opacity="0.75"/>
      <rect x="200" y="465" width="200" height="8" rx="4" fill="#fbbf24" opacity="0.7"/>
      <polygon points="30,360 110,230 190,360" fill="#020617"/>
      <polygon points="410,360 490,210 570,360" fill="#020617"/>
      <text x="50%" y="555" text-anchor="middle" font-family="Georgia, serif" font-size="44" fill="#ffffff" opacity="0.9">DOUALA SUNSET</text>
    </svg>`,
  )

export interface PuzzlePreset {
  id: string
  labelFr: string
  labelEn: string
  type: "numbers" | "image"
  src: string
}

const PRESETS: PuzzlePreset[] = [
  {
    id: "chess",
    labelFr: "Échecs 3D",
    labelEn: "Chess 3D",
    type: "image",
    src: "/games/chess.jpg",
  },
  {
    id: "ludo",
    labelFr: "Ludo Royal",
    labelEn: "Ludo Royal",
    type: "image",
    src: "/games/ludo.jpg",
  },
  {
    id: "connect4",
    labelFr: "Puissance 4",
    labelEn: "Connect 4",
    type: "image",
    src: "/games/connect4.jpg",
  },
  {
    id: "arena",
    labelFr: "Cyber Arena",
    labelEn: "Cyber Arena",
    type: "image",
    src: "/arena-bg.jpg",
  },
  {
    id: "sunset",
    labelFr: "Douala Sunset",
    labelEn: "Douala Sunset",
    type: "image",
    src: SUNSET_SVG,
  },
  {
    id: "classic",
    labelFr: "Taquin Classique",
    labelEn: "Classic Numbers",
    type: "numbers",
    src: "",
  },
]

function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] !== i) return false
  }
  return true
}

/** Generate a guaranteed-solvable shuffle by applying valid random empty-slot moves. */
function shuffleSolvable(size: GridSize): number[] {
  const total = size * size
  const tiles = Array.from({ length: total }, (_, i) => i)
  const emptyVal = total - 1
  let emptyIdx = total - 1
  let prevIdx = -1
  const steps = size * size * 22

  for (let s = 0; s < steps; s++) {
    const r = Math.floor(emptyIdx / size)
    const c = emptyIdx % size
    const neighbors: number[] = []
    if (r > 0) neighbors.push((r - 1) * size + c)
    if (r < size - 1) neighbors.push((r + 1) * size + c)
    if (c > 0) neighbors.push(r * size + (c - 1))
    if (c < size - 1) neighbors.push(r * size + (c + 1))

    const filtered = neighbors.filter((n) => n !== prevIdx)
    const pick = filtered[Math.floor(Math.random() * filtered.length)] ?? neighbors[0]
    ;[tiles[emptyIdx], tiles[pick]] = [tiles[pick], tiles[emptyIdx]]
    prevIdx = emptyIdx
    emptyIdx = pick
  }

  if (isSolved(tiles)) {
    const last = total - 1
    ;[tiles[last], tiles[last - 1]] = [tiles[last - 1], tiles[last]]
  }
  return tiles
}

export default function PuzzleGame({ initialSize = 3 }: { initialSize?: GridSize } = {}) {
  const { language } = useLanguage()
  const [size, setSize] = useState<GridSize>(initialSize)
  const [activePreset, setActivePreset] = useState<PuzzlePreset>(PRESETS[0])
  const [customSrc, setCustomSrc] = useState<string | null>(null)
  const [customLabel, setCustomLabel] = useState<string | null>(null)
  const [tiles, setTiles] = useState<number[]>(() => shuffleSolvable(initialSize))
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [solved, setSolved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showMiniGuide, setShowMiniGuide] = useState(true)
  const [showNumbers, setShowNumbers] = useState(true)
  const [showCorrectDots, setShowCorrectDots] = useState(true)
  const [highlightMovable, setHighlightMovable] = useState(false)
  const [bestMoves, setBestMoves] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)

  const emptyVal = size * size - 1
  const effectiveImageSrc = customSrc ?? activePreset.src
  const isNumbersOnly = !customSrc && activePreset.type === "numbers"

  // Touch gesture support
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setBestMoves(readScore(SCORE_KEY))
  }, [])

  useEffect(() => {
    if (!started || solved) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [started, solved])

  const restart = useCallback(
    (nextSize: GridSize = size) => {
      setSize(nextSize)
      setTiles(shuffleSolvable(nextSize))
      setMoves(0)
      setSeconds(0)
      setStarted(false)
      setSolved(false)
      setIsNewBest(false)
    },
    [size],
  )

  const handleImportPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomSrc(reader.result)
        setCustomLabel(file.name)
        restart(size)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // Multi-tile sliding push: clicking any tile in the same row/col as the empty slot slides all tiles towards empty!
  const tryMoveTile = useCallback(
    (tileIdx: number) => {
      if (solved) return
      const emptyIdx = tiles.indexOf(emptyVal)
      const r1 = Math.floor(tileIdx / size)
      const c1 = tileIdx % size
      const r2 = Math.floor(emptyIdx / size)
      const c2 = emptyIdx % size

      // Must be in the same row or column
      if (r1 !== r2 && c1 !== c2) return

      if (!started) setStarted(true)
      const next = [...tiles]
      let movedCount = 0

      if (r1 === r2) {
        // Horizontal push
        const step = c1 < c2 ? 1 : -1
        for (let c = c2; c !== c1; c -= step) {
          const curr = r1 * size + c
          const prev = r1 * size + (c - step)
          next[curr] = next[prev]
          movedCount++
        }
        next[r1 * size + c1] = emptyVal
      } else {
        // Vertical push
        const step = r1 < r2 ? 1 : -1
        for (let r = r2; r !== r1; r -= step) {
          const curr = r * size + c1
          const prev = (r - step) * size + c1
          next[curr] = next[prev]
          movedCount++
        }
        next[r1 * size + c1] = emptyVal
      }

      playMove()
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate(10)
        }
      } catch {}

      const nextMoves = moves + movedCount
      setTiles(next)
      setMoves(nextMoves)

      if (isSolved(next)) {
        setSolved(true)
        playScore()
        try {
          if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            navigator.vibrate([60, 60, 120])
          }
        } catch {}
        const { best, isNew } = saveBestScore(SCORE_KEY, nextMoves, true)
        setBestMoves(best)
        setIsNewBest(isNew)
      }
    },
    [emptyVal, moves, size, solved, started, tiles],
  )

  // Arrow keys support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (solved) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      const emptyIdx = tiles.indexOf(emptyVal)
      const er = Math.floor(emptyIdx / size)
      const ec = emptyIdx % size
      let targetIdx = -1
      if (e.key === "ArrowUp" && er < size - 1) targetIdx = (er + 1) * size + ec
      else if (e.key === "ArrowDown" && er > 0) targetIdx = (er - 1) * size + ec
      else if (e.key === "ArrowLeft" && ec < size - 1) targetIdx = er * size + (ec + 1)
      else if (e.key === "ArrowRight" && ec > 0) targetIdx = er * size + (ec - 1)

      if (targetIdx !== -1) {
        e.preventDefault()
        tryMoveTile(targetIdx)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [emptyVal, size, solved, tiles, tryMoveTile])

  // Touch Swipe Support on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1 || solved) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    const threshold = 28
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return

    const emptyIdx = tiles.indexOf(emptyVal)
    const er = Math.floor(emptyIdx / size)
    const ec = emptyIdx % size

    let targetIdx = -1
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && ec > 0) targetIdx = er * size + (ec - 1)
      else if (dx < 0 && ec < size - 1) targetIdx = er * size + (ec + 1)
    } else {
      if (dy > 0 && er > 0) targetIdx = (er - 1) * size + ec
      else if (dy < 0 && er < size - 1) targetIdx = (er + 1) * size + ec
    }

    if (targetIdx !== -1) {
      tryMoveTile(targetIdx)
    }
  }

  const triggerHint = () => {
    playClick()
    setHighlightMovable(true)
    window.setTimeout(() => setHighlightMovable(false), 2400)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
  }

  const sizeOptions: { val: GridSize; label: string; sub: string }[] = useMemo(
    () => [
      { val: 3, label: "3×3", sub: language === "fr" ? "8 tuiles" : "8 tiles" },
      { val: 4, label: "4×4", sub: language === "fr" ? "15 tuiles" : "15 tiles" },
      { val: 5, label: "5×5", sub: language === "fr" ? "24 tuiles" : "24 tiles" },
    ],
    [language],
  )

  // Determine movable tiles
  const emptyIdx = tiles.indexOf(emptyVal)
  const emptyRow = Math.floor(emptyIdx / size)
  const emptyCol = emptyIdx % size

  const isMovableTile = (idx: number) => {
    if (idx === emptyIdx) return false
    const r = Math.floor(idx / size)
    const c = idx % size
    return r === emptyRow || c === emptyCol
  }

  const isDirectNeighbor = (idx: number) => {
    if (idx === emptyIdx) return false
    const r = Math.floor(idx / size)
    const c = idx % size
    return Math.abs(r - emptyRow) + Math.abs(c - emptyCol) === 1
  }

  // Count correctly placed tiles
  const placedCount = useMemo(() => {
    return tiles.filter((val, i) => val === i && val !== emptyVal).length
  }, [tiles, emptyVal])

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-4 sm:gap-5">
      {/* Top Bar: Presets & Photo Import */}
      <div className="flex w-full flex-col gap-2.5 rounded-lg border border-border bg-card/80 p-3 sm:p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="btn btn-solid h-8 cursor-pointer px-3 text-xs shadow-sm">
              <ImagePlus className="h-3.5 w-3.5" />
              <span>{language === "fr" ? "Ma Photo" : "My Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImportPhoto}
                className="sr-only"
              />
            </label>
            {PRESETS.map((p) => {
              const isActive = !customSrc && activePreset.id === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setCustomSrc(null)
                    setCustomLabel(null)
                    setActivePreset(p)
                    restart(size)
                  }}
                  data-active={isActive}
                  className={cn(
                    "chip h-8 text-xs transition-all",
                    isActive && "bg-primary text-primary-foreground font-semibold shadow-sm",
                  )}
                >
                  {language === "fr" ? p.labelFr : p.labelEn}
                </button>
              )
            })}
          </div>

          {/* Grid Size selector */}
          <div className="inline-flex items-center rounded-full border border-border bg-background p-0.5">
            {sizeOptions.map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => restart(opt.val)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-[11px] uppercase transition-colors",
                  size === opt.val
                    ? "bg-primary font-bold text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title={opt.sub}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {customLabel && (
          <div className="flex items-center justify-between rounded-md bg-primary/10 px-2.5 py-1 text-xs text-primary">
            <span className="truncate font-mono">📷 {customLabel}</span>
            <button
              type="button"
              onClick={() => {
                setCustomSrc(null)
                setCustomLabel(null)
                restart(size)
              }}
              className="ml-2 font-mono text-[10px] underline hover:opacity-80"
            >
              {language === "fr" ? "Réinitialiser" : "Reset"}
            </button>
          </div>
        )}
      </div>

      {/* Stats row & Toolbar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-border bg-background px-3 py-1.5 text-center shadow-sm">
            <p className="eyebrow">{language === "fr" ? "Coups" : "Moves"}</p>
            <p className="font-mono text-lg font-bold tabular-nums text-foreground">{moves}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-1.5 text-center shadow-sm">
            <p className="eyebrow">{language === "fr" ? "Temps" : "Time"}</p>
            <p className="font-mono text-lg font-bold tabular-nums text-foreground">{formatTime(seconds)}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-1.5 text-center shadow-sm">
            <p className="eyebrow inline-flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" />
              {language === "fr" ? "Bien placés" : "Placed"}
            </p>
            <p className="font-mono text-lg font-bold tabular-nums text-emerald-500">
              {placedCount} / {emptyVal}
            </p>
          </div>
          <div className="hidden rounded-md border border-border bg-background px-3 py-1.5 text-center shadow-sm sm:block">
            <p className="eyebrow inline-flex items-center gap-1">
              <Trophy className="h-3 w-3 text-primary" />
              {tr(gamesCopy.record, language)}
            </p>
            <p className="font-mono text-lg font-bold tabular-nums text-primary">{bestMoves ?? "—"}</p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={triggerHint}
            title={language === "fr" ? "Indice : afficher les tuiles mobiles" : "Hint: highlight movable tiles"}
            className={cn(
              "btn btn-outline h-9 px-2.5 text-xs transition-colors",
              highlightMovable && "border-amber-500 bg-amber-500/15 text-amber-500 animate-pulse",
            )}
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{language === "fr" ? "Indice" : "Hint"}</span>
          </button>
          {!isNumbersOnly && (
            <button
              type="button"
              onClick={() => setShowMiniGuide((v) => !v)}
              data-active={showMiniGuide}
              className={cn(
                "btn btn-outline h-9 px-2.5 text-xs transition-colors",
                showMiniGuide && "border-primary bg-primary/10 text-primary",
              )}
              title={language === "fr" ? "Miniature d'aide en direct" : "Picture-in-picture guide"}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{language === "fr" ? "Guide" : "Guide"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowNumbers((v) => !v)}
            data-active={showNumbers}
            className={cn(
              "btn btn-outline h-9 w-9 p-0 text-xs transition-colors",
              showNumbers && "border-primary bg-primary/10 text-primary",
            )}
            title={language === "fr" ? "Afficher/Masquer les numéros" : "Show/hide numbers"}
          >
            <Hash className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowCorrectDots((v) => !v)}
            data-active={showCorrectDots}
            className={cn(
              "btn btn-outline h-9 w-9 p-0 text-xs transition-colors",
              showCorrectDots && "border-emerald-500 bg-emerald-500/10 text-emerald-500",
            )}
            title={language === "fr" ? "Indicateur de tuiles bien placées" : "Toggle correctly placed dots"}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => restart(size)}
            className="btn btn-outline h-9 w-9 p-0 transition-colors hover:border-primary hover:text-primary"
            title={tr(gamesCopy.restart, language)}
            aria-label={tr(gamesCopy.restart, language)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Puzzle Board Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-square w-full select-none overflow-hidden rounded-xl border-2 border-border bg-card/90 p-2 shadow-2xl sm:p-3"
      >
        {showPreview && !isNumbersOnly ? (
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <img src={effectiveImageSrc} alt="Original model" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="btn btn-solid absolute bottom-3 right-3 h-9 px-4 text-xs shadow-md"
            >
              {language === "fr" ? "Reprendre le puzzle" : "Back to puzzle"}
            </button>
          </div>
        ) : (
          <div
            className="grid h-full w-full gap-1.5 sm:gap-2"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {tiles.map((tileVal, idx) => {
              const isEmpty = tileVal === emptyVal && !solved
              const isCorrect = tileVal === idx && !isEmpty
              const isMovable = isMovableTile(idx)
              const isDirect = isDirectNeighbor(idx)

              // Compute image background slice
              const origRow = Math.floor(tileVal / size)
              const origCol = tileVal % size
              const posX = size > 1 ? (origCol / (size - 1)) * 100 : 0
              const posY = size > 1 ? (origRow / (size - 1)) * 100 : 0

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isEmpty || solved}
                  onClick={() => tryMoveTile(idx)}
                  aria-label={`Tile ${tileVal + 1}`}
                  className={cn(
                    "group relative overflow-hidden rounded-md border text-left transition-all duration-150 select-none touch-manipulation",
                    isEmpty && "border-2 border-dashed border-border/50 bg-background/25 opacity-40 shadow-inner",
                    !isEmpty &&
                      "cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.18)] active:scale-[0.96] hover:brightness-105",
                    !isEmpty &&
                      isCorrect &&
                      "border-emerald-500/40 ring-1 ring-emerald-500/20",
                    !isEmpty &&
                      !isCorrect &&
                      "border-border/70 hover:border-primary/60",
                    highlightMovable &&
                      isDirect &&
                      "ring-2 ring-amber-500 animate-pulse border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
                    highlightMovable &&
                      !isDirect &&
                      isMovable &&
                      "ring-1 ring-primary border-primary",
                  )}
                  style={
                    isEmpty
                      ? undefined
                      : isNumbersOnly
                        ? undefined
                        : {
                            backgroundImage: `url("${effectiveImageSrc}")`,
                            backgroundSize: `${size * 100}% ${size * 100}%`,
                            backgroundPosition: `${posX}% ${posY}%`,
                          }
                  }
                >
                  {/* Classic Numbers Only design */}
                  {isNumbersOnly && !isEmpty && (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-card via-card/90 to-muted/80 p-1">
                      <span className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground/90 transition-transform group-hover:scale-110">
                        {tileVal + 1}
                      </span>
                    </div>
                  )}

                  {/* Tile Number Badge overlay for Photo mode */}
                  {!isEmpty && !isNumbersOnly && showNumbers && !solved && (
                    <span className="absolute left-1.5 top-1.5 inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-background/85 font-mono text-[10px] sm:text-xs font-bold text-foreground shadow-sm backdrop-blur-sm">
                      {tileVal + 1}
                    </span>
                  )}

                  {/* Correct position emerald check indicator */}
                  {!isEmpty && showCorrectDots && isCorrect && !solved && (
                    <span
                      className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/90 text-[9px] font-bold text-white shadow-sm"
                      title={language === "fr" ? "Bien placé !" : "Placed!"}
                    >
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Floating Mini-Guide (Picture in Picture) in bottom corner */}
        {showMiniGuide && !isNumbersOnly && !showPreview && !solved && (
          <div
            onClick={() => setShowPreview(true)}
            title={language === "fr" ? "Cliquez pour agrandir le modèle" : "Click to enlarge model"}
            className="group absolute bottom-3 right-3 z-10 cursor-pointer overflow-hidden rounded-md border-2 border-primary/50 bg-background/90 p-1 shadow-xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded">
              <img src={effectiveImageSrc} alt="Thumbnail guide" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="mt-0.5 text-center font-mono text-[9px] text-muted-foreground group-hover:text-primary">
              {language === "fr" ? "Modèle" : "Guide"}
            </p>
          </div>
        )}

        {/* Victory celebration overlay */}
        {solved && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/85 p-4 backdrop-blur-md">
            <GameEndBanner
              show={solved}
              outcome="win"
              title={language === "fr" ? "Félicitations, Puzzle résolu !" : "Congratulations, Puzzle Solved!"}
              subtitle={`${moves} ${language === "fr" ? "coups" : "moves"} · ${formatTime(seconds)} · ${size}×${size}`}
              isNewRecord={isNewBest}
              primaryActionLabel={tr(gamesCopy.restart, language)}
              onPrimaryAction={() => restart(size)}
            />
          </div>
        )}
      </div>

      {/* Helpful tips bottom text */}
      <p className="text-center font-mono text-[11px] text-muted-foreground">
        💡 {language === "fr"
          ? "Astuce : Glissez avec le doigt ou cliquez sur n'importe quelle tuile de la même ligne/colonne pour pousser plusieurs tuiles d'un coup !"
          : "Tip: Swipe or click any tile in the same row/col to slide multiple tiles at once!"}
      </p>
    </div>
  )
}
