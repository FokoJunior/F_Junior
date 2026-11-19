"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Chess } from "chess.js"
import { ArrowUpDown, Bot, RotateCcw, Trophy, Undo2, Users } from "lucide-react"

import ChessBoard from "@/components/games/chess-board"
import { ChessCapturedBar } from "@/components/games/captured-pieces"
import GameEndBanner from "@/components/games/game-end-overlay"
import { useLanguage } from "@/components/language-provider"
import { gamesCopy, readScore, saveBestScore } from "@/lib/games"
import { playCapture, playCheck, playMove } from "@/lib/game-sound"
import { tr } from "@/lib/i18n"

type Mode = "easy" | "normal" | "hard" | "pvp"

const SCORE_KEY = "fj_game_best_chess"

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
}

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? -99999 : 99999
  }
  if (chess.isDraw() || chess.isStalemate()) return 0

  let total = 0
  const board = chess.board()
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (!piece) continue
      const base = PIECE_VALUES[piece.type] || 0
      // Center control bonus
      const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c)
      const posBonus = Math.round((7 - centerDist) * (piece.type === "p" ? 4 : 6))
      total += piece.color === "w" ? base + posBonus : -(base + posBonus)
    }
  }
  return total
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, maximizingWhite: boolean): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess)
  }

  const moves = chess.moves({ verbose: true })
  // Order captures first for faster alpha-beta pruning
  moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0))

  if (maximizingWhite) {
    let best = -Infinity
    for (const m of moves) {
      chess.move(m)
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false))
      chess.undo()
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const m of moves) {
      chess.move(m)
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true))
      chess.undo()
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

function pickAiMove(fen: string, level: "easy" | "normal" | "hard"): { from: string; to: string } | null {
  const chess = new Chess(fen)
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return null

  if (level === "easy") {
    const captures = moves.filter((m) => m.captured)
    const pool = captures.length > 0 && Math.random() < 0.6 ? captures : moves
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    return { from: chosen.from, to: chosen.to }
  }

  const depth = level === "hard" ? 2 : 1
  // AI plays Black (minimizing score)
  let bestScore = Infinity
  let bestMoves = [moves[0]]

  for (const m of moves) {
    chess.move(m)
    const score = minimax(chess, depth, -Infinity, Infinity, true)
    chess.undo()
    if (score < bestScore) {
      bestScore = score
      bestMoves = [m]
    } else if (score === bestScore) {
      bestMoves.push(m)
    }
  }

  const pick = bestMoves[Math.floor(Math.random() * bestMoves.length)]
  return { from: pick.from, to: pick.to }
}

