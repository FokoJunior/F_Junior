"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RotateCcw, Trophy, Zap } from "lucide-react"

import GameEndBanner from "@/components/games/game-end-overlay"
import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Phase = "idle" | "waiting" | "ready" | "tooSoon" | "result"

const SCORE_KEY = "fj_game_best_reaction"

export default function ReactionGame() {
  const { language } = useLanguage()
  const [phase, setPhase] = useState<Phase>("idle")
  const [lastMs, setLastMs] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<number[]>([])
  const [best, setBest] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)

  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    setBest(readScore(SCORE_KEY))
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const startRound = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    setIsNewBest(false)
    setPhase("waiting")
    const delay = 1400 + Math.random() * 2800
    timerRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now()
      setPhase("ready")
    }, delay)
  }, [])

  const trigger = useCallback(() => {
    if (phase === "idle" || phase === "tooSoon" || phase === "result") {
      startRound()
      return
    }

    if (phase === "waiting") {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      setPhase("tooSoon")
      return
    }

    if (phase === "ready") {
      const elapsed = Math.max(1, Math.round(performance.now() - startTimeRef.current))
      setLastMs(elapsed)
      setAttempts((prev) => [...prev.slice(-4), elapsed])
      const { best: updatedBest, isNew } = saveBestScore(SCORE_KEY, elapsed, true)
      setBest(updatedBest)
      setIsNewBest(isNew)
      setPhase("result")
    }
  }, [phase, startRound])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.code === "Space") {
        e.preventDefault()
        trigger()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [trigger])

  const average =
    attempts.length > 0 ? Math.round(attempts.reduce((sum, v) => sum + v, 0) / attempts.length) : null

  const rating = (ms: number) => {
    if (ms < 190) return language === "fr" ? "Éclair ⚡" : "Lightning ⚡"
    if (ms < 250) return language === "fr" ? "Très rapide" : "Very fast"
    if (ms < 320) return language === "fr" ? "Bon réflexe" : "Good reflex"
    return language === "fr" ? "Continuez !" : "Keep going!"
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Stats */}
      <div className="grid w-full max-w-[640px] grid-cols-3 gap-2.5 text-center">
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow">{language === "fr" ? "Dernier" : "Last"}</p>
          <p className="font-mono text-xl font-semibold tabular-nums">{lastMs !== null ? `${lastMs} ms` : "—"}</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow">{language === "fr" ? "Moyenne (5)" : "Avg (5)"}</p>
          <p className="font-mono text-xl font-semibold tabular-nums">{average !== null ? `${average} ms` : "—"}</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow inline-flex items-center gap-1">
            <Trophy className="h-3 w-3 text-primary" />
            {tr(gamesCopy.record, language)}
          </p>
          <p className="font-mono text-xl font-semibold tabular-nums">{best !== null ? `${best} ms` : "—"}</p>
        </div>
      </div>

      {/* Interactive Reaction Pad */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          trigger()
        }}
        onTouchStart={(e) => {
          e.preventDefault()
          trigger()
        }}
        className={cn(
          "flex min-h-[360px] w-full max-w-[640px] flex-col items-center justify-center gap-3 rounded-md border p-8 text-center transition-colors duration-150 select-none",
          phase === "idle" && "border-border bg-background hover:border-foreground/40",
          phase === "waiting" && "border-amber-500/50 bg-amber-500/15 text-foreground",
          phase === "ready" && "border-primary bg-primary text-primary-foreground",
          phase === "tooSoon" && "border-destructive/50 bg-destructive/15 text-foreground",
          phase === "result" && "border-border bg-background hover:border-foreground/40",
        )}
      >
        <Zap className={cn("h-8 w-8", phase === "ready" ? "text-primary-foreground" : "text-primary")} />

        {phase === "idle" && (
          <>
            <p className="font-serif text-3xl sm:text-4xl">
              {language === "fr" ? "Testez vos réflexes" : "Test your reflexes"}
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {language === "fr"
                ? "Cliquez ici ou appuyez sur Espace pour commencer."
                : "Click here or press Space to start."}
            </p>
          </>
        )}

        {phase === "waiting" && (
          <>
            <p className="font-serif text-3xl sm:text-4xl">
              {language === "fr" ? "Attendez le signal bleu…" : "Wait for the blue signal…"}
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {language === "fr" ? "Ne cliquez pas encore" : "Hold on"}
            </p>
          </>
        )}

        {phase === "ready" && (
          <>
            <p className="font-serif text-5xl sm:text-6xl">
              {language === "fr" ? "CLIQUEZ !" : "CLICK!"}
            </p>
          </>
        )}

        {phase === "tooSoon" && (
          <>
            <p className="eyebrow text-destructive">{language === "fr" ? "Trop tôt !" : "Too soon!"}</p>
            <p className="font-serif text-3xl">
              {language === "fr" ? "Attendez que la zone devienne bleue." : "Wait until the pad turns blue."}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "fr" ? "Cliquez pour réessayer" : "Click to try again"}
            </p>
          </>
        )}

        {phase === "result" && lastMs !== null && (
          <>
            <p className="eyebrow text-primary">{rating(lastMs)}</p>
            <p className="font-serif text-5xl tabular-nums sm:text-6xl">{lastMs} ms</p>
            {isNewBest && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
                <Trophy className="h-3.5 w-3.5" />
                {tr(gamesCopy.newRecord, language)}
              </span>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {language === "fr" ? "Cliquez ou appuyez sur Espace pour rejouer" : "Click or press Space to go again"}
            </p>
          </>
        )}
      </button>

      {/* Animated celebration when a new reaction record is beaten */}
      <GameEndBanner
        show={phase === "result" && isNewBest && lastMs !== null}
        outcome="win"
        title={lastMs !== null ? `${lastMs} ms — ${rating(lastMs)}` : ""}
        subtitle={language === "fr" ? "Réflexe éclair ! Vous venez de battre votre record." : "Lightning reflex! You just beat your personal best."}
        isNewRecord
        className="max-w-[640px]"
      />

      {/* Recent attempts */}
      {attempts.length > 0 && (
        <div className="flex w-full max-w-[640px] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {attempts.map((ms, idx) => (
              <span
                key={`${ms}-${idx}`}
                className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs tabular-nums text-muted-foreground"
              >
                #{idx + 1} · {ms} ms
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setAttempts([])
              setLastMs(null)
              setPhase("idle")
            }}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            {language === "fr" ? "Effacer la série" : "Clear series"}
          </button>
        </div>
      )}
    </div>
  )
}
