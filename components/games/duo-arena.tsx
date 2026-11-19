"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Check,
  CircleDot,
  Copy,
  Hand,
  Hash,
  HelpCircle,
  LogOut,
  Plus,
  RotateCcw,
  Share2,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

import type { DuoGameType, DuoRoom, RpsChoice } from "@/app/api/games/rooms/route"
import { useLanguage } from "@/components/language-provider"
import { getPlayerId, readScore, saveBestScore } from "@/lib/games"
import { cn } from "@/lib/utils"

interface DuoArenaProps {
  gameType: DuoGameType
  scoreKey: string
  playerName: string
  initialRoomCode?: string | null
  onRoomChange?: (code: string | null) => void
}

type ReactionPhase = "idle" | "waiting" | "ready" | "tooSoon"

const DUO_MODES: {
  id: DuoGameType
  Icon: LucideIcon
  fr: string
  en: string
  subFr: string
  subEn: string
}[] = [
  { id: "connect4", Icon: CircleDot, fr: "Puissance 4", en: "Connect 4", subFr: "Grille 7×6", subEn: "7×6 grid" },
  { id: "tictactoe", Icon: Hash, fr: "Morpion 1v1", en: "Tic-Tac-Toe", subFr: "Grille 3×3", subEn: "3×3 grid" },
  { id: "rps", Icon: Hand, fr: "Chifoumi", en: "Rock Paper Scissors", subFr: "Premier à 3", subEn: "First to 3" },
  { id: "quiz", Icon: HelpCircle, fr: "Quiz Dev 1v1", en: "Dev Quiz 1v1", subFr: "5 questions", subEn: "5 questions" },
  { id: "reaction", Icon: Zap, fr: "Duel Réflexe", en: "Reflex Duel", subFr: "3 manches · ms", subEn: "3 rounds · ms" },
]

const RPS_LABELS: Record<RpsChoice, { emoji: string; fr: string; en: string }> = {
  rock: { emoji: "🪨", fr: "Pierre", en: "Rock" },
  paper: { emoji: "📄", fr: "Feuille", en: "Paper" },
  scissors: { emoji: "✂️", fr: "Ciseaux", en: "Scissors" },
}

