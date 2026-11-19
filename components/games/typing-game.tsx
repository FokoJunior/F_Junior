"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RotateCcw, Trophy } from "lucide-react"

import GameEndBanner from "@/components/games/game-end-overlay"
import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const DURATION = 30
const SCORE_KEY = "fj_game_best_typing"

const WORD_BANK = [
  "react", "nextjs", "typescript", "tailwind", "nodejs", "flutter", "python", "docker",
  "github", "api", "async", "await", "promise", "component", "hook", "state", "effect",
  "server", "client", "deploy", "vercel", "database", "query", "schema", "index", "cache",
  "token", "oauth", "security", "pixel", "layout", "motion", "canvas", "shader", "vector",
  "matrix", "neural", "model", "prompt", "agent", "cloud", "linux", "bash", "commit",
  "branch", "merge", "debug", "build", "bundle", "render", "stream", "socket", "route",
  "middleware", "cookie", "session", "module", "package", "script", "syntax", "compile",
]

function generateText(wordCount = 45): string {
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    words.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)])
  }
  return words.join(" ")
}

export default function TypingGame() {
  const { language } = useLanguage()
  const [target, setTarget] = useState<string>(() => generateText())
  const [typed, setTyped] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<number>(DURATION)
  const [running, setRunning] = useState<boolean>(false)
  const [finished, setFinished] = useState<boolean>(false)
  const [bestWpm, setBestWpm] = useState<number>(0)
  const [isNewBest, setIsNewBest] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setBestWpm(saved)
  }, [])

  const stats = useMemo(() => {
    let correct = 0
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correct++
    }
    const elapsedSec = Math.max(1, DURATION - timeLeft)
    const wpm = Math.round((correct / 5) / (elapsedSec / 60))
    const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100
    return { correct, wpm: typed.length > 0 ? wpm : 0, accuracy }
  }, [target, timeLeft, typed])

  const finishRun = useCallback(
    (finalTyped: string) => {
      setRunning(false)
      setFinished(true)
      let correct = 0
      for (let i = 0; i < finalTyped.length; i++) {
        if (finalTyped[i] === target[i]) correct++
      }
      const wpm = Math.round((correct / 5) / (DURATION / 60))
      if (wpm >= 5) {
        const { best, isNew } = saveBestScore(SCORE_KEY, wpm)
        setBestWpm(best)
        setIsNewBest(isNew)
      }
    },
    [target],
  )

  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      finishRun(typed)
      return
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => window.clearTimeout(id)
  }, [finishRun, running, timeLeft, typed])

  const restart = useCallback(() => {
    setTarget(generateText())
    setTyped("")
    setTimeLeft(DURATION)
    setRunning(false)
    setFinished(false)
    setIsNewBest(false)
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleChange = (value: string) => {
    if (finished) return
    if (!running && value.length > 0) setRunning(true)
    setTyped(value)
    if (value.length >= target.length - 15) {
      setTarget((prev) => `${prev} ${generateText(25)}`)
    }
  }

  return (
    <div className="flex w-full max-w-[640px] mx-auto flex-col items-center gap-5">
      {/* Stats bar */}
      <div className="grid w-full grid-cols-2 gap-2 text-center sm:grid-cols-4 sm:gap-2.5">
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow">{language === "fr" ? "Chrono" : "Timer"}</p>
          <p className={cn("font-mono text-xl font-semibold tabular-nums", timeLeft <= 5 && running && "text-destructive")}>
            {timeLeft}s
          </p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow">{language === "fr" ? "MPM" : "WPM"}</p>
          <p className="font-mono text-xl font-semibold tabular-nums text-primary">{stats.wpm}</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow">{language === "fr" ? "Précision" : "Accuracy"}</p>
          <p className="font-mono text-xl font-semibold tabular-nums">{stats.accuracy}%</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow inline-flex items-center gap-1">
            <Trophy className="h-3 w-3 text-primary" />
            {tr(gamesCopy.record, language)}
          </p>
          <p className="font-mono text-xl font-semibold tabular-nums">{bestWpm}</p>
        </div>
      </div>

      {/* Text preview */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="w-full cursor-text rounded-md border border-border bg-background p-5 font-mono text-base leading-relaxed tracking-wide sm:p-6 sm:text-lg"
      >
        <p className="max-h-[160px] overflow-hidden break-words select-none">
          {target.slice(0, Math.max(180, typed.length + 120)).split("").map((ch, idx) => {
            const isTyped = idx < typed.length
            const isCurrent = idx === typed.length
            const isCorrect = isTyped && typed[idx] === ch
            return (
              <span
                key={idx}
                className={cn(
                  isCurrent && "border-b-2 border-primary bg-primary/15 text-foreground",
                  isTyped && isCorrect && "text-emerald-600 dark:text-emerald-400",
                  isTyped && !isCorrect && "bg-destructive/20 text-destructive underline",
                  !isTyped && !isCurrent && "text-muted-foreground/70",
                )}
              >
                {ch}
              </span>
            )
          })}
        </p>
      </div>

      {/* Input */}
      <div className="flex w-full gap-2.5">
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          disabled={finished}
          placeholder={
            language === "fr"
              ? "Commencez à taper ici pour lancer le chrono de 30s…"
              : "Start typing here to trigger the 30s countdown…"
          }
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="h-12 flex-1 rounded-md border border-input bg-background px-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button type="button" onClick={restart} className="btn btn-outline h-12 px-4">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <GameEndBanner
        show={finished}
        outcome="win"
        title={`${stats.wpm} ${language === "fr" ? "mots / min" : "WPM"} · ${stats.accuracy}%`}
        subtitle={
          language === "fr"
            ? "Session de 30 secondes terminée !"
            : "30-second typing session completed!"
        }
        isNewRecord={isNewBest}
        primaryActionLabel={tr(gamesCopy.restart, language)}
        onPrimaryAction={restart}
      />
    </div>
  )
}
