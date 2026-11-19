"use client"

import { useCallback, useEffect, useState } from "react"
import { Bot, RotateCcw, Trophy, Users } from "lucide-react"

import GameEndBanner from "@/components/games/game-end-overlay"
import LudoBoard from "@/components/games/ludo-board"
import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"
import {
  applyLudoMove,
  applyLudoRoll,
  createInitialLudoState,
  getLegalLudoMoves,
  SAFE_TRACK_INDICES,
  tokenToGlobalTrack,
  type LudoState,
} from "@/lib/ludo"

type Mode = "easy" | "normal" | "hard" | "pvp"
const SCORE_KEY = "fj_game_best_ludo"

function pickAiToken(state: LudoState, level: "easy" | "normal" | "hard"): number | null {
  if (state.dice === null) return null
  const legal = getLegalLudoMoves(state, "guest", state.dice)
  if (legal.length === 0) return null

  if (level === "easy" && Math.random() < 0.65) {
    return legal[Math.floor(Math.random() * legal.length)]
  }

  let bestIdx = legal[0]
  let bestScore = -Infinity

  for (const idx of legal) {
    const pos = state.guestTokens[idx]
    const nextPos = pos === -1 ? 0 : pos + state.dice
    let score = nextPos

    // Huge bonus for reaching home
    if (nextPos === 56) score += 200
    // Big bonus for exiting base on 6
    if (pos === -1) score += level === "hard" ? 140 : 120
    // Bonus for capturing opponent
    const gPos = tokenToGlobalTrack("guest", nextPos)
    if (gPos !== null && !SAFE_TRACK_INDICES.has(gPos)) {
      const hitsOpp = state.hostTokens.some((hp) => tokenToGlobalTrack("host", hp) === gPos)
      if (hitsOpp) score += level === "hard" ? 220 : 180
    }
    // Bonus for landing on safe star
    if (gPos !== null && SAFE_TRACK_INDICES.has(gPos)) score += level === "hard" ? 70 : 40
    // Hard AI avoids stepping right in front of an opponent token (1-6 squares behind)
    if (level === "hard" && gPos !== null && !SAFE_TRACK_INDICES.has(gPos)) {
      const inDanger = state.hostTokens.some((hp) => {
        const oppG = tokenToGlobalTrack("host", hp)
        if (oppG === null) return false
        const diff = (gPos - oppG + 52) % 52
        return diff >= 1 && diff <= 6
      })
      if (inDanger) score -= 55
    }

    if (score > bestScore) {
      bestScore = score
      bestIdx = idx
    }
  }
  return bestIdx
}

export default function LudoGame({ initialMode = "normal" }: { initialMode?: Mode } = {}) {
  const { language } = useLanguage()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [state, setState] = useState<LudoState>(() => createInitialLudoState("host"))
  const [rolling, setRolling] = useState(false)
  const [wins, setWins] = useState(0)

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setWins(saved)
  }, [])

  const restart = useCallback(
    (nextMode: Mode = mode) => {
      setMode(nextMode)
      setState(createInitialLudoState("host"))
      setRolling(false)
    },
    [mode],
  )

  const handleRoll = useCallback(() => {
    if (state.winner || state.hasRolled || rolling) return
    setRolling(true)
    window.setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1
      setState((prev) => {
        const isAi = mode !== "pvp"
        const label =
          prev.turn === "host"
            ? isAi
              ? language === "fr"
                ? "Vous"
                : "You"
              : "Joueur 1"
            : isAi
              ? "IA"
              : "Joueur 2"
        return applyLudoRoll(prev, prev.turn, value, label)
      })
      setRolling(false)
    }, 260)
  }, [language, mode, rolling, state.hasRolled, state.winner])

  const handleMoveToken = useCallback(
    (tokenIdx: number) => {
      setState((prev) => {
        const isAi = mode !== "pvp"
        const label =
          prev.turn === "host"
            ? isAi
              ? language === "fr"
                ? "Vous"
                : "You"
              : "Joueur 1"
            : isAi
              ? "IA"
              : "Joueur 2"
        const next = applyLudoMove(prev, prev.turn, tokenIdx, label)
        if (next.winner === "host" && isAi) {
          const nextTotal = (readScore(SCORE_KEY) ?? 0) + 1
          const { best } = saveBestScore(SCORE_KEY, nextTotal)
          setWins(best)
        }
        return next
      })
    },
    [language, mode],
  )

  // AI automatic roll & move when it's guest's turn
  useEffect(() => {
    if (mode === "pvp" || state.winner || state.turn !== "guest" || rolling) return

    if (!state.hasRolled) {
      const id = window.setTimeout(() => handleRoll(), 520)
      return () => window.clearTimeout(id)
    }

    const tokenIdx = pickAiToken(state, mode)
    if (tokenIdx !== null) {
      const id = window.setTimeout(() => handleMoveToken(tokenIdx), 480)
      return () => window.clearTimeout(id)
    }
  }, [handleMoveToken, handleRoll, mode, rolling, state])

  const isAi = mode !== "pvp"
  const hostLabel = isAi ? (language === "fr" ? "Vous" : "You") : "Joueur 1"
  const guestLabel = isAi ? "IA" : "Joueur 2"

  const modes: { id: Mode; label: string }[] = [
    { id: "easy", label: language === "fr" ? "IA Facile" : "Easy AI" },
    { id: "normal", label: language === "fr" ? "IA Normale" : "Normal AI" },
    { id: "hard", label: language === "fr" ? "IA Difficile" : "Hard AI" },
    { id: "pvp", label: language === "fr" ? "2 Joueurs" : "2 Players" },
  ]

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5">
      {/* Mode & Restart */}
      <div className="flex w-full max-w-[520px] flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
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

        <button type="button" onClick={() => restart(mode)} className="btn btn-outline h-9 px-3.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" />
          {tr(gamesCopy.restart, language)}
        </button>
      </div>

      <GameEndBanner
        show={Boolean(state.winner)}
        outcome={state.winner === "host" || mode === "pvp" ? "win" : "lose"}
        title={
          state.winner === "host"
            ? `${hostLabel} ${language === "fr" ? "remporte la partie !" : "wins the match!"}`
            : `${guestLabel} ${language === "fr" ? "remporte la partie !" : "wins the match!"}`
        }
        subtitle={
          state.winner === "host" && isAi
            ? language === "fr"
              ? "Tous vos 4 pions ont atteint la zone d'arrivée !"
              : "All 4 of your tokens reached home!"
            : isAi
              ? language === "fr"
                ? "L'IA a amené ses 4 pions avant vous. Retentez votre chance !"
                : "The AI finished all 4 tokens first. Try again!"
              : language === "fr"
                ? "4 pions arrivés au centre !"
                : "4 tokens reached home!"
        }
        primaryActionLabel={tr(gamesCopy.restart, language)}
        onPrimaryAction={() => restart(mode)}
        className="max-w-[520px]"
      />

      <LudoBoard
        state={state}
        canInteractSide={mode === "pvp" ? "both" : "host"}
        onRoll={handleRoll}
        onMoveToken={handleMoveToken}
        rolling={rolling}
        hostLabel={hostLabel}
        guestLabel={guestLabel}
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