export default function DuoArena({ gameType, scoreKey, playerName, initialRoomCode, onRoomChange }: DuoArenaProps) {
  const { language } = useLanguage()
  const [playerId, setPlayerId] = useState("")
  const [joinCode, setJoinCode] = useState(initialRoomCode ?? "")
  const [room, setRoom] = useState<DuoRoom | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [hoverCol, setHoverCol] = useState<number | null>(null)

  // Reaction duel local state
  const [rxPhase, setRxPhase] = useState<ReactionPhase>("idle")
  const rxTimerRef = useRef<number | null>(null)
  const rxStartRef = useRef<number>(0)
  const lastWinCountRef = useRef<number>(0)
  const autoJoinedRef = useRef<string | null>(null)

  useEffect(() => {
    setPlayerId(getPlayerId())
    return () => {
      if (rxTimerRef.current !== null) window.clearTimeout(rxTimerRef.current)
    }
  }, [])

  const updateRoom = useCallback(
    (next: DuoRoom | null) => {
      setRoom(next)
      onRoomChange?.(next?.code ?? null)
    },
    [onRoomChange],
  )

  const handleJoin = useCallback(
    async (codeToJoin: string) => {
      const clean = codeToJoin.trim().toUpperCase()
      if (!clean || !playerId || playerName.length < 2) return
      setBusy(true)
      setError(null)
      try {
        const res = await fetch("/api/games/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "join", code: clean, playerId, playerName }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Impossible de rejoindre le salon")
          return
        }
        updateRoom(data.room as DuoRoom)
      } catch {
        setError(language === "fr" ? "Erreur réseau" : "Network error")
      } finally {
        setBusy(false)
      }
    },
    [language, playerId, playerName, updateRoom],
  )

  useEffect(() => {
    if (
      initialRoomCode &&
      playerId &&
      playerName.length >= 2 &&
      !room &&
      autoJoinedRef.current !== initialRoomCode
    ) {
      autoJoinedRef.current = initialRoomCode
      handleJoin(initialRoomCode)
    }
  }, [handleJoin, initialRoomCode, playerId, playerName, room])

  // Poll active room every 1s
  useEffect(() => {
    if (!room || !playerId) return
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(
          `/api/games/rooms?code=${encodeURIComponent(room.code)}&playerId=${encodeURIComponent(playerId)}`,
          { cache: "no-store" },
        )
        if (!res.ok) return
        const data = await res.json()
        if (data.room) setRoom(data.room as DuoRoom)
      } catch {}
    }, 1000)
    return () => window.clearInterval(id)
  }, [playerId, room?.code])

  // Track cumulative duo wins for leaderboard
  useEffect(() => {
    if (!room || !playerId) return
    const myWins =
      room.host.id === playerId
        ? room.host.wins
        : room.guest?.id === playerId
          ? room.guest.wins
          : 0
    if (myWins > lastWinCountRef.current) {
      const delta = myWins - lastWinCountRef.current
      lastWinCountRef.current = myWins
      const prevTotal = readScore(scoreKey) ?? 0
      saveBestScore(scoreKey, prevTotal + delta)
    }
  }, [playerId, room, scoreKey])

  const sendRoomAction = async (payload: Record<string, unknown>) => {
    if (!room) return
    try {
      const res = await fetch("/api/games/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: room.code, playerId, ...payload }),
      })
      const data = await res.json()
      if (res.ok && data.room) setRoom(data.room as DuoRoom)
    } catch {}
  }

  const handleCreate = async () => {
    if (!playerId || playerName.length < 2) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/games/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          gameType,
          playerId,
          playerName,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création")
        return
      }
      lastWinCountRef.current = 0
      updateRoom(data.room as DuoRoom)
    } catch {
      setError(language === "fr" ? "Erreur réseau" : "Network error")
    } finally {
      setBusy(false)
    }
  }

  const handleLeave = () => {
    if (rxTimerRef.current !== null) window.clearTimeout(rxTimerRef.current)
    setRxPhase("idle")
    lastWinCountRef.current = 0
    setError(null)
    updateRoom(null)
  }

  const shareUrl =
    typeof window !== "undefined" && room
      ? `${window.location.origin}/jeux?room=${room.code}`
      : ""

  const copyInviteLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const nativeShare = async () => {
    if (!shareUrl || !room) return
    const modeInfo = DUO_MODES.find((m) => m.id === room.gameType)
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `F_Junior — ${modeInfo ? (language === "fr" ? modeInfo.fr : modeInfo.en) : "Duo"}`,
          text:
            language === "fr"
              ? `${playerName} vous défie en ligne ! Rejoignez le salon ${room.code} :`
              : `${playerName} challenges you online! Join room ${room.code}:`,
          url: shareUrl,
        })
        return
      } catch {}
    }
    copyInviteLink()
  }

  const handleRematch = async () => {
    if (rxTimerRef.current !== null) window.clearTimeout(rxTimerRef.current)
    setRxPhase("idle")
    await sendRoomAction({ action: "rematch" })
  }

  const triggerReaction = async () => {
    if (!room || room.status !== "playing") return
    const myTimes = room.host.id === playerId ? room.hostTimes : room.guestTimes
    if (myTimes.length >= room.reactionTargetRounds) return

    if (rxPhase === "idle" || rxPhase === "tooSoon") {
      setRxPhase("waiting")
      const delay = 1300 + Math.random() * 2600
      rxTimerRef.current = window.setTimeout(() => {
        rxStartRef.current = performance.now()
        setRxPhase("ready")
      }, delay)
      return
    }
    if (rxPhase === "waiting") {
      if (rxTimerRef.current !== null) window.clearTimeout(rxTimerRef.current)
      setRxPhase("tooSoon")
      return
    }
    if (rxPhase === "ready") {
      const ms = Math.max(50, Math.round(performance.now() - rxStartRef.current))
      setRxPhase("idle")
      await sendRoomAction({ action: "reaction_result", ms })
    }
  }

  // Lobby view (dedicated to this specific gameType)
  if (!room) {
    const info = DUO_MODES.find((m) => m.id === gameType) ?? DUO_MODES[0]
    const Icon = info.Icon
    return (
      <div className="mx-auto flex w-full max-w-[540px] flex-col gap-5">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <p className="eyebrow text-primary">
            {language === "fr" ? "Salon 1v1 en ligne" : "Online 1v1 Room"} ·{" "}
            {language === "fr" ? info.subFr : info.subEn}
          </p>
          <h3 className="mt-1 font-serif text-3xl sm:text-4xl">
            {language === "fr" ? info.fr : info.en}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === "fr"
              ? "Créez un salon privé et partagez le lien à votre ami, ou rejoignez une partie avec un code."
              : "Create a private room and share the link with your friend, or join a match with a code."}
          </p>
        </div>

        {/* Create room */}
        <div className="rounded-md border border-border bg-background p-5 sm:p-6">
          <p className="eyebrow mb-3">
            {language === "fr" ? "01 · Créer un salon" : "01 · Create a room"}
          </p>
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy || playerName.length < 2}
            className="btn btn-solid w-full"
          >
            <Plus className="h-4 w-4" />
            {language === "fr"
              ? `Créer un salon ${info.fr}`
              : `Create ${info.en} room`}
          </button>
        </div>

        {/* Join room */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleJoin(joinCode)
          }}
          className="rounded-md border border-border bg-background p-5 sm:p-6"
        >
          <p className="eyebrow mb-3">
            {language === "fr" ? "02 · Rejoindre avec un code" : "02 · Join with a code"}
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="EX : A7K9P2"
              maxLength={8}
              className="h-11 flex-1 rounded-md border border-input bg-card px-4 font-mono text-sm uppercase tracking-widest text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || joinCode.trim().length < 4 || playerName.length < 2}
              className="btn btn-outline shrink-0 px-6"
            >
              <Users className="h-4 w-4" />
              {language === "fr" ? "Rejoindre" : "Join"}
            </button>
          </div>
        </form>

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-center text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }

  // Active Room View
  const isHost = room.host.id === playerId
  const myTttSymbol = isHost ? "X" : "O"
  const myC4Disc = isHost ? "R" : "Y"
  const modeMeta = DUO_MODES.find((m) => m.id === room.gameType)
  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-5">
      {/* Room top bar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2.5 rounded-md border border-border bg-background px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="eyebrow">
            {modeMeta ? (language === "fr" ? modeMeta.fr : modeMeta.en) : "Duo"}
          </span>
          <span className="rounded bg-primary/15 px-2.5 py-0.5 font-mono text-sm font-bold tracking-widest text-primary">
            {room.code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={copyInviteLink} className="btn btn-outline h-8 px-3 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied
              ? language === "fr"
                ? "Copié !"
                : "Copied!"
              : language === "fr"
                ? "Copier le lien"
                : "Copy link"}
          </button>
          <button type="button" onClick={nativeShare} className="btn btn-outline h-8 px-3 text-xs" aria-label="Share">
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleLeave}
            className="btn btn-outline h-8 px-3 text-xs hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Leave room"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Players Scoreboard */}
      <div className="grid w-full grid-cols-2 gap-3">
        <div
          className={cn(
            "rounded-md border p-3.5 transition-colors",
            ((room.gameType === "tictactoe" && room.turn === "X") ||
              (room.gameType === "connect4" && room.c4Turn === "R")) &&
              room.status === "playing"
              ? "border-primary bg-primary/10"
              : "border-border bg-background",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow inline-flex items-center gap-1.5 text-primary">
              {room.gameType === "connect4" && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              {room.gameType === "tictactoe" ? "X · " : ""}
              {isHost ? (language === "fr" ? "Vous" : "You") : language === "fr" ? "Hôte" : "Host"}
            </span>
            <span className="font-mono text-lg font-semibold tabular-nums">{room.host.wins}</span>
          </div>
          <p className="mt-1 truncate font-medium">{room.host.name}</p>
        </div>

        <div
          className={cn(
            "rounded-md border p-3.5 transition-colors",
            ((room.gameType === "tictactoe" && room.turn === "O") ||
              (room.gameType === "connect4" && room.c4Turn === "Y")) &&
              room.status === "playing"
              ? "border-amber-500 bg-amber-500/10"
              : "border-border bg-background",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow inline-flex items-center gap-1.5">
              {room.gameType === "connect4" && <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
              {room.gameType === "tictactoe" ? "O · " : ""}
              {!isHost && room.guest
                ? language === "fr"
                  ? "Vous"
                  : "You"
                : language === "fr"
                  ? "Adversaire"
                  : "Opponent"}
            </span>
            <span className="font-mono text-lg font-semibold tabular-nums">{room.guest?.wins ?? 0}</span>
          </div>
          <p className="mt-1 truncate font-medium text-muted-foreground">
            {room.guest ? (
              <span className="text-foreground">{room.guest.name}</span>
            ) : language === "fr" ? (
              "En attente…"
            ) : (
              "Waiting…"
            )}
          </p>
        </div>
      </div>

      {/* Waiting for guest */}
      {room.status === "waiting" && (
        <div className="flex w-full flex-col items-center gap-4 rounded-md border border-dashed border-primary/40 bg-primary/5 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-serif text-2xl">
              {language === "fr" ? "En attente de votre adversaire…" : "Waiting for your opponent…"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === "fr"
                ? "Partagez ce lien avec un ami pour démarrer automatiquement la partie :"
                : "Share this link with a friend to start the match automatically:"}
            </p>
          </div>
          <div className="flex w-full max-w-md flex-col gap-2 rounded-md border border-border bg-background p-2 sm:flex-row sm:items-center">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full flex-1 bg-transparent px-2 font-mono text-xs text-muted-foreground focus:outline-none"
            />
            <button type="button" onClick={copyInviteLink} className="btn btn-solid h-9 w-full px-3.5 text-xs sm:h-8 sm:w-auto">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? (language === "fr" ? "Copié !" : "Copied!") : language === "fr" ? "Copier" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* 1. CONNECT 4 (PUISSANCE 4) */}
      {room.status !== "waiting" && room.gameType === "connect4" && (
        <>
          <p className="font-serif text-2xl">
            {room.c4Winner === "draw"
              ? language === "fr"
                ? "Match nul !"
                : "Draw!"
              : room.c4Winner
                ? room.c4Winner === myC4Disc
                  ? language === "fr"
                    ? "Puissance 4 ! Vous gagnez 🎉"
                    : "Connect 4! You win 🎉"
                  : language === "fr"
                    ? `${room.c4Winner === "R" ? room.host.name : room.guest?.name} gagne !`
                    : `${room.c4Winner === "R" ? room.host.name : room.guest?.name} wins!`
                : room.c4Turn === myC4Disc
                  ? language === "fr"
                    ? "À vous de jouer — choisissez une colonne"
                    : "Your turn — pick a column"
                  : language === "fr"
                    ? `Tour de ${room.c4Turn === "R" ? room.host.name : room.guest?.name}…`
                    : `${room.c4Turn === "R" ? room.host.name : room.guest?.name}'s turn…`}
          </p>

          <div
            className="w-full max-w-[490px] rounded-lg border border-border bg-muted/50 p-2 sm:p-3.5"
            onMouseLeave={() => setHoverCol(null)}
          >
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {room.c4Board.map((cell, idx) => {
                const col = idx % 7
                const isWin = room.c4WinLine?.includes(idx) ?? false
                const canDrop = room.status === "playing" && room.c4Turn === myC4Disc && room.c4Board[col] === null
                return (
                  <button
                    key={idx}
                    type="button"
                    onMouseEnter={() => setHoverCol(col)}
                    onClick={() => canDrop && sendRoomAction({ action: "c4_drop", col })}
                    disabled={!canDrop}
                    aria-label={`Col ${col + 1}`}
                    className={cn(
                      "aspect-square rounded-full border-2 transition-all duration-150",
                      cell === "R" && "border-primary bg-primary shadow-sm",
                      cell === "Y" && "border-amber-500 bg-amber-500 shadow-sm",
                      cell === null &&
                        (hoverCol === col && canDrop
                          ? "border-primary/50 bg-primary/10"
                          : "border-border bg-background/90"),
                      isWin && "ring-4 ring-foreground/60 scale-105",
                    )}
                  />
                )
              })}
            </div>
          </div>

          {room.status === "finished" && (
            <button type="button" onClick={handleRematch} className="btn btn-solid">
              <RotateCcw className="h-4 w-4" />
              {language === "fr" ? "Revanche" : "Rematch"}
            </button>
          )}
        </>
      )}

      {/* 2. TIC-TAC-TOE 1v1 */}
      {room.status !== "waiting" && room.gameType === "tictactoe" && (
        <>
          <p className="font-serif text-2xl">
            {room.winner === "draw"
              ? language === "fr"
                ? "Match nul !"
                : "Draw!"
              : room.winner
                ? room.winner === myTttSymbol
                  ? language === "fr"
                    ? "Victoire ! 🎉"
                    : "You win! 🎉"
                  : language === "fr"
                    ? `${room.winner === "X" ? room.host.name : room.guest?.name} gagne !`
                    : `${room.winner === "X" ? room.host.name : room.guest?.name} wins!`
                : room.turn === myTttSymbol
                  ? language === "fr"
                    ? `À vous de jouer (${myTttSymbol})`
                    : `Your turn (${myTttSymbol})`
                  : language === "fr"
                    ? `Tour de ${room.turn === "X" ? room.host.name : room.guest?.name}…`
                    : `${room.turn === "X" ? room.host.name : room.guest?.name}'s turn…`}
          </p>

          <div className="grid aspect-square w-full max-w-[400px] grid-cols-3 grid-rows-3 gap-3">
            {room.board.map((cell, idx) => {
              const isWin = room.winLine?.includes(idx) ?? false
              const canPlay = room.status === "playing" && room.turn === myTttSymbol && cell === null
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => canPlay && sendRoomAction({ action: "move", index: idx })}
                  disabled={!canPlay}
                  className={cn(
                    "flex items-center justify-center rounded-md border font-serif text-5xl transition-all sm:text-6xl",
                    isWin
                      ? "border-primary bg-primary/15 text-primary scale-[1.02]"
                      : canPlay
                        ? "border-border bg-background hover:border-primary"
                        : "border-border bg-background/60",
                    cell === "X" && !isWin && "text-primary",
                    cell === "O" && !isWin && "text-foreground",
                  )}
                >
                  {cell}
                </button>
              )
            })}
          </div>

          {room.status === "finished" && (
            <button type="button" onClick={handleRematch} className="btn btn-solid">
              <RotateCcw className="h-4 w-4" />
              {language === "fr" ? "Revanche" : "Rematch"}
            </button>
          )}
        </>
      )}

      {/* 3. ROCK PAPER SCISSORS (CHIFOUMI) */}
      {room.status !== "waiting" && room.gameType === "rps" && (
        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex items-center gap-4 font-mono text-sm">
            <span className="rounded-full border border-border bg-background px-3.5 py-1">
              {room.host.name} : <strong className="text-primary">{room.rpsHostScore}</strong> / {room.rpsTarget}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span className="rounded-full border border-border bg-background px-3.5 py-1">
              {room.guest?.name} : <strong className="text-primary">{room.rpsGuestScore}</strong> / {room.rpsTarget}
            </span>
          </div>

          {room.rpsLastRound && (
            <div className="w-full rounded-md border border-border bg-background px-4 py-3 text-center">
              <p className="eyebrow">{language === "fr" ? "Manche précédente" : "Previous round"}</p>
              <p className="mt-1.5 text-lg">
                {room.host.name} {RPS_LABELS[room.rpsLastRound.host].emoji} vs{" "}
                {RPS_LABELS[room.rpsLastRound.guest].emoji} {room.guest?.name}
                <span className="ml-2 font-mono text-xs text-primary">
                  —{" "}
                  {room.rpsLastRound.winner === "draw"
                    ? language === "fr"
                      ? "Égalité"
                      : "Draw"
                    : room.rpsLastRound.winner === "host"
                      ? room.host.name
                      : room.guest?.name}
                </span>
              </p>
            </div>
          )}

          {room.status === "finished" ? (
            <div className="flex w-full flex-col items-center gap-4 rounded-md border border-primary/30 bg-primary/5 p-7 text-center">
              <Trophy className="h-8 w-8 text-primary" />
              <p className="font-serif text-3xl">
                {(room.rpsWinner === "host" && isHost) || (room.rpsWinner === "guest" && !isHost)
                  ? language === "fr"
                    ? "Victoire au Chifoumi ! 🎉"
                    : "You win! 🎉"
                  : language === "fr"
                    ? `${room.rpsWinner === "host" ? room.host.name : room.guest?.name} remporte la partie !`
                    : `${room.rpsWinner === "host" ? room.host.name : room.guest?.name} wins!`}
              </p>
              <button type="button" onClick={handleRematch} className="btn btn-solid">
                <RotateCcw className="h-4 w-4" />
                {language === "fr" ? "Revanche" : "Rematch"}
              </button>
            </div>
          ) : (
            (() => {
              const myPick = isHost ? room.rpsHostChoice : room.rpsGuestChoice
              const oppPicked = isHost ? room.rpsGuestChoice !== null : room.rpsHostChoice !== null
              return (
                <div className="w-full space-y-4 text-center">
                  <p className="font-serif text-2xl">
                    {myPick
                      ? language === "fr"
                        ? "Choix verrouillé ! En attente de votre adversaire…"
                        : "Locked in! Waiting for opponent…"
                      : oppPicked
                        ? language === "fr"
                          ? "Votre adversaire a choisi — à vous !"
                          : "Opponent locked in — your turn!"
                        : language === "fr"
                          ? `Manche ${room.rpsRound} — Faites votre choix`
                          : `Round ${room.rpsRound} — Make your pick`}
                  </p>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {(["rock", "paper", "scissors"] as RpsChoice[]).map((choice) => {
                      const info = RPS_LABELS[choice]
                      const selected = myPick === choice
                      return (
                        <button
                          key={choice}
                          type="button"
                          disabled={myPick !== null}
                          onClick={() => sendRoomAction({ action: "rps_pick", choice })}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 rounded-md border p-3.5 transition-all sm:gap-2 sm:p-6",
                            selected
                              ? "border-primary bg-primary/15 scale-[1.02]"
                              : myPick
                                ? "border-border bg-background/50 opacity-50"
                                : "border-border bg-background hover:border-primary hover:bg-primary/5",
                          )}
                        >
                          <span className="text-3xl sm:text-4xl">{info.emoji}</span>
                          <span className="font-mono text-[10px] uppercase tracking-wider sm:text-xs">
                            {language === "fr" ? info.fr : info.en}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()
          )}
        </div>
      )}

      {/* 4. QUIZ DEV 1v1 */}
      {room.status !== "waiting" && room.gameType === "quiz" && (
        <div className="flex w-full flex-col items-center gap-5">
          <div className="grid w-full grid-cols-2 gap-3 text-center">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="eyebrow">{room.host.name}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {room.quizHostScore} / {room.quizQuestions.length}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {room.quizHostAnswers.length}/{room.quizQuestions.length}{" "}
                {language === "fr" ? "répondues" : "answered"}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="eyebrow">{room.guest?.name}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {room.quizGuestScore} / {room.quizQuestions.length}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {room.quizGuestAnswers.length}/{room.quizQuestions.length}{" "}
                {language === "fr" ? "répondues" : "answered"}
              </p>
            </div>
          </div>

          {room.status === "finished" ? (
            <div className="flex w-full flex-col items-center gap-4 rounded-md border border-primary/30 bg-primary/5 p-7 text-center">
              <Trophy className="h-8 w-8 text-primary" />
              <p className="font-serif text-3xl">
                {room.quizWinner === "draw"
                  ? language === "fr"
                    ? "Égalité parfaite !"
                    : "Perfect tie!"
                  : (room.quizWinner === "host" && isHost) || (room.quizWinner === "guest" && !isHost)
                    ? language === "fr"
                      ? "Vous remportez le Quiz Dev ! 🏆"
                      : "You win the Dev Quiz! 🏆"
                    : language === "fr"
                      ? `${room.quizWinner === "host" ? room.host.name : room.guest?.name} remporte le quiz !`
                      : `${room.quizWinner === "host" ? room.host.name : room.guest?.name} wins the quiz!`}
              </p>
              <button type="button" onClick={handleRematch} className="btn btn-solid">
                <RotateCcw className="h-4 w-4" />
                {language === "fr" ? "Nouveau Quiz" : "New Quiz"}
              </button>
            </div>
          ) : (
            (() => {
              const myAnswers = isHost ? room.quizHostAnswers : room.quizGuestAnswers
              const qIdx = myAnswers.length
              if (qIdx >= room.quizQuestions.length) {
                return (
                  <div className="w-full rounded-md border border-border bg-background p-8 text-center">
                    <p className="font-serif text-3xl">
                      {language === "fr" ? "Quiz terminé !" : "Quiz finished!"}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {language === "fr"
                        ? "En attente des dernières réponses de votre adversaire…"
                        : "Waiting for your opponent to finish…"}
                    </p>
                  </div>
                )
              }
              const currentQ = room.quizQuestions[qIdx]
              return (
                <div className="w-full rounded-md border border-border bg-background p-6">
                  <p className="eyebrow text-primary">
                    Question {qIdx + 1} / {room.quizQuestions.length}
                  </p>
                  <h4 className="mt-2 font-serif text-2xl leading-snug">
                    {language === "fr" ? currentQ.q.fr : currentQ.q.en}
                  </h4>
                  <div className="mt-5 grid gap-2.5">
                    {currentQ.options.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => sendRoomAction({ action: "quiz_answer", optionIdx: idx })}
                        className="flex items-center gap-3 rounded-md border border-border bg-card/60 px-4 py-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/10"
                      >
                        <span className="font-mono text-xs text-primary">{String.fromCharCode(65 + idx)}</span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })()
          )}
        </div>
      )}

      {/* 5. REACTION DUEL 1v1 */}
      {room.status !== "waiting" && room.gameType === "reaction" && (
        <>
          <div className="grid w-full grid-cols-2 gap-3 text-center">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="eyebrow">{room.host.name}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {avg(room.hostTimes) !== null ? `${avg(room.hostTimes)} ms` : "—"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {room.hostTimes.length}/{room.reactionTargetRounds} ·{" "}
                {room.hostTimes.map((v) => `${v}ms`).join(" / ") || "…"}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="eyebrow">{room.guest?.name}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {avg(room.guestTimes) !== null ? `${avg(room.guestTimes)} ms` : "—"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {room.guestTimes.length}/{room.reactionTargetRounds} ·{" "}
                {room.guestTimes.map((v) => `${v}ms`).join(" / ") || "…"}
              </p>
            </div>
          </div>

          {room.status === "finished" ? (
            <div className="flex w-full flex-col items-center gap-4 rounded-md border border-primary/30 bg-primary/5 p-8 text-center">
              <Trophy className="h-8 w-8 text-primary" />
              <p className="font-serif text-3xl">
                {room.reactionWinner === "draw"
                  ? language === "fr"
                    ? "Égalité parfaite !"
                    : "Perfect tie!"
                  : (room.reactionWinner === "host" && isHost) || (room.reactionWinner === "guest" && !isHost)
                    ? language === "fr"
                      ? "Vous remportez le duel ! ⚡"
                      : "You win the duel! ⚡"
                    : language === "fr"
                      ? `${room.reactionWinner === "host" ? room.host.name : room.guest?.name} remporte le duel !`
                      : `${room.reactionWinner === "host" ? room.host.name : room.guest?.name} wins the duel!`}
              </p>
              <button type="button" onClick={handleRematch} className="btn btn-solid">
                <RotateCcw className="h-4 w-4" />
                {language === "fr" ? "Revanche" : "Rematch"}
              </button>
            </div>
          ) : (
            (() => {
              const myTimes = isHost ? room.hostTimes : room.guestTimes
              if (myTimes.length >= room.reactionTargetRounds) {
                return (
                  <div className="flex min-h-[260px] w-full flex-col items-center justify-center gap-2 rounded-md border border-border bg-background p-8 text-center">
                    <p className="font-serif text-3xl">
                      {language === "fr" ? "Vos 3 essais sont enregistrés !" : "Your 3 attempts are in!"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === "fr"
                        ? "En attente de la fin des essais de votre adversaire…"
                        : "Waiting for your opponent to finish…"}
                    </p>
                  </div>
                )
              }
              return (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    triggerReaction()
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    triggerReaction()
                  }}
                  className={cn(
                    "flex min-h-[280px] w-full flex-col items-center justify-center gap-3 rounded-md border p-8 text-center transition-colors select-none",
                    rxPhase === "idle" && "border-border bg-background hover:border-primary",
                    rxPhase === "waiting" && "border-amber-500/50 bg-amber-500/15",
                    rxPhase === "ready" && "border-primary bg-primary text-primary-foreground",
                    rxPhase === "tooSoon" && "border-destructive/50 bg-destructive/15",
                  )}
                >
                  <Zap className={cn("h-7 w-7", rxPhase === "ready" ? "text-primary-foreground" : "text-primary")} />
                  <p className="eyebrow">
                    {language === "fr"
                      ? `Essai ${myTimes.length + 1} / ${room.reactionTargetRounds}`
                      : `Attempt ${myTimes.length + 1} / ${room.reactionTargetRounds}`}
                  </p>
                  <p className="font-serif text-3xl sm:text-4xl">
                    {rxPhase === "idle" && (language === "fr" ? "Cliquez pour lancer" : "Click to start")}
                    {rxPhase === "waiting" && (language === "fr" ? "Attendez le bleu…" : "Wait for blue…")}
                    {rxPhase === "ready" && (language === "fr" ? "CLIQUEZ !" : "CLICK!")}
                    {rxPhase === "tooSoon" && (language === "fr" ? "Trop tôt ! Réessayez" : "Too soon! Try again")}
                  </p>
                </button>
              )
            })()
          )}
        </>
      )}
    </div>
  )
}
