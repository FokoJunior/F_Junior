"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Eye, Hash, ImagePlus, RotateCcw, Trophy } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type GridSize = 3 | 4 | 5

const SCORE_KEY = "fj_game_best_puzzle"

const PRESETS: { id: string; label: string; src: string }[] = [
  {
    id: "cobalt",
    label: "Cobalt",
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#0f172a"/>
              <stop offset="50%" stop-color="#1d4ed8"/>
              <stop offset="100%" stop-color="#38bdf8"/>
            </linearGradient>
            <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fbbf24"/>
              <stop offset="100%" stop-color="#f97316"/>
            </linearGradient>
          </defs>
          <rect width="600" height="600" fill="url(#bg)"/>
          <circle cx="430" cy="170" r="95" fill="url(#sun)"/>
          <path d="M0 420 L180 240 L340 380 L470 260 L600 410 L600 600 L0 600 Z" fill="#0f172a" opacity="0.88"/>
          <path d="M0 490 L140 370 L290 470 L440 350 L600 480 L600 600 L0 600 Z" fill="#1e3a8a" opacity="0.85"/>
          <circle cx="120" cy="120" r="6" fill="#fff" opacity="0.8"/>
          <circle cx="230" cy="80" r="4" fill="#fff" opacity="0.6"/>
          <circle cx="310" cy="140" r="5" fill="#fff" opacity="0.7"/>
          <text x="48" y="552" font-family="Georgia, serif" font-size="56" fill="#ffffff" opacity="0.9">F_Junior</text>
        </svg>`,
      ),
  },
  {
    id: "sunset",
    label: "Douala",
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
          <defs>
            <linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#312e81"/>
              <stop offset="55%" stop-color="#be185d"/>
              <stop offset="100%" stop-color="#f59e0b"/>
            </linearGradient>
          </defs>
          <rect width="600" height="600" fill="url(#sbg)"/>
          <circle cx="300" cy="310" r="115" fill="#fde047" opacity="0.92"/>
          <rect y="360" width="600" height="240" fill="#1e1b4b" opacity="0.9"/>
          <rect x="80" y="395" width="440" height="10" rx="5" fill="#f59e0b" opacity="0.75"/>
          <rect x="140" y="428" width="320" height="8" rx="4" fill="#ec4899" opacity="0.7"/>
          <rect x="200" y="460" width="200" height="7" rx="3.5" fill="#fbbf24" opacity="0.6"/>
          <polygon points="40,360 110,250 180,360" fill="#0f172a"/>
          <polygon points="430,360 510,235 580,360" fill="#0f172a"/>
        </svg>`,
      ),
  },
  {
    id: "cyber",
    label: "Neon",
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
          <defs>
            <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#020617"/>
              <stop offset="100%" stop-color="#064e3b"/>
            </linearGradient>
          </defs>
          <rect width="600" height="600" fill="url(#cbg)"/>
          <rect x="70" y="70" width="210" height="210" rx="24" fill="#10b981" opacity="0.85"/>
          <rect x="320" y="70" width="210" height="210" rx="105" fill="#3b82f6" opacity="0.85"/>
          <rect x="70" y="320" width="210" height="210" rx="105" fill="#f59e0b" opacity="0.85"/>
          <rect x="320" y="320" width="210" height="210" rx="24" fill="#8b5cf6" opacity="0.85"/>
          <circle cx="300" cy="300" r="78" fill="#020617" stroke="#e2e8f0" stroke-width="10"/>
          <circle cx="300" cy="300" r="26" fill="#38bdf8"/>
        </svg>`,
      ),
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
  const steps = size * size * 18

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
    // Guarantee non-solved start
    const last = total - 1
    ;[tiles[last], tiles[last - 1]] = [tiles[last - 1], tiles[last]]
  }
  if (tiles.indexOf(emptyVal) === -1) return tiles
  return tiles
}

export default function PuzzleGame() {
  const { language } = useLanguage()
  const [size, setSize] = useState<GridSize>(3)
  const [imageSrc, setImageSrc] = useState<string>(PRESETS[0].src)
  const [customLabel, setCustomLabel] = useState<string | null>(null)
  const [tiles, setTiles] = useState<number[]>(() => shuffleSolvable(3))
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [solved, setSolved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showNumbers, setShowNumbers] = useState(true)
  const [bestMoves, setBestMoves] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)

  const emptyVal = size * size - 1

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
    if (!file) return
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result)
        setCustomLabel(file.name)
        restart(size)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const tryMoveTile = useCallback(
    (tileIdx: number) => {
      if (solved) return
      const emptyIdx = tiles.indexOf(emptyVal)
      const r1 = Math.floor(tileIdx / size)
      const c1 = tileIdx % size
      const r2 = Math.floor(emptyIdx / size)
      const c2 = emptyIdx % size
      const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1
      if (!isAdjacent) return

      if (!started) setStarted(true)
      const next = [...tiles]
      ;[next[tileIdx], next[emptyIdx]] = [next[emptyIdx], next[tileIdx]]
      const nextMoves = moves + 1
      setTiles(next)
      setMoves(nextMoves)

      if (isSolved(next)) {
        setSolved(true)
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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
  }

  const sizeOptions: { val: GridSize; label: string }[] = useMemo(
    () => [
      { val: 3, label: "3×3" },
      { val: 4, label: "4×4" },
      { val: 5, label: "5×5" },
    ],
    [],
  )

  return (
    <div className="mx-auto flex w-full max-w-[540px] flex-col items-center gap-4 sm:gap-5">
      {/* Photo Import + Presets */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="btn btn-solid h-9 cursor-pointer px-3.5 text-xs">
            <ImagePlus className="h-3.5 w-3.5" />
            {language === "fr" ? "Importer une photo" : "Import photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImportPhoto}
              className="sr-only"
            />
          </label>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setImageSrc(p.src)
                setCustomLabel(null)
                restart(size)
              }}
              data-active={!customLabel && imageSrc === p.src}
              className="chip h-8"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {sizeOptions.map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => restart(opt.val)}
              data-active={size === opt.val}
              className="chip h-8 px-2.5"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats + helper toggles */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-border bg-background px-3 py-1.5 text-center">
            <p className="eyebrow">{language === "fr" ? "Coups" : "Moves"}</p>
            <p className="font-mono text-lg font-semibold tabular-nums">{moves}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-1.5 text-center">
            <p className="eyebrow">{language === "fr" ? "Temps" : "Time"}</p>
            <p className="font-mono text-lg font-semibold tabular-nums">{formatTime(seconds)}</p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-1.5 text-center">
            <p className="eyebrow inline-flex items-center gap-1">
              <Trophy className="h-3 w-3 text-primary" />
              {tr(gamesCopy.record, language)}
            </p>
            <p className="font-mono text-lg font-semibold tabular-nums">{bestMoves ?? "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            data-active={showPreview}
            className="chip h-9"
            title={language === "fr" ? "Voir l'image originale" : "Peek original image"}
          >
            <Eye className="h-3.5 w-3.5" />
            {language === "fr" ? "Modèle" : "Peek"}
          </button>
          <button
            type="button"
            onClick={() => setShowNumbers((v) => !v)}
            data-active={showNumbers}
            className="chip h-9 px-2.5"
            title={language === "fr" ? "Afficher les numéros" : "Show tile numbers"}
          >
            <Hash className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => restart(size)}
            className="btn btn-outline h-9 px-3"
            aria-label={tr(gamesCopy.restart, language)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Puzzle Board */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted/50 p-1.5 sm:p-2">
        {showPreview ? (
          <div className="relative h-full w-full overflow-hidden rounded">
            <img src={imageSrc} alt="Original puzzle" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="btn btn-solid absolute bottom-3 right-3 h-9 px-4 text-xs"
            >
              {language === "fr" ? "Retour au puzzle" : "Back to puzzle"}
            </button>
          </div>
        ) : (
          <div
            className="grid h-full w-full gap-1"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {tiles.map((tileVal, idx) => {
              const isEmpty = tileVal === emptyVal && !solved
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
                    "relative overflow-hidden rounded-sm transition-transform duration-150 select-none touch-manipulation",
                    isEmpty
                      ? "border border-dashed border-border/60 bg-background/40"
                      : "border border-background/20 shadow-sm active:scale-[0.97]",
                  )}
                  style={
                    isEmpty
                      ? undefined
                      : {
                          backgroundImage: `url("${imageSrc}")`,
                          backgroundSize: `${size * 100}% ${size * 100}%`,
                          backgroundPosition: `${posX}% ${posY}%`,
                        }
                  }
                >
                  {!isEmpty && showNumbers && !solved && (
                    <span className="absolute left-1 top-1 rounded bg-background/75 px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground backdrop-blur-sm">
                      {tileVal + 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {solved && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center backdrop-blur-sm">
            <p className="eyebrow text-primary">
              {language === "fr" ? "Puzzle complété ! 🎉" : "Puzzle solved! 🎉"}
            </p>
            <p className="font-serif text-3xl sm:text-4xl">
              {moves} {language === "fr" ? "coups" : "moves"} · {formatTime(seconds)}
            </p>
            {isNewBest && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
                <Trophy className="h-3.5 w-3.5" />
                {tr(gamesCopy.newRecord, language)}
              </span>
            )}
            <button type="button" onClick={() => restart(size)} className="btn btn-solid mt-1">
              <RotateCcw className="h-4 w-4" />
              {tr(gamesCopy.restart, language)}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
