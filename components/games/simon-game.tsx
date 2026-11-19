"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Play, RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Phase = "idle" | "showing" | "input" | "over"

const SCORE_KEY = "fj_game_best_simon"
const FREQS = [329.63, 261.63, 392.0, 523.25] // E4, C4, G4, C5

const PADS = [
  { id: 0, key: "1", idle: "bg-blue-500/20 border-blue-500/40", lit: "bg-blue-500 border-blue-400 shadow-[0_0_28px_rgba(59,130,246,0.65)] scale-[0.98]" },
  { id: 1, key: "2", idle: "bg-emerald-500/20 border-emerald-500/40", lit: "bg-emerald-500 border-emerald-400 shadow-[0_0_28px_rgba(16,185,129,0.65)] scale-[0.98]" },
  { id: 2, key: "3", idle: "bg-amber-500/20 border-amber-500/40", lit: "bg-amber-500 border-amber-400 shadow-[0_0_28px_rgba(245,158,11,0.65)] scale-[0.98]" },
  { id: 3, key: "4", idle: "bg-rose-500/20 border-rose-500/40", lit: "bg-rose-500 border-rose-400 shadow-[0_0_28px_rgba(244,63,94,0.65)] scale-[0.98]" },
]

export default function SimonGame() {
  const { language } = useLanguage()
  const [phase, setPhase] = useState<Phase>("idle")
  const [sequence, setSequence] = useState<number[]>([])
  const [inputIndex, setInputIndex] = useState(0)
  const [litPad, setLitPad] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  const [muted, setMuted] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setBest(saved)
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  const playTone = useCallback(
    (padId: number, duration = 260) => {
      if (muted || typeof window === "undefined") return
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx()
        const ctx = audioCtxRef.current
        if (ctx.state === "suspended") ctx.resume()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = FREQS[padId] || 440
        gain.gain.setValueAtTime(0.14, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + duration / 1000)
      } catch {}
    },
    [muted],
  )

  const playSequence = useCallback(
    (seq: number[]) => {
      clearTimers()
      setPhase("showing")
      setInputIndex(0)
      const stepMs = Math.max(360, 620 - seq.length * 16)
      seq.forEach((padId, idx) => {
        const t1 = window.setTimeout(() => {
          setLitPad(padId)
          playTone(padId, Math.round(stepMs * 0.65))
        }, 350 + idx * stepMs)
        const t2 = window.setTimeout(() => {
          setLitPad(null)
        }, 350 + idx * stepMs + Math.round(stepMs * 0.68))
        timersRef.current.push(t1, t2)
      })
      const doneTimer = window.setTimeout(() => {
        setLitPad(null)
        setPhase("input")
      }, 350 + seq.length * stepMs + 100)
      timersRef.current.push(doneTimer)
    },
    [playTone],
  )

  const startGame = useCallback(() => {
    clearTimers()
    const first = [Math.floor(Math.random() * 4)]
    setSequence(first)
    setScore(0)
    setIsNewBest(false)
    playSequence(first)
  }, [playSequence])

  const handlePadPress = useCallback(
    (padId: number) => {
      if (phase !== "input") return
      setLitPad(padId)
      playTone(padId, 200)
      const t = window.setTimeout(() => setLitPad(null), 180)
      timersRef.current.push(t)

      if (sequence[inputIndex] !== padId) {
        setPhase("over")
        return
      }

      const nextIdx = inputIndex + 1
      if (nextIdx >= sequence.length) {
        const nextScore = sequence.length
        setScore(nextScore)
        const { best: updatedBest, isNew } = saveBestScore(SCORE_KEY, nextScore)
        setBest(updatedBest)
        if (isNew) setIsNewBest(true)

        const nextSeq = [...sequence, Math.floor(Math.random() * 4)]
        setSequence(nextSeq)
        setPhase("showing")
        const pauseT = window.setTimeout(() => playSequence(nextSeq), 550)
        timersRef.current.push(pauseT)
      } else {
        setInputIndex(nextIdx)
      }
    },
    [inputIndex, phase, playSequence, playTone, sequence],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      const idx = ["1", "2", "3", "4"].indexOf(e.key)
      if (idx !== -1 && phase === "input") {
        handlePadPress(idx)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handlePadPress, phase])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Scoreboard */}
      <div className="flex w-full max-w-[440px] flex-wrap items-center justify-between gap-3">
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
            onClick={() => setMuted((m) => !m)}
            className="btn btn-outline h-9 px-3.5"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button type="button" onClick={startGame} className="btn btn-outline h-9 px-4">
            <RotateCcw className="h-3.5 w-3.5" />
            {tr(gamesCopy.restart, language)}
          </button>
        </div>
      </div>

      {/* Status label */}
      <p className="font-serif text-2xl">
        {phase === "idle" && (language === "fr" ? "Prêt à mémoriser ?" : "Ready to memorize?")}
        {phase === "showing" && (language === "fr" ? "Observez la séquence…" : "Watch the sequence…")}
        {phase === "input" &&
          (language === "fr"
            ? `À vous ! (${inputIndex}/${sequence.length})`
            : `Your turn! (${inputIndex}/${sequence.length})`)}
        {phase === "over" && (language === "fr" ? "Séquence ratée !" : "Wrong pad!")}
      </p>

      {/* 2x2 Glowing Pads */}
      <div className="relative grid aspect-square w-full max-w-[380px] grid-cols-2 grid-rows-2 gap-3.5">
        {PADS.map((pad) => (
          <button
            key={pad.id}
            type="button"
            disabled={phase !== "input"}
            onClick={() => handlePadPress(pad.id)}
            className={cn(
              "flex items-end justify-end rounded-xl border-2 p-4 font-mono text-xs font-semibold text-foreground/60 transition-all duration-150",
              litPad === pad.id ? pad.lit : pad.idle,
              phase === "input" && "hover:brightness-110 active:scale-[0.97]",
            )}
          >
            {pad.key}
          </button>
        ))}

        {(phase === "idle" || phase === "over") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/80 p-6 text-center backdrop-blur-sm">
            {phase === "over" && (
              <>
                <p className="eyebrow text-destructive">{tr(gamesCopy.gameOver, language)}</p>
                <p className="font-serif text-4xl tabular-nums">{score} pts</p>
                {isNewBest && score > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
                    <Trophy className="h-3.5 w-3.5" />
                    {tr(gamesCopy.newRecord, language)}
                  </span>
                )}
              </>
            )}
            <button type="button" onClick={startGame} className="btn btn-solid">
              <Play className="h-4 w-4" />
              {phase === "over" ? tr(gamesCopy.restart, language) : tr(gamesCopy.start, language)}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
