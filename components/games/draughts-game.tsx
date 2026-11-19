"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowUpDown, Bot, RotateCcw, Trophy, Users } from "lucide-react"

import DraughtsBoard from "@/components/games/draughts-board"
import { DraughtsCapturedBar } from "@/components/games/captured-pieces"
import GameEndBanner from "@/components/games/game-end-overlay"
import { useLanguage } from "@/components/language-provider"
import {
  applyDraughtsMove,
  createInitialDraughtsState,
  pickDraughtsAiMove,
  type DraughtsMove,
  type DraughtsSide,
  type DraughtsState,
} from "@/lib/draughts"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import {
  playDraughtsCapture,
  playDraughtsKing,
  playDraughtsMove,
} from "@/lib/game-sound"
import { tr } from "@/lib/i18n"

type Mode = "easy" | "normal" | "hard" | "pvp"
const SCORE_KEY = "fj_game_best_draughts"
const SESSION_KEY = "fj_active_draughts_solo"

export default function DraughtsGame({ initialMode = "normal" }: { initialMode?: Mode } = {}) {
  const { language } = useLanguage()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [state, setState] = useState<DraughtsState>(() => createInitialDraughtsState())
  const [orientation, setOrientation] = useState<DraughtsSide>("w")
  const [aiThinking, setAiThinking] = useState(false)
  const [wins, setWins] = useState(0)

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setWins(saved)
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: DraughtsState; mode?: Mode }
        if (parsed.state && !parsed.state.winner && parsed.state.lastMove) {
          setState(parsed.state)
          if (parsed.mode) setMode(parsed.mode)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (state.lastMove && !state.winner) {
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ state, mode }))
      } else {
        window.sessionStorage.removeItem(SESSION_KEY)
      }
    } catch {}
  }, [mode, state])

  const restart = useCallback(
    (nextMode: Mode = mode) => {
      setMode(nextMode)
      setState(createInitialDraughtsState())
      setAiThinking(false)
    },
    [mode],
  )

  const handleMove = useCallback(
    (move: DraughtsMove) => {
      // If AI played (or board didn't already sound), ensure sound triggers
      if (mode !== "pvp" && state.turn === "b") {
        if (move.promotes) {
          playDraughtsKing()
        } else if (move.captures.length > 0) {
          playDraughtsCapture(move.captures.length)
        } else {
          playDraughtsMove()
        }
      }

      setState((prev) => {
        const next = applyDraughtsMove(prev, move)
        if (next.winner === "w" && mode !== "pvp") {
          const nextTotal = (readScore(SCORE_KEY) ?? 0) + 1
          const { best } = saveBestScore(SCORE_KEY, nextTotal)
          setWins(best)
        }
        return next
      })
    },
    [mode, state.turn],
  )

  // AI turn (Black)
  useEffect(() => {
    if (mode === "pvp" || state.winner || state.turn !== "b") return
    setAiThinking(true)
    const id = window.setTimeout(() => {
      const move = pickDraughtsAiMove(state, mode)
      if (move) {
        handleMove(move)
      }
      setAiThinking(false)
    }, 340)
    return () => window.clearTimeout(id)
  }, [handleMove, mode, state])

  const isAi = mode !== "pvp"
  const whiteLabel = isAi ? (language === "fr" ? "Vous (Blancs)" : "You (White)") : "Blancs"
  const blackLabel = isAi ? "IA (Noirs)" : "Noirs"

  const modes: { id: Mode; label: string }[] = [
    { id: "easy", label: language === "fr" ? "IA Facile" : "Easy AI" },
    { id: "normal", label: language === "fr" ? "IA Normale" : "Normal AI" },
    { id: "hard", label: language === "fr" ? "IA Difficile" : "Hard AI" },
    { id: "pvp", label: language === "fr" ? "2 Joueurs" : "2 Players" },
  ]

  const statusText = state.winner
    ? state.winner === "draw"
      ? language === "fr"
        ? "Match nul !"
        : "Draw!"
      : state.winner === "w"
        ? `${whiteLabel} ${language === "fr" ? "gagnent !" : "win!"}`
        : `${blackLabel} ${language === "fr" ? "gagnent !" : "win!"}`
    : aiThinking
      ? language === "fr"
        ? "L'IA réfléchit…"
        : "AI is thinking…"
      : state.turn === "w"
        ? language === "fr"
          ? `À ${whiteLabel} de jouer`
          : `${whiteLabel} to move`
        : language === "fr"
          ? `Tour de ${blackLabel}`
          : `${blackLabel} to move`

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5">
      {/* Mode selector */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => restart(m.id)}
            data-active={mode === m.id}
            className="chip"
          >
            {m.id === "pvp" ? <Users className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            {m.label}
          </button>
        ))}
      </div>

      {/* End of game animation */}
      <GameEndBanner
        show={Boolean(state.winner)}
        outcome={
          state.winner === "draw"
            ? "draw"
            : state.winner === "w" || mode === "pvp"
              ? "win"
              : "lose"
        }
        title={statusText}
        subtitle={
          state.lastEvent ||
          (language === "fr" ? "Partie de Dames Internationales 10×10 terminée." : "10×10 International Draughts finished.")
        }
        primaryActionLabel={tr(gamesCopy.restart, language)}
        onPrimaryAction={() => restart(mode)}
        className="max-w-[520px]"
      />

      {/* Status + Controls */}
      <div className="flex w-full max-w-[520px] flex-wrap items-center justify-between gap-2">
        <p className="font-serif text-xl sm:text-2xl">{statusText}</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOrientation((o) => (o === "w" ? "b" : "w"))}
            className="btn btn-outline h-9 px-3"
            title={language === "fr" ? "Retourner le damier" : "Flip board"}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => restart(mode)}
            className="btn btn-outline h-9 px-3"
            title={tr(gamesCopy.restart, language)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <DraughtsBoard
        state={state}
        orientation={orientation}
        canInteractSide={mode === "pvp" ? "both" : aiThinking ? null : "w"}
        onMove={handleMove}
        whiteLabel={whiteLabel}
        blackLabel={blackLabel}
      />

      <DraughtsCapturedBar
        board={state.board}
        whiteLabel={mode === "pvp" ? "Blancs" : language === "fr" ? "Vous" : "You"}
        blackLabel={mode === "pvp" ? "Noirs" : "IA"}
        className="max-w-[520px]"
      />

      {isAi && (
        <p className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          {tr(gamesCopy.record, language)} : {wins} {language === "fr" ? "victoires contre l'IA" : "wins vs AI"}
        </p>
      )}
    </div>
  )
}
