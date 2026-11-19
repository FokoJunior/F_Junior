"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Bot, RotateCcw, Trophy, Users } from "lucide-react"

import GameEndBanner from "@/components/games/game-end-overlay"
import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Cell = "X" | "O" | null
type Mode = "impossible" | "normal" | "pvp"

const SCORE_KEY = "fj_game_best_tictactoe"

const LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function evaluateBoard(board: Cell[]): { winner: "X" | "O" | "draw" | null; line: number[] | null } {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] }
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: "draw", line: null }
  }
  return { winner: null, line: null }
}

function minimax(board: Cell[], depth: number, isMaximizing: boolean): number {
  const { winner } = evaluateBoard(board)
  if (winner === "O") return 10 - depth
  if (winner === "X") return depth - 10
  if (winner === "draw") return 0

  if (isMaximizing) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O"
        best = Math.max(best, minimax(board, depth + 1, false))
        board[i] = null
      }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "X"
        best = Math.min(best, minimax(board, depth + 1, true))
        board[i] = null
      }
    }
    return best
  }
}

function pickBestMove(board: Cell[], mode: Mode): number {
  const emptyIndices = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1)
  if (emptyIndices.length === 0) return -1

  if (mode === "normal" && Math.random() < 0.45) {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
  }

  let bestScore = -Infinity
  let bestMoves: number[] = []
  const copy = [...board]

  for (const idx of emptyIndices) {
    copy[idx] = "O"
    const score = minimax(copy, 0, false)
    copy[idx] = null
    if (score > bestScore) {
      bestScore = score
      bestMoves = [idx]
    } else if (score === bestScore) {
      bestMoves.push(idx)
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)]
}

