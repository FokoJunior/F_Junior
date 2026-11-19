"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Check,
  CircleDot,
  Clock,
  Copy,
  Eye,
  Flag,
  Hand,
  Hash,
  HelpCircle,
  LogOut,
  Plus,
  Power,
  RotateCcw,
  Share2,
  Sparkles,
  Trophy,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

import type { DuoGameType, DuoRoom, RpsChoice } from "@/app/api/games/rooms/route"
import { useLanguage } from "@/components/language-provider"
import { getPlayerId, readScore, saveBestScore, setPlayerName } from "@/lib/games"
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

const BURST_PARTICLES = [
  { x: -120, y: -70, color: "#3b82f6" },
  { x: -75, y: -110, color: "#f59e0b" },
  { x: -25, y: -125, color: "#10b981" },
  { x: 30, y: -120, color: "#60a5fa" },
  { x: 85, y: -105, color: "#f97316" },
  { x: 125, y: -65, color: "#8b5cf6" },
  { x: -100, y: 40, color: "#38bdf8" },
  { x: 105, y: 45, color: "#fbbf24" },
]

function fmtClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export default function DuoArena({ gameType, scoreKey, playerName, initialRoomCode, onRoomChange }: DuoArenaProps) {
  const { language } = useLanguage()
  const [playerId, setPlayerId] = useState("")
  const [joinCode, setJoinCode] = useState(initialRoomCode ?? "")
  const [joinName, setJoinName] = useState(playerName || "")
  const [room, setRoom] = useState<DuoRoom | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const [nowTick, setNowTick] = useState<number>(() => Date.now())

  // Reaction duel local state
  const [rxPhase, setRxPhase] = useState<ReactionPhase>("idle")
  const rxTimerRef = useRef<number | null>(null)
  const rxStartRef = useRef<number>(0)
  const lastWinCountRef = useRef<number>(0)

  useEffect(() => {
    setPlayerId(getPlayerId())
    return () => {
      if (rxTimerRef.current !== null) window.clearTimeout(rxTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (playerName && !joinName) {
      setJoinName(playerName)
    }
  }, [joinName, playerName])

  // 1-second local clock tick for live timers
  useEffect(() => {
    if (!room || room.status !== "playing") return
    const id = window.setInterval(() => setNowTick(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [room?.status])

  const updateRoom = useCallback(
    (next: DuoRoom | null) => {
      setRoom(next)
      onRoomChange?.(next?.code ?? null)
    },
    [onRoomChange],
  )

  const handleJoin = useCallback(
    async (codeToJoin: string, asSpectator = false) => {
      const cleanCode = codeToJoin.trim().toUpperCase()
      const cleanName = (joinName || playerName).trim()
      if (!cleanCode || !playerId) return

      if (!asSpectator) {
        if (cleanName.length < 2) {
          setError(language === "fr" ? "Veuillez entrer votre nom avant d'entrer dans la partie." : "Please enter your name before joining.")
          return
        }
        if (cleanName.toUpperCase() === cleanCode) {
          setError(language === "fr" ? "Entrez votre prénom ou pseudo (pas le code du salon)." : "Please enter your name, not the room code.")
          return
        }
        setPlayerName(cleanName)
      }

      setBusy(true)
      setError(null)
      try {
        const res = await fetch("/api/games/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: asSpectator ? "spectate" : "join",
            code: cleanCode,
            playerId,
            playerName: cleanName || "Spectateur",
          }),
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
    [joinName, language, playerId, playerName, updateRoom],
  )

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
    const cleanName = (joinName || playerName).trim()
    if (!playerId || cleanName.length < 2) {
      setError(language === "fr" ? "Veuillez entrer votre nom (2 caractères min.)." : "Please enter your name.")
      return
    }
    setPlayerName(cleanName)
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
          playerName: cleanName,
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

  const handleForfeit = async () => {
    if (!room) return
    if (!window.confirm(language === "fr" ? "Abandonner cette manche ? Votre adversaire sera déclaré vainqueur." : "Forfeit this round? Your opponent will win.")) {
      return
    }
    await sendRoomAction({ action: "forfeit" })
  }

  const handleEndMatch = async () => {
    if (!room) return
    const isPlayer = room.host.id === playerId || room.guest?.id === playerId
    if (isPlayer) {
      const msg =
        room.status === "playing"
          ? language === "fr"
            ? "Mettre fin à la partie maintenant ? La manche en cours sera attribuée à votre adversaire."
            : "End the match now? The current round will be awarded to your opponent."
          : language === "fr"
            ? "Mettre fin au salon pour tous les joueurs ?"
            : "End the room for all players?"
      if (!window.confirm(msg)) return
      await sendRoomAction({ action: "end_match" })
    } else {
      await sendRoomAction({ action: "end_match" })
      updateRoom(null)
    }
  }

  const handleLeaveLocal = () => {
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
              ? `${room.host.name} vous défie en ligne ! Rejoignez le salon ${room.code} :`
              : `${room.host.name} challenges you online! Join room ${room.code}:`,
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
    const isHostP = room.host.id === playerId
    const isGuestP = room.guest?.id === playerId
    if (!isHostP && !isGuestP) return
    const myTimes = isHostP ? room.hostTimes : room.guestTimes
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

  // LOBBY VIEW (Pre-join Name confirmation + Create OR Join/Spectate)
  if (!room) {
    const info = DUO_MODES.find((m) => m.id === gameType) ?? DUO_MODES[0]
    const Icon = info.Icon
    const isDirectInvite = Boolean(initialRoomCode)

    return (
      <div className="mx-auto flex w-full max-w-[540px] flex-col gap-5">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <p className="eyebrow text-primary">
            {isDirectInvite
              ? language === "fr"
                ? `Invitation · Salon ${initialRoomCode}`
                : `Invite · Room ${initialRoomCode}`
              : `${language === "fr" ? "Salon 1v1 en ligne" : "Online 1v1 Room"} · ${language === "fr" ? info.subFr : info.subEn}`}
          </p>
          <h3 className="mt-1 font-serif text-3xl sm:text-4xl">
            {language === "fr" ? info.fr : info.en}
          </h3>
        </div>

        {/* Name confirmation box (always visible before entering!) */}
        <div className="rounded-md border border-border bg-background p-4 sm:p-5">
          <label className="eyebrow mb-2 inline-flex items-center gap-1.5 text-foreground">
            <User className="h-3.5 w-3.5 text-primary" />
            {language === "fr" ? "Votre nom de joueur (requis avant d'entrer)" : "Your player name (required before joining)"}
          </label>
          <input
            type="text"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder={language === "fr" ? "Ex : Junior, Alex, Marie…" : "e.g. Junior, Alex, Marie…"}
            minLength={2}
            maxLength={24}
            className="h-11 w-full rounded-md border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Direct Invite Join Card OR Create Room Card */}
        {isDirectInvite ? (
          <div className="space-y-3 rounded-md border border-primary/40 bg-primary/5 p-5 text-center sm:p-6">
            <p className="text-sm text-muted-foreground">
              {language === "fr"
                ? `Confirmez votre nom ci-dessus puis entrez dans le salon ${initialRoomCode} pour jouer ou regarder en direct.`
                : `Confirm your name above, then enter room ${initialRoomCode} to play or spectate live.`}
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => handleJoin(initialRoomCode!, false)}
                disabled={busy}
                className="btn btn-solid flex-1"
              >
                <Users className="h-4 w-4" />
                {language === "fr" ? "Rejoindre la partie" : "Join match"}
              </button>
              <button
                type="button"
                onClick={() => handleJoin(initialRoomCode!, true)}
                disabled={busy}
                className="btn btn-outline flex-1"
              >
                <Eye className="h-4 w-4" />
                {language === "fr" ? "Mode spectateur" : "Watch live"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-md border border-border bg-background p-5 sm:p-6">
              <p className="eyebrow mb-3">
                {language === "fr" ? "01 · Créer un salon" : "01 · Create a room"}
              </p>
              <button
                type="button"
                onClick={handleCreate}
                disabled={busy}
                className="btn btn-solid w-full"
              >
                <Plus className="h-4 w-4" />
                {language === "fr" ? `Créer un salon ${info.fr}` : `Create ${info.en} room`}
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleJoin(joinCode, false)
              }}
              className="rounded-md border border-border bg-background p-5 sm:p-6"
            >
              <p className="eyebrow mb-3">
                {language === "fr" ? "02 · Rejoindre ou regarder un salon" : "02 · Join or spectate a room"}
              </p>
              <div className="flex flex-col gap-2.5">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="EX : A7K9P2"
                  maxLength={8}
                  className="h-11 w-full rounded-md border border-input bg-card px-4 font-mono text-sm uppercase tracking-widest text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={busy || joinCode.trim().length < 4}
                    className="btn btn-outline flex-1"
                  >
                    <Users className="h-4 w-4" />
                    {language === "fr" ? "Rejoindre" : "Join"}
                  </button>
                  <button
                    type="button"
                    disabled={busy || joinCode.trim().length < 4}
                    onClick={() => handleJoin(joinCode, true)}
                    className="btn btn-outline flex-1"
                  >
                    <Eye className="h-4 w-4" />
                    {language === "fr" ? "Spectateur" : "Spectate"}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-center text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }

  // ACTIVE ROOM VIEW
  const isHost = room.host.id === playerId
  const isGuest = room.guest?.id === playerId
  const isSpectator = !isHost && !isGuest
  const myTttSymbol = isHost ? "X" : isGuest ? "O" : null
  const myC4Disc = isHost ? "R" : isGuest ? "Y" : null
  const modeMeta = DUO_MODES.find((m) => m.id === room.gameType)

  // Live timers calculation
  const liveTurnDelta =
    room.status === "playing" && room.turnStartedAt
      ? Math.max(0, nowTick - new Date(room.turnStartedAt).getTime())
      : 0
  const isHostTurnActive =
    room.status === "playing" &&
    ((room.gameType === "tictactoe" && room.turn === "X") ||
      (room.gameType === "connect4" && room.c4Turn === "R"))
  const isGuestTurnActive =
    room.status === "playing" &&
    ((room.gameType === "tictactoe" && room.turn === "O") ||
      (room.gameType === "connect4" && room.c4Turn === "Y"))

  const hostLiveMs = (room.hostElapsedMs || 0) + (isHostTurnActive ? liveTurnDelta : 0)
  const guestLiveMs = (room.guestElapsedMs || 0) + (isGuestTurnActive ? liveTurnDelta : 0)
  const totalMatchMs =
    room.matchStartedAt && room.status === "playing"
      ? Math.max(0, nowTick - new Date(room.matchStartedAt).getTime())
      : hostLiveMs + guestLiveMs

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null

  // Determine overall winner name & state for celebration overlay
  const getWinnerInfo = (): { title: string; subtitle: string; isWin: boolean; isDraw: boolean } | null => {
    if (room.status === "ended") {
      return {
        title: language === "fr" ? `Partie terminée par ${room.endedBy || "un joueur"}` : `Match ended by ${room.endedBy || "a player"}`,
        subtitle:
          room.abandonedBy && room.guest
            ? language === "fr"
              ? `Victoire attribuée à ${room.abandonedBy === "host" ? room.guest.name : room.host.name} par abandon.`
              : `Win awarded to ${room.abandonedBy === "host" ? room.guest.name : room.host.name} by forfeit.`
            : `${room.host.name} ${room.host.wins} — ${room.guest?.wins ?? 0} ${room.guest?.name ?? ""}`,
        isWin: false,
        isDraw: false,
      }
    }
    if (room.status !== "finished") return null

    if (room.endReason === "forfeit" && room.abandonedBy && room.guest) {
      const winnerName = room.abandonedBy === "host" ? room.guest.name : room.host.name
      const loserName = room.abandonedBy === "host" ? room.host.name : room.guest.name
      const iWon = (room.abandonedBy === "host" && isGuest) || (room.abandonedBy === "guest" && isHost)
      return {
        title: language === "fr" ? `${winnerName} gagne par forfait !` : `${winnerName} wins by forfeit!`,
        subtitle: language === "fr" ? `${loserName} a abandonné la manche.` : `${loserName} forfeited the round.`,
        isWin: iWon || isSpectator,
        isDraw: false,
      }
    }

    let side: "host" | "guest" | "draw" | null = null
    if (room.gameType === "tictactoe") {
      side = room.winner === "X" ? "host" : room.winner === "O" ? "guest" : room.winner === "draw" ? "draw" : null
    } else if (room.gameType === "connect4") {
      side = room.c4Winner === "R" ? "host" : room.c4Winner === "Y" ? "guest" : room.c4Winner === "draw" ? "draw" : null
    } else if (room.gameType === "rps") {
      side = room.rpsWinner
    } else if (room.gameType === "quiz") {
      side = room.quizWinner
    } else if (room.gameType === "reaction") {
      side = room.reactionWinner
    }

    if (side === "draw") {
      return {
        title: language === "fr" ? "Égalité parfaite !" : "Perfect draw!",
        subtitle: `${room.host.name} vs ${room.guest?.name ?? ""}`,
        isWin: false,
        isDraw: true,
      }
    }
    if (side === "host" || side === "guest") {
      const winnerName = side === "host" ? room.host.name : room.guest?.name || "Adversaire"
      const iWon = (side === "host" && isHost) || (side === "guest" && isGuest)
      return {
        title: language === "fr" ? `${winnerName} remporte la victoire !` : `${winnerName} wins the match!`,
        subtitle:
          language === "fr"
            ? `Durée : ${fmtClock(totalMatchMs)} · Score : ${room.host.name} ${room.host.wins} — ${room.guest?.wins ?? 0} ${room.guest?.name ?? ""}`
            : `Duration: ${fmtClock(totalMatchMs)} · Score: ${room.host.name} ${room.host.wins} — ${room.guest?.wins ?? 0} ${room.guest?.name ?? ""}`,
        isWin: iWon || isSpectator,
        isDraw: false,
      }
    }
    return null
  }

  const winnerInfo = getWinnerInfo()

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 sm:gap-5">
      {/* Room top bar: Code, Total Timer, Spectators, Share & Actions */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3.5 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{modeMeta ? (language === "fr" ? modeMeta.fr : modeMeta.en) : "Duo"}</span>
          <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold tracking-widest text-primary">
            {room.code}
          </span>
          {room.matchStartedAt && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              <Clock className="h-3 w-3 text-primary" />
              {fmtClock(totalMatchMs)}
            </span>
          )}
          {room.spectators.length > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] text-primary"
              title={room.spectators.map((s) => s.name).join(", ")}
            >
              <Eye className="h-3 w-3" />
              {room.spectators.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button type="button" onClick={copyInviteLink} className="btn btn-outline h-8 px-2.5 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copié !" : "Lien"}</span>
          </button>
          <button type="button" onClick={nativeShare} className="btn btn-outline h-8 px-2.5 text-xs" aria-label="Partager">
            <Share2 className="h-3.5 w-3.5" />
          </button>
          {!isSpectator && room.status === "playing" && (
            <button
              type="button"
              onClick={handleForfeit}
              className="btn btn-outline h-8 px-2.5 text-xs hover:border-amber-500 hover:text-amber-500"
              title={language === "fr" ? "Abandonner la manche" : "Forfeit round"}
            >
              <Flag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{language === "fr" ? "Abandonner" : "Forfeit"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={isSpectator ? handleLeaveLocal : handleEndMatch}
            className="btn btn-outline h-8 px-2.5 text-xs hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
            title={isSpectator ? "Quitter" : "Mettre fin à la partie"}
          >
            {isSpectator ? <LogOut className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Spectator Banner */}
      {isSpectator && (
        <div className="flex w-full items-center justify-between gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-xs text-primary">
          <span className="inline-flex items-center gap-2 font-mono uppercase tracking-wider">
            <Eye className="h-3.5 w-3.5" />
            {language === "fr" ? "Mode Spectateur · Partie en direct" : "Spectator Mode · Live Match"}
          </span>
          <button type="button" onClick={handleLeaveLocal} className="underline hover:opacity-80">
            {language === "fr" ? "Quitter" : "Leave"}
          </button>
        </div>
      )}

      {/* Players Scoreboard with Per-Player Live Clocks */}
      <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-3">
        <div
          className={cn(
            "rounded-md border p-3 transition-all sm:p-3.5",
            isHostTurnActive ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-background",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow inline-flex items-center gap-1.5 text-primary">
              {room.gameType === "connect4" && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              {isHost ? (language === "fr" ? "Vous" : "You") : language === "fr" ? "Joueur 1" : "Player 1"}
            </span>
            <span className="font-mono text-lg font-semibold tabular-nums">{room.host.wins}</span>
          </div>
          <p className="mt-1 truncate font-medium">{room.host.name}</p>
          <p className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            <Clock className={cn("h-3 w-3", isHostTurnActive && "text-primary")} />
            {fmtClock(hostLiveMs)}
          </p>
        </div>

        <div
          className={cn(
            "rounded-md border p-3 transition-all sm:p-3.5",
            isGuestTurnActive ? "border-amber-500 bg-amber-500/10 shadow-sm" : "border-border bg-background",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow inline-flex items-center gap-1.5">
              {room.gameType === "connect4" && <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
              {isGuest ? (language === "fr" ? "Vous" : "You") : language === "fr" ? "Joueur 2" : "Player 2"}
            </span>
            <span className="font-mono text-lg font-semibold tabular-nums">{room.guest?.wins ?? 0}</span>
          </div>
          <p className="mt-1 truncate font-medium">
            {room.guest ? (
              room.guest.name
            ) : (
              <span className="text-muted-foreground">{language === "fr" ? "En attente…" : "Waiting…"}</span>
            )}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            <Clock className={cn("h-3 w-3", isGuestTurnActive && "text-amber-500")} />
            {fmtClock(guestLiveMs)}
          </p>
        </div>
      </div>

      {/* Waiting for Guest */}
      {room.status === "waiting" && (
        <div className="flex w-full flex-col items-center gap-4 rounded-md border border-dashed border-primary/40 bg-primary/5 p-6 text-center sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-serif text-2xl">
              {language === "fr" ? "En attente de votre adversaire…" : "Waiting for your opponent…"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === "fr"
                ? "Partagez ce lien : votre ami entrera son nom avant de rejoindre la partie (d'autres peuvent aussi regarder en spectateur)."
                : "Share this link: your friend will enter their name before joining (others can watch as spectators)."}
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

      {/* VICTORY / FORFEIT / ENDED CELEBRATION BANNER WITH ANIMATION */}
      <AnimatePresence>
        {winnerInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className={cn(
              "relative flex w-full flex-col items-center gap-3 overflow-hidden rounded-md border p-6 text-center",
              room.status === "ended"
                ? "border-border bg-card"
                : winnerInfo.isWin
                  ? "border-primary/50 bg-primary/10"
                  : "border-amber-500/40 bg-amber-500/10",
            )}
          >
            {/* Animated confetti / sparkle burst */}
            {winnerInfo.isWin && (
              <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {BURST_PARTICLES.map((p, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ x: p.x, y: p.y, scale: [0, 1.3, 0.8], opacity: [1, 1, 0] }}
                    transition={{ duration: 1.1, delay: idx * 0.04, ease: "easeOut" }}
                    className="absolute h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            )}

            <motion.div
              initial={{ rotate: -15, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 16 }}
              className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary"
            >
              {room.status === "ended" ? (
                <Power className="h-6 w-6" />
              ) : room.endReason === "forfeit" ? (
                <Flag className="h-6 w-6" />
              ) : winnerInfo.isWin ? (
                <Trophy className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </motion.div>

            <h4 className="font-serif text-3xl leading-tight">{winnerInfo.title}</h4>
            <p className="font-mono text-xs text-muted-foreground">{winnerInfo.subtitle}</p>

            <div className="mt-1 flex flex-wrap justify-center gap-2">
              {!isSpectator && room.status === "finished" && (
                <button type="button" onClick={handleRematch} className="btn btn-solid h-10 px-5">
                  <RotateCcw className="h-4 w-4" />
                  {language === "fr" ? "Revanche" : "Rematch"}
                </button>
              )}
              <button type="button" onClick={handleLeaveLocal} className="btn btn-outline h-10 px-5">
                <LogOut className="h-4 w-4" />
                {language === "fr" ? "Retour au lobby" : "Back to lobby"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. CONNECT 4 (PUISSANCE 4) */}
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "connect4" && (
        <>
          {room.status === "playing" && (
            <p className="font-serif text-2xl">
              {language === "fr"
                ? `C'est au tour de ${room.c4Turn === "R" ? room.host.name : room.guest?.name}`
                : `${room.c4Turn === "R" ? room.host.name : room.guest?.name}'s turn`}
            </p>
          )}

          <div
            className="w-full max-w-[490px] rounded-lg border border-border bg-muted/50 p-2 sm:p-3.5"
            onMouseLeave={() => setHoverCol(null)}
          >
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {room.c4Board.map((cell, idx) => {
                const col = idx % 7
                const isWin = room.c4WinLine?.includes(idx) ?? false
                const canDrop = !isSpectator && room.status === "playing" && room.c4Turn === myC4Disc && room.c4Board[col] === null
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
        </>
      )}

      {/* 2. TIC-TAC-TOE 1v1 */}
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "tictactoe" && (
        <>
          {room.status === "playing" && (
            <p className="font-serif text-2xl">
              {language === "fr"
                ? `C'est au tour de ${room.turn === "X" ? room.host.name : room.guest?.name}`
                : `${room.turn === "X" ? room.host.name : room.guest?.name}'s turn`}
            </p>
          )}

          <div className="grid aspect-square w-full max-w-[400px] grid-cols-3 grid-rows-3 gap-3">
            {room.board.map((cell, idx) => {
              const isWin = room.winLine?.includes(idx) ?? false
              const canPlay = !isSpectator && room.status === "playing" && room.turn === myTttSymbol && cell === null
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
        </>
      )}

      {/* 3. ROCK PAPER SCISSORS (CHIFOUMI) */}
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "rps" && (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex items-center gap-3 font-mono text-xs sm:text-sm">
            <span className="rounded-full border border-border bg-background px-3 py-1">
              {room.host.name} : <strong className="text-primary">{room.rpsHostScore}</strong>/{room.rpsTarget}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span className="rounded-full border border-border bg-background px-3 py-1">
              {room.guest?.name} : <strong className="text-primary">{room.rpsGuestScore}</strong>/{room.rpsTarget}
            </span>
          </div>

          {room.rpsLastRound && (
            <div className="w-full rounded-md border border-border bg-background px-4 py-3 text-center">
              <p className="eyebrow">{language === "fr" ? "Manche précédente" : "Previous round"}</p>
              <p className="mt-1.5 text-base sm:text-lg">
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

          {room.status === "playing" && (
            (() => {
              const myPick = isHost ? room.rpsHostChoice : isGuest ? room.rpsGuestChoice : null
              const oppName = isHost ? room.guest?.name : room.host.name
              return (
                <div className="w-full space-y-4 text-center">
                  <p className="font-serif text-2xl">
                    {isSpectator
                      ? language === "fr"
                        ? `Manche ${room.rpsRound} en cours…`
                        : `Round ${room.rpsRound} in progress…`
                      : myPick
                        ? language === "fr"
                          ? `Choix validé ! En attente de ${oppName}…`
                          : `Locked in! Waiting for ${oppName}…`
                        : language === "fr"
                          ? `Manche ${room.rpsRound} — À ${isHost ? room.host.name : room.guest?.name} de choisir`
                          : `Round ${room.rpsRound} — Make your pick`}
                  </p>

                  {!isSpectator && (
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
                  )}
                </div>
              )
            })()
          )}
        </div>
      )}

      {/* 4. QUIZ DEV 1v1 */}
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "quiz" && (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="grid w-full grid-cols-2 gap-3 text-center">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="eyebrow">{room.host.name}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {room.quizHostScore} / {room.quizQuestions.length}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {room.quizHostAnswers.length}/{room.quizQuestions.length} répondues
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="eyebrow">{room.guest?.name}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {room.quizGuestScore} / {room.quizQuestions.length}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {room.quizGuestAnswers.length}/{room.quizQuestions.length} répondues
              </p>
            </div>
          </div>

          {room.status === "playing" && !isSpectator && (
            (() => {
              const myAnswers = isHost ? room.quizHostAnswers : room.quizGuestAnswers
              const qIdx = myAnswers.length
              if (qIdx >= room.quizQuestions.length) {
                return (
                  <div className="w-full rounded-md border border-border bg-background p-8 text-center">
                    <p className="font-serif text-3xl">Quiz terminé !</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      En attente de {isHost ? room.guest?.name : room.host.name}…
                    </p>
                  </div>
                )
              }
              const currentQ = room.quizQuestions[qIdx]
              return (
                <div className="w-full rounded-md border border-border bg-background p-5 sm:p-6">
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
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "reaction" && (
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

          {room.status === "playing" && !isSpectator && (
            (() => {
              const myTimes = isHost ? room.hostTimes : room.guestTimes
              if (myTimes.length >= room.reactionTargetRounds) {
                return (
                  <div className="flex min-h-[240px] w-full flex-col items-center justify-center gap-2 rounded-md border border-border bg-background p-8 text-center">
                    <p className="font-serif text-3xl">Vos 3 essais sont enregistrés !</p>
                    <p className="text-sm text-muted-foreground">
                      En attente de {isHost ? room.guest?.name : room.host.name}…
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
                    "flex min-h-[260px] w-full flex-col items-center justify-center gap-3 rounded-md border p-8 text-center transition-colors select-none",
                    rxPhase === "idle" && "border-border bg-background hover:border-primary",
                    rxPhase === "waiting" && "border-amber-500/50 bg-amber-500/15",
                    rxPhase === "ready" && "border-primary bg-primary text-primary-foreground",
                    rxPhase === "tooSoon" && "border-destructive/50 bg-destructive/15",
                  )}
                >
                  <Zap className={cn("h-7 w-7", rxPhase === "ready" ? "text-primary-foreground" : "text-primary")} />
                  <p className="eyebrow">
                    Essai {myTimes.length + 1} / {room.reactionTargetRounds}
                  </p>
                  <p className="font-serif text-3xl sm:text-4xl">
                    {rxPhase === "idle" && "Cliquez pour lancer"}
                    {rxPhase === "waiting" && "Attendez le bleu…"}
                    {rxPhase === "ready" && "CLIQUEZ !"}
                    {rxPhase === "tooSoon" && "Trop tôt ! Réessayez"}
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