export default function ChessGame({ initialMode = "normal" }: { initialMode?: Mode } = {}) {
  const { language } = useLanguage()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [fen, setFen] = useState<string>(() => new Chess().fen())
  const [history, setHistory] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [orientation, setOrientation] = useState<"w" | "b">("w")
  const [aiThinking, setAiThinking] = useState(false)
  const [wins, setWins] = useState(0)

  useEffect(() => {
    const saved = readScore(SCORE_KEY)
    if (saved !== null) setWins(saved)
    try {
      const raw = window.sessionStorage.getItem("fj_active_chess_solo")
      if (raw) {
        const parsed = JSON.parse(raw) as { fen?: string; history?: string[]; mode?: Mode }
        if (parsed.fen && parsed.history && parsed.history.length > 0) {
          setFen(parsed.fen)
          setHistory(parsed.history)
          if (parsed.mode) setMode(parsed.mode)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (history.length > 0 && !new Chess(fen).isGameOver()) {
        window.sessionStorage.setItem("fj_active_chess_solo", JSON.stringify({ fen, history, mode }))
      } else {
        window.sessionStorage.removeItem("fj_active_chess_solo")
      }
    } catch {}
  }, [fen, history, mode])

  const chess = useMemo(() => new Chess(fen), [fen])
  const gameOver = chess.isGameOver()
  const turn = chess.turn()

  const restart = useCallback((nextMode: Mode = mode) => {
    setMode(nextMode)
    setFen(new Chess().fen())
    setHistory([])
    setLastMove(null)
    setAiThinking(false)
  }, [mode])

  const applyMove = useCallback(
    (from: string, to: string) => {
      const next = new Chess(fen)
      try {
        const res = next.move({ from, to, promotion: "q" })
        if (!res) return
        if (next.inCheck() && !next.isCheckmate()) {
          playCheck()
        } else if (res.captured) {
          playCapture()
        } else {
          playMove()
        }
        setHistory((prev) => [...prev, fen])
        setFen(next.fen())
        setLastMove({ from, to })

        if (next.isCheckmate() && mode !== "pvp" && next.turn() === "b") {
          // Human (White) checkmated AI (Black)
          const nextTotal = (readScore(SCORE_KEY) ?? 0) + 1
          const { best } = saveBestScore(SCORE_KEY, nextTotal)
          setWins(best)
        }
      } catch {}
    },
    [fen, mode],
  )

  const handleUndo = () => {
    if (history.length === 0 || aiThinking) return
    const stepsBack = mode !== "pvp" && history.length >= 2 ? 2 : 1
    const targetIdx = Math.max(0, history.length - stepsBack)
    setFen(history[targetIdx])
    setHistory((prev) => prev.slice(0, targetIdx))
    setLastMove(null)
  }

  // AI turn (Black)
  useEffect(() => {
    if (mode === "pvp" || gameOver || turn !== "b") return
    setAiThinking(true)
    const id = window.setTimeout(() => {
      const move = pickAiMove(fen, mode)
      if (move) {
        const next = new Chess(fen)
        try {
          const res = next.move({ from: move.from, to: move.to, promotion: "q" })
          if (res) {
            if (next.inCheck() && !next.isCheckmate()) playCheck()
            else if (res.captured) playCapture()
            else playMove()
          }
          setHistory((prev) => [...prev, fen])
          setFen(next.fen())
          setLastMove(move)
        } catch {}
      }
      setAiThinking(false)
    }, 280)
    return () => window.clearTimeout(id)
  }, [fen, gameOver, mode, turn])

  const statusText = useMemo(() => {
    if (chess.isCheckmate()) {
      const winner = turn === "w" ? (language === "fr" ? "Les Noirs" : "Black") : language === "fr" ? "Les Blancs" : "White"
      return language === "fr" ? `Échec et mat ! ${winner} gagnent 🏆` : `Checkmate! ${winner} win 🏆`
    }
    if (chess.isStalemate()) return language === "fr" ? "Pat — Match nul !" : "Stalemate — Draw!"
    if (chess.isDraw()) return language === "fr" ? "Match nul !" : "Draw!"
    if (aiThinking) return language === "fr" ? "L'IA réfléchit…" : "AI is thinking…"
    const checkSuffix = chess.inCheck() ? (language === "fr" ? " · Échec !" : " · Check!") : ""
    if (mode === "pvp") {
      return `${turn === "w" ? (language === "fr" ? "Trait aux Blancs" : "White to move") : language === "fr" ? "Trait aux Noirs" : "Black to move"}${checkSuffix}`
    }
    return `${turn === "w" ? (language === "fr" ? "À vous de jouer (Blancs)" : "Your turn (White)") : language === "fr" ? "Tour de l'IA (Noirs)" : "AI turn (Black)"}${checkSuffix}`
  }, [aiThinking, chess, language, mode, turn])

  const modes: { id: Mode; label: string }[] = [
    { id: "easy", label: language === "fr" ? "IA Facile" : "Easy AI" },
    { id: "normal", label: language === "fr" ? "IA Normale" : "Normal AI" },
    { id: "hard", label: language === "fr" ? "IA Difficile" : "Hard AI" },
    { id: "pvp", label: language === "fr" ? "2 Joueurs" : "2 Players" },
  ]

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
        show={gameOver}
        outcome={
          chess.isCheckmate()
            ? mode === "pvp" || turn === "b"
              ? "win"
              : "lose"
            : "draw"
        }
        title={statusText}
        subtitle={
          chess.isCheckmate()
            ? language === "fr"
              ? `Partie terminée en ${history.length} coups.`
              : `Finished in ${history.length} moves.`
            : language === "fr"
              ? "Aucun camp ne l'emporte — belle bataille !"
              : "Neither side wins — great battle!"
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
            onClick={handleUndo}
            disabled={history.length === 0 || aiThinking}
            className="btn btn-outline h-9 px-3"
            title={language === "fr" ? "Annuler" : "Undo"}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setOrientation((o) => (o === "w" ? "b" : "w"))}
            className="btn btn-outline h-9 px-3"
            title={language === "fr" ? "Retourner l'échiquier" : "Flip board"}
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

      {/* 8x8 Chessboard */}
      <ChessBoard
        fen={fen}
        orientation={orientation}
        interactive={!gameOver && !aiThinking}
        allowedColor={mode === "pvp" ? "both" : "w"}
        lastMove={lastMove}
        onMove={applyMove}
      />

      {/* Captured pieces & material balance */}
      <ChessCapturedBar
        fen={fen}
        whiteLabel={mode === "pvp" ? "Blancs" : language === "fr" ? "Vous" : "You"}
        blackLabel={mode === "pvp" ? "Noirs" : "IA"}
        className="max-w-[520px]"
      />

      {mode !== "pvp" && (
        <p className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          {tr(gamesCopy.record, language)} : {wins} {language === "fr" ? "victoires contre l'IA" : "wins vs AI"}
        </p>
      )}
    </div>
  )
}
