"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, Flame, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react"

import GameEndBanner from "@/components/games/game-end-overlay"
import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { playCapture, playScore } from "@/lib/game-sound"
import { tr } from "@/lib/i18n"
import {
  getQuizBankSize,
  pickQuizQuestions,
  QUIZ_THEME_LABELS,
  type QuizDifficulty,
  type QuizQuestion,
  type QuizThemePack,
} from "@/lib/quiz-bank"
import { cn } from "@/lib/utils"

const SCORE_KEY = "fj_game_best_quiz_solo"
const ROUND_SIZE = 10

type DiffOption = "all" | "1" | "2" | "3"

export default function QuizGame({
  initialDifficulty = "all",
}: {
  initialDifficulty?: DiffOption
} = {}) {
  const { language } = useLanguage()
  const [theme, setTheme] = useState<QuizThemePack>("all")
  const [difficulty, setDifficulty] = useState<DiffOption>(initialDifficulty)
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    pickQuizQuestions(ROUND_SIZE, "all", initialDifficulty === "all" ? "all" : (Number(initialDifficulty) as QuizDifficulty)),
  )
  const [index, setIndex] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setBestScore(saved)
  }, [])

  const startRound = useCallback(
    (nextTheme: QuizThemePack = theme, nextDiff: DiffOption = difficulty) => {
      setTheme(nextTheme)
      setDifficulty(nextDiff)
      setQuestions(
        pickQuizQuestions(
          ROUND_SIZE,
          nextTheme,
          nextDiff === "all" ? "all" : (Number(nextDiff) as QuizDifficulty),
        ),
      )
      setIndex(0)
      setSelectedIdx(null)
      setScore(0)
      setCorrectCount(0)
      setStreak(0)
      setBestStreak(0)
      setIsNewBest(false)
      setFinished(false)
    },
    [difficulty, theme],
  )

  const current = questions[index]

  const handleAnswer = (optIdx: number) => {
    if (selectedIdx !== null || finished || !current) return
    setSelectedIdx(optIdx)

    const isRight = optIdx === current.correctIdx
    let nextScore = score
    let nextCorrect = correctCount
    let nextStreak = streak

    if (isRight) {
      playScore()
      nextStreak = streak + 1
      nextCorrect = correctCount + 1
      const pts = 10 * current.difficulty + Math.min(nextStreak - 1, 5) * 5
      nextScore = score + pts
      setScore(nextScore)
      setCorrectCount(nextCorrect)
      setStreak(nextStreak)
      if (nextStreak > bestStreak) setBestStreak(nextStreak)
    } else {
      playCapture()
      setStreak(0)
    }

    const isLast = index + 1 >= questions.length
    window.setTimeout(() => {
      if (isLast) {
        setFinished(true)
        const { best, isNew } = saveBestScore(SCORE_KEY, nextScore)
        setBestScore(best)
        setIsNewBest(isNew && nextScore > 0)
      } else {
        setIndex((i) => i + 1)
        setSelectedIdx(null)
      }
    }, current.explanation ? 1500 : 950)
  }

  const themeKeys: QuizThemePack[] = ["all", "culture", "geo", "science", "sport", "dev"]
  const diffOptions: { id: DiffOption; label: string }[] = [
    { id: "all", label: language === "fr" ? "Mixte" : "Mixed" },
    { id: "1", label: language === "fr" ? "Facile" : "Easy" },
    { id: "2", label: language === "fr" ? "Moyen" : "Medium" },
    { id: "3", label: language === "fr" ? "Difficile" : "Hard" },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-4 sm:gap-5">
      {/* Theme chips */}
      <div className="flex w-full flex-wrap items-center justify-center gap-1.5">
        {themeKeys.map((tKey) => (
          <button
            key={tKey}
            type="button"
            onClick={() => startRound(tKey, difficulty)}
            data-active={theme === tKey}
            className="chip"
          >
            {language === "fr" ? QUIZ_THEME_LABELS[tKey].fr : QUIZ_THEME_LABELS[tKey].en}
          </button>
        ))}
      </div>

      {/* Difficulty + Stats bar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-1">
          {diffOptions.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => startRound(theme, d.id)}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                difficulty === d.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="inline-flex items-center gap-1 text-primary font-semibold tabular-nums">
            <Sparkles className="h-3.5 w-3.5" />
            {score} pts
          </span>
          {streak >= 2 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
              <Flame className="h-3 w-3" />×{streak}
            </span>
          )}
          <button
            type="button"
            onClick={() => startRound(theme, difficulty)}
            className="btn btn-outline h-8 px-2.5"
            title={tr(gamesCopy.restart, language)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* End of round celebration */}
      <GameEndBanner
        show={finished}
        outcome={correctCount >= Math.ceil(questions.length * 0.6) ? "win" : "gameover"}
        title={`${score} pts · ${correctCount}/${questions.length}`}
        subtitle={
          language === "fr"
            ? `Meilleure série : ${bestStreak} bonne${bestStreak > 1 ? "s" : ""} réponse${bestStreak > 1 ? "s" : ""} d'affilée`
            : `Best streak: ${bestStreak} in a row`
        }
        isNewRecord={isNewBest}
        primaryActionLabel={language === "fr" ? "Nouvelle série (10 questions)" : "New 10-question round"}
        onPrimaryAction={() => startRound(theme, difficulty)}
      />

      {/* Active question card */}
      {!finished && current && (
        <div className="w-full rounded-md border border-border bg-background p-5 shadow-sm sm:p-6">
          {/* Progress bar */}
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((index + (selectedIdx !== null ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="eyebrow text-primary">
              Question {index + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                {current.category}
              </span>
              <span className="font-mono text-[10px] text-amber-500">
                {"★".repeat(current.difficulty)}
              </span>
            </div>
          </div>

          <h4 className="mt-3 font-serif text-xl leading-snug sm:text-2xl">{current.q}</h4>

          <div className="mt-5 grid gap-2.5">
            {current.options.map((opt, idx) => {
              const revealed = selectedIdx !== null
              const isChosen = selectedIdx === idx
              const isCorrect = idx === current.correctIdx

              return (
                <button
                  key={`${index}-${idx}`}
                  type="button"
                  disabled={revealed}
                  onClick={() => handleAnswer(idx)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-sm transition-all",
                    !revealed && "border-border bg-card/60 hover:border-primary hover:bg-primary/10",
                    revealed && isCorrect && "border-emerald-500 bg-emerald-500/15 text-foreground font-medium",
                    revealed && isChosen && !isCorrect && "border-destructive bg-destructive/15 text-destructive",
                    revealed && !isChosen && !isCorrect && "border-border/50 bg-card/30 opacity-50",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-primary">{String.fromCharCode(65 + idx)}</span>
                    <span>{opt}</span>
                  </span>
                  {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                  {revealed && isChosen && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                </button>
              )
            })}
          </div>

          {selectedIdx !== null && current.explanation && (
            <p className="mt-4 rounded-md border border-primary/25 bg-primary/5 px-3.5 py-2.5 text-xs leading-relaxed text-foreground/90">
              💡 {current.explanation}
            </p>
          )}
        </div>
      )}

      <p className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
        <Trophy className="h-3.5 w-3.5 text-primary" />
        {tr(gamesCopy.record, language)} : {bestScore} pts · {getQuizBankSize().toLocaleString("fr-FR")} questions
      </p>
    </div>
  )
}