export default function TicTacToeGame({ initialMode = "impossible" }: { initialMode?: Mode } = {}) {
  const { language } = useLanguage()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [turn, setTurn] = useState<"X" | "O">("X")
  const [scores, setScores] = useState({ x: 0, draws: 0, o: 0 })
  const [totalWins, setTotalWins] = useState(0)
  const [aiThinking, setAiThinking] = useState(false)

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setTotalWins(saved)
  }, [])

  const { winner, line } = useMemo(() => evaluateBoard(board), [board])

  const resetBoard = useCallback(() => {
    setBoard(Array(9).fill(null))
    setTurn("X")
    setAiThinking(false)
  }, [])

  const changeMode = (next: Mode) => {
    setMode(next)
    setBoard(Array(9).fill(null))
    setTurn("X")
    setAiThinking(false)
    setScores({ x: 0, draws: 0, o: 0 })
  }

  const recordOutcome = useCallback(
    (outcome: "X" | "O" | "draw") => {
      setScores((prev) => ({
        x: prev.x + (outcome === "X" ? 1 : 0),
        draws: prev.draws + (outcome === "draw" ? 1 : 0),
        o: prev.o + (outcome === "O" ? 1 : 0),
      }))
      if (outcome === "X" && mode !== "pvp") {
        const nextTotal = (readScore(SCORE_KEY) ?? 0) + 1
        const { best } = saveBestScore(SCORE_KEY, nextTotal)
        setTotalWins(best)
      }
    },
    [mode],
  )

  const handleClick = (idx: number) => {
    if (board[idx] !== null || winner || aiThinking) return
    if (mode !== "pvp" && turn === "O") return

    const next = [...board]
    next[idx] = turn
    setBoard(next)

    const res = evaluateBoard(next)
    if (res.winner) {
      recordOutcome(res.winner)
      return
    }

    setTurn(turn === "X" ? "O" : "X")
  }

  // AI turn effect
  useEffect(() => {
    if (mode === "pvp" || turn !== "O" || winner) return
    setAiThinking(true)
    const id = window.setTimeout(() => {
      const move = pickBestMove(board, mode)
      if (move !== -1) {
        const next = [...board]
        next[move] = "O"
        setBoard(next)
        const res = evaluateBoard(next)
        if (res.winner) {
          recordOutcome(res.winner)
        } else {
          setTurn("X")
        }
      }
      setAiThinking(false)
    }, 260)

    return () => window.clearTimeout(id)
  }, [board, mode, recordOutcome, turn, winner])

  const statusText = useMemo(() => {
    if (winner === "draw") {
      return language === "fr" ? "Match nul !" : language === "de" ? "Unentschieden!" : language === "zh" ? "平局！" : "It's a draw!"
    }
    if (winner === "X") {
      if (mode === "pvp") return language === "fr" ? "Victoire du joueur X !" : "Player X wins!"
      return language === "fr" ? "Vous avez gagné !" : language === "de" ? "Du hast gewonnen!" : language === "zh" ? "你赢了！" : "You win!"
    }
    if (winner === "O") {
      if (mode === "pvp") return language === "fr" ? "Victoire du joueur O !" : "Player O wins!"
      return language === "fr" ? "L'IA l'emporte !" : language === "de" ? "Die KI gewinnt!" : language === "zh" ? "AI 获胜！" : "AI wins!"
    }
    if (aiThinking) {
      return language === "fr" ? "L'IA réfléchit…" : "AI is thinking…"
    }
    if (mode === "pvp") {
      return language === "fr" ? `Tour du joueur ${turn}` : `Player ${turn}'s turn`
    }
    return language === "fr" ? "À vous de jouer (X)" : "Your turn (X)"
  }, [aiThinking, language, mode, turn, winner])

  const modes: { id: Mode; label: string }[] = [
    { id: "impossible", label: language === "fr" ? "IA Impossible" : "Unbeatable AI" },
    { id: "normal", label: language === "fr" ? "IA Normale" : "Normal AI" },
    { id: "pvp", label: language === "fr" ? "2 Joueurs" : "2 Players" },
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode selector */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => changeMode(m.id)}
            data-active={mode === m.id}
            className="chip"
          >
            {m.id === "pvp" ? <Users className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            {m.label}
          </button>
        ))}
      </div>

      {/* Scoreboard */}
      <div className="grid w-full max-w-[440px] grid-cols-3 gap-2.5 text-center">
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow text-primary">{mode === "pvp" ? "X" : language === "fr" ? "Vous (X)" : "You (X)"}</p>
          <p className="font-mono text-xl font-semibold tabular-nums">{scores.x}</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow">{language === "fr" ? "Nuls" : "Draws"}</p>
          <p className="font-mono text-xl font-semibold tabular-nums">{scores.draws}</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="eyebrow">{mode === "pvp" ? "O" : "IA (O)"}</p>
          <p className="font-mono text-xl font-semibold tabular-nums">{scores.o}</p>
        </div>
      </div>

      {/* End of game animation */}
      <GameEndBanner
        show={Boolean(winner)}
        outcome={
          winner === "draw"
            ? "draw"
            : winner === "X" || mode === "pvp"
              ? "win"
              : "lose"
        }
        title={statusText}
        subtitle={
          winner === "draw"
            ? language === "fr"
              ? "Match serré — essayez encore !"
              : "Close match — try again!"
            : `${scores.x} — ${scores.o}`
        }
        primaryActionLabel={tr(gamesCopy.restart, language)}
        onPrimaryAction={resetBoard}
        className="max-w-[440px]"
      />

      {/* Status */}
      {!winner && <p className="font-serif text-2xl">{statusText}</p>}

      {/* 3x3 Grid */}
      <div className="grid aspect-square w-full max-w-[420px] grid-cols-3 grid-rows-3 gap-3">
        {board.map((cell, idx) => {
          const isWinCell = line?.includes(idx) ?? false
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleClick(idx)}
              disabled={cell !== null || !!winner || aiThinking}
              aria-label={`Case ${idx + 1}${cell ? ` : ${cell}` : ""}`}
              className={cn(
                "flex items-center justify-center rounded-md border font-serif text-5xl transition-all duration-200 sm:text-6xl",
                isWinCell
                  ? "border-primary bg-primary/15 text-primary scale-[1.02]"
                  : "border-border bg-background hover:border-foreground/40",
                cell === "X" && !isWinCell && "text-primary",
                cell === "O" && !isWinCell && "text-foreground",
              )}
            >
              {cell}
            </button>
          )
        })}
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={resetBoard} className="btn btn-solid h-10 px-5">
          <RotateCcw className="h-4 w-4" />
          {tr(gamesCopy.restart, language)}
        </button>
        {mode !== "pvp" && (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            {tr(gamesCopy.record, language)} : {totalWins} {language === "fr" ? "victoires" : "wins"}
          </span>
        )}
      </div>
    </div>
  )
}
