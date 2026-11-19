"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  RotateCcw,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
  type LucideIcon,
} from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface CardSymbol {
  id: string
  label: string
  Icon: LucideIcon
}

interface CardItem {
  uid: number
  symbolId: string
  label: string
  Icon: LucideIcon
  flipped: boolean
  matched: boolean
}

const SYMBOLS: CardSymbol[] = [
  { id: "code", label: "Code", Icon: Code2 },
  { id: "terminal", label: "CLI", Icon: Terminal },
  { id: "cpu", label: "AI", Icon: Cpu },
  { id: "db", label: "SQL", Icon: Database },
  { id: "web", label: "Web", Icon: Globe },
  { id: "git", label: "Git", Icon: GitBranch },
  { id: "spark", label: "UI", Icon: Sparkles },
  { id: "sec", label: "Sec", Icon: Shield },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildDeck(pairCount: 6 | 8): CardItem[] {
  const chosen = SYMBOLS.slice(0, pairCount)
  const doubled = [...chosen, ...chosen]
  return shuffle(doubled).map((sym, idx) => ({
    uid: idx,
    symbolId: sym.id,
    label: sym.label,
    Icon: sym.Icon,
    flipped: false,
    matched: false,
  }))
}

export default function MemoryGame() {
  const { language } = useLanguage()
  const [pairs, setPairs] = useState<6 | 8>(8)
  const [cards, setCards] = useState<CardItem[]>(() => buildDeck(8))
  const [selected, setSelected] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [bestMoves, setBestMoves] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)

  const scoreKey = pairs === 8 ? "fj_game_best_memory" : "fj_game_best_memory_6"

  useEffect(() => {
    setBestMoves(readScore(scoreKey))
  }, [scoreKey])

  // Timer
  useEffect(() => {
    if (!started || completed) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [started, completed])

  const restart = useCallback(
    (nextPairs: 6 | 8 = pairs) => {
      setPairs(nextPairs)
      setCards(buildDeck(nextPairs))
      setSelected([])
      setLocked(false)
      setMoves(0)
      setSeconds(0)
      setStarted(false)
      setCompleted(false)
      setIsNewBest(false)
    },
    [pairs],
  )

  const handleFlip = (index: number) => {
    if (locked || completed) return
    const target = cards[index]
    if (target.flipped || target.matched) return

    if (!started) setStarted(true)

    const nextCards = cards.map((c, i) => (i === index ? { ...c, flipped: true } : c))
    const nextSelected = [...selected, index]
    setCards(nextCards)
    setSelected(nextSelected)

    if (nextSelected.length === 2) {
      const nextMoves = moves + 1
      setMoves(nextMoves)
      setLocked(true)

      const [firstIdx, secondIdx] = nextSelected
      const first = nextCards[firstIdx]
      const second = nextCards[secondIdx]

      if (first.symbolId === second.symbolId) {
        const matchedDeck = nextCards.map((c, i) =>
          i === firstIdx || i === secondIdx ? { ...c, matched: true } : c,
        )
        setCards(matchedDeck)
        setSelected([])
        setLocked(false)

        if (matchedDeck.every((c) => c.matched)) {
          setCompleted(true)
          const { best, isNew } = saveBestScore(scoreKey, nextMoves, true)
          setBestMoves(best)
          setIsNewBest(isNew)
        }
      } else {
        window.setTimeout(() => {
          setCards((curr) =>
            curr.map((c, i) => (i === firstIdx || i === secondIdx ? { ...c, flipped: false } : c)),
          )
          setSelected([])
          setLocked(false)
        }, 650)
      }
    }
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Difficulty & stats */}
      <div className="flex w-full max-w-[520px] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => restart(6)}
            data-active={pairs === 6}
            className="chip"
          >
            4×3 (6)
          </button>
          <button
            type="button"
            onClick={() => restart(8)}
            data-active={pairs === 8}
            className="chip"
          >
            4×4 (8)
          </button>
        </div>

        <button type="button" onClick={() => restart(pairs)} className="btn btn-outline h-9 px-4">
          <RotateCcw className="h-3.5 w-3.5" />
          {tr(gamesCopy.restart, language)}
        </button>
      </div>

      {/* Counters */}
      <div className="grid w-full max-w-[520px] grid-cols-3 gap-2.5 text-center">
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow">{language === "fr" ? "Coups" : "Moves"}</p>
          <p className="font-mono text-xl font-semibold tabular-nums">{moves}</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow">{language === "fr" ? "Temps" : "Time"}</p>
          <p className="font-mono text-xl font-semibold tabular-nums">{formatTime(seconds)}</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow inline-flex items-center gap-1">
            <Trophy className="h-3 w-3 text-primary" />
            {tr(gamesCopy.record, language)}
          </p>
          <p className="font-mono text-xl font-semibold tabular-nums">{bestMoves ?? "—"}</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="relative w-full max-w-[520px]">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {cards.map((card, idx) => {
            const revealed = card.flipped || card.matched
            const Icon = card.Icon
            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => handleFlip(idx)}
                aria-label={revealed ? card.label : `Card ${idx + 1}`}
                aria-pressed={revealed}
                className={cn(
                  "group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-md border transition-all duration-300",
                  card.matched
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : revealed
                      ? "border-foreground/40 bg-background text-foreground shadow-sm"
                      : "border-border bg-muted/60 text-muted-foreground hover:border-foreground/40 hover:bg-muted",
                )}
              >
                {revealed ? (
                  <>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">{card.label}</span>
                  </>
                ) : (
                  <span className="font-serif text-xl opacity-40 transition-opacity group-hover:opacity-80">
                    F<span className="text-primary">_</span>J
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {completed && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-5 text-center">
            <p className="font-serif text-3xl">
              {language === "fr"
                ? `Bravo ! Terminé en ${moves} coups`
                : `Well done! Finished in ${moves} moves`}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {language === "fr" ? `Temps : ${formatTime(seconds)}` : `Time: ${formatTime(seconds)}`}
            </p>
            {isNewBest && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
                <Trophy className="h-3.5 w-3.5" />
                {tr(gamesCopy.newRecord, language)}
              </span>
            )}
            <button type="button" onClick={() => restart(pairs)} className="btn btn-solid mt-1 h-10 px-5">
              <RotateCcw className="h-4 w-4" />
              {tr(gamesCopy.restart, language)}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
