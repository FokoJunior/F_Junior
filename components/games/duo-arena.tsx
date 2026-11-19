"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Chess } from "chess.js"
import {
  Check,
  CircleDot,
  Clock,
  Copy,
  Crown,
  Dices,
  Eye,
  Flag,
  Grid2x2,
  Hand,
  Hash,
  HelpCircle,
  LogOut,
  Maximize2,
  Minimize2,
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
import { useConfirm } from "@/components/confirm-provider"
import ChessBoard from "@/components/games/chess-board"
import { ChessCapturedBar, DraughtsCapturedBar } from "@/components/games/captured-pieces"
import DraughtsBoard from "@/components/games/draughts-board"
import GameEndBanner, { type GameEndOutcome } from "@/components/games/game-end-overlay"
import LudoBoard from "@/components/games/ludo-board"
import { useLanguage } from "@/components/language-provider"
import { getPlayerId, looksLikeRoomCode, readScore, saveBestScore, setPlayerName } from "@/lib/games"
import { playCapture, playClick, playDice, playMove, playScore } from "@/lib/game-sound"
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
  { id: "quiz", Icon: HelpCircle, fr: "Quiz Culture & Dev 1v1", en: "Culture & Dev Quiz 1v1", subFr: "1 100+ questions", subEn: "1,100+ questions" },
  { id: "reaction", Icon: Zap, fr: "Duel Réflexe", en: "Reflex Duel", subFr: "3 manches · ms", subEn: "3 rounds · ms" },
  { id: "chess", Icon: Crown, fr: "Échecs 1v1", en: "Chess 1v1", subFr: "8×8 officiel", subEn: "Official 8×8" },
  { id: "ludo", Icon: Dices, fr: "Ludo 1v1", en: "Ludo 1v1", subFr: "Plateau 15×15", subEn: "15×15 board" },
  { id: "draughts", Icon: Grid2x2, fr: "Dames 1v1", en: "Draughts 1v1", subFr: "Internationales 10×10", subEn: "International 10×10" },
]

const RPS_LABELS: Record<RpsChoice, { emoji: string; fr: string; en: string }> = {
  rock: { emoji: "🪨", fr: "Pierre", en: "Rock" },
  paper: { emoji: "📄", fr: "Feuille", en: "Paper" },
  scissors: { emoji: "✂️", fr: "Ciseaux", en: "Scissors" },
}

function fmtClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export default function DuoArena({ gameType, scoreKey, playerName, initialRoomCode, onRoomChange }: DuoArenaProps) {
  const { language } = useLanguage()
  const confirm = useConfirm()
  const [playerId, setPlayerId] = useState("")
  const [joinCode, setJoinCode] = useState(initialRoomCode ?? "")
  const [joinName, setJoinName] = useState(() => (playerName && !looksLikeRoomCode(playerName) ? playerName : ""))
  const [turnLimitSec, setTurnLimitSec] = useState<number>(() => (gameType === "chess" ? 30 : gameType === "ludo" ? 15 : 10))
  const [ludoRolling, setLudoRolling] = useState(false)
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
  const leftRoomRef = useRef(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [])

  useEffect(() => {
    setPlayerId(getPlayerId())
    return () => {
      if (rxTimerRef.current !== null) window.clearTimeout(rxTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (playerName && !looksLikeRoomCode(playerName) && !joinName) {
      setJoinName(playerName)
    }
  }, [joinName, playerName])

  // Auto-reconnect seamlessly if the player (or spectator) accidentally refreshed during an active room
  useEffect(() => {
    if (!playerId || !initialRoomCode || room || leftRoomRef.current) return
    const cleanCode = initialRoomCode.trim().toUpperCase()
    if (!cleanCode) return
    let cancelled = false
    fetch(`/api/games/rooms?code=${encodeURIComponent(cleanCode)}&playerId=${encodeURIComponent(playerId)}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.room) return
        const fetched = data.room as DuoRoom
        if (fetched.status === "ended") return
        const alreadyInRoom =
          fetched.host.id === playerId ||
          fetched.guest?.id === playerId ||
          fetched.spectators.some((s) => s.id === playerId)
        if (alreadyInRoom) {
          setRoom(fetched)
          onRoomChange?.(fetched.code)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [initialRoomCode, onRoomChange, playerId, room])

  // Warn before accidental refresh / tab close during an active online match
  useEffect(() => {
    if (!room || room.status !== "playing") return
    const isActivePlayer = room.host.id === playerId || room.guest?.id === playerId
    if (!isActivePlayer) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [playerId, room])

  // Smooth 150ms local clock tick for live timers & turn countdown bar
  useEffect(() => {
    if (!room || room.status !== "playing") return
    const id = window.setInterval(() => setNowTick(Date.now()), 150)
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
        if (cleanName.toUpperCase() === cleanCode || looksLikeRoomCode(cleanName)) {
          setError(
            language === "fr"
              ? "Ceci ressemble à un code de salon — entrez plutôt votre vrai prénom ou pseudo."
              : "This looks like a room code — please enter your real name or nickname.",
          )
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
    }, room?.gameType === "ludo" || room?.gameType === "chess" || room?.gameType === "draughts" || room?.gameType === "connect4" ? 450 : 1000)
    return () => window.clearInterval(id)
  }, [playerId, room?.code, room?.gameType])

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
    const act = payload.action
    if (act === "ludo_roll") playDice()
    else if (act === "c4_drop") playCapture()
    else if (act === "move" || act === "chess_move" || act === "ludo_move" || act === "draughts_move") playMove()
    else if (act === "rps_pick" || act === "quiz_answer" || act === "reaction_submit") playScore()
    else if (act === "rematch") playClick()
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
          turnLimitSec,
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
    const ok = await confirm({
      title: language === "fr" ? "Abandonner cette manche ?" : "Forfeit this round?",
      description:
        language === "fr"
          ? "Votre adversaire sera immédiatement déclaré vainqueur par forfait (+1 victoire)."
          : "Your opponent will immediately win by forfeit (+1 win).",
      confirmLabel: language === "fr" ? "Abandonner" : "Forfeit",
      cancelLabel: language === "fr" ? "Continuer" : "Keep playing",
      variant: "warning",
    })
    if (!ok) return
    await sendRoomAction({ action: "forfeit" })
  }

  const handleEndMatch = async () => {
    if (!room) return
    const isPlayer = room.host.id === playerId || room.guest?.id === playerId
    if (!isPlayer) {
      await sendRoomAction({ action: "end_match" })
      handleLeaveLocal()
      return
    }
    // Match already over (finished / ended): leave immediately without any confirmation
    if (room.status !== "playing") {
      if (room.status !== "ended") await sendRoomAction({ action: "end_match" })
      handleLeaveLocal()
      return
    }
    const ok = await confirm({
      title: language === "fr" ? "Quitter la partie ?" : "Leave the match?",
      description:
        language === "fr"
          ? "La manche en cours sera attribuée à votre adversaire et le salon sera clôturé."
          : "The current round will be awarded to your opponent and the room will close.",
      confirmLabel: language === "fr" ? "Quitter" : "Leave",
      cancelLabel: language === "fr" ? "Annuler" : "Cancel",
      variant: "danger",
    })
    if (!ok) return
    await sendRoomAction({ action: "end_match" })
    handleLeaveLocal()
  }

  const handleLeaveLocal = () => {
    leftRoomRef.current = true
    if (rxTimerRef.current !== null) window.clearTimeout(rxTimerRef.current)
    setRxPhase("idle")
    lastWinCountRef.current = 0
    setError(null)
    updateRoom(null)
  }

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return
    const el = rootRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      el.requestFullscreen?.().catch(() => {})
    }
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

              {(gameType === "tictactoe" || gameType === "connect4" || gameType === "rps" || gameType === "chess" || gameType === "ludo") && (
                <div className="mb-4">
                  <p className="eyebrow mb-2 inline-flex items-center gap-1.5 text-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {language === "fr" ? "Temps de réflexion par tour" : "Thinking time per turn"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(gameType === "chess"
                      ? [
                          { val: 15, label: "15s (Bullet)" },
                          { val: 30, label: "30s" },
                          { val: 60, label: "60s" },
                          { val: 0, label: language === "fr" ? "Illimité" : "Unlimited" },
                        ]
                      : [
                          { val: 4, label: "4s (Blitz)" },
                          { val: 10, label: "10s" },
                          { val: 15, label: "15s" },
                          { val: 30, label: "30s" },
                          { val: 0, label: language === "fr" ? "Illimité" : "Unlimited" },
                        ]
                    ).map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setTurnLimitSec(opt.val)}
                        data-active={turnLimitSec === opt.val}
                        className="chip h-8"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
  const chessInstance = room.gameType === "chess" ? new Chess(room.chessFen) : null
  const chessTurnColor = chessInstance?.turn() ?? "w"
  const chessHostColor: "w" | "b" = room.chessWhiteSide === "host" ? "w" : "b"
  const chessGuestColor: "w" | "b" = room.chessWhiteSide === "guest" ? "w" : "b"
  const draughtsHostColor: "w" | "b" = room.draughtsWhiteSide === "host" ? "w" : "b"
  const draughtsGuestColor: "w" | "b" = room.draughtsWhiteSide === "guest" ? "w" : "b"

  const isHostTurnActive =
    room.status === "playing" &&
    ((room.gameType === "tictactoe" && room.turn === "X") ||
      (room.gameType === "connect4" && room.c4Turn === "R") ||
      (room.gameType === "rps" && room.rpsHostChoice === null) ||
      (room.gameType === "chess" && chessTurnColor === chessHostColor) ||
      (room.gameType === "draughts" && room.draughtsState.turn === draughtsHostColor) ||
      (room.gameType === "ludo" && room.ludoState.turn === "host"))
  const isGuestTurnActive =
    room.status === "playing" &&
    ((room.gameType === "tictactoe" && room.turn === "O") ||
      (room.gameType === "connect4" && room.c4Turn === "Y") ||
      (room.gameType === "rps" && room.rpsGuestChoice === null) ||
      (room.gameType === "chess" && chessTurnColor === chessGuestColor) ||
      (room.gameType === "draughts" && room.draughtsState.turn === draughtsGuestColor) ||
      (room.gameType === "ludo" && room.ludoState.turn === "guest"))

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
    } else if (room.gameType === "chess") {
      side = room.chessWinner
    } else if (room.gameType === "ludo") {
      side = room.ludoState.winner
    } else if (room.gameType === "draughts") {
      side = room.draughtsWinner
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
    <div
      ref={rootRef}
      className={cn(
        "mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 sm:gap-5",
        isFullscreen && "max-w-none overflow-y-auto bg-background p-4 sm:p-8",
      )}
    >
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
          <button
            type="button"
            onClick={toggleFullscreen}
            className="btn btn-outline h-8 px-2.5 text-xs"
            title={language === "fr" ? "Plein écran" : "Fullscreen"}
            aria-label={language === "fr" ? "Plein écran" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
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
            title={
              isSpectator || room.status !== "playing"
                ? language === "fr"
                  ? "Quitter le salon"
                  : "Leave room"
                : language === "fr"
                  ? "Quitter la partie"
                  : "Leave match"
            }
          >
            {isSpectator || room.status !== "playing" ? <LogOut className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
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

      {/* TURN THINKING COUNTDOWN BAR (e.g. 4s / 10s / 15s / 30s) */}
      {room.status === "playing" &&
        room.turnLimitSec > 0 &&
        room.turnStartedAt &&
        (room.gameType === "tictactoe" || room.gameType === "connect4" || room.gameType === "rps" || room.gameType === "chess" || room.gameType === "ludo" || room.gameType === "draughts") && (() => {
          const limitMs = room.turnLimitSec * 1000
          const remainingMs = Math.max(0, limitMs - liveTurnDelta)
          const pct = Math.max(0, Math.min(100, (remainingMs / limitMs) * 100))
          const secsLeft = (remainingMs / 1000).toFixed(1)
          const isUrgent = remainingMs <= 2000
          const isWarn = !isUrgent && pct <= 45
          return (
            <div className="w-full space-y-1.5 rounded-md border border-border bg-background px-4 py-2.5">
              <div className="flex items-center justify-between gap-2 font-mono text-xs">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock className={cn("h-3.5 w-3.5", isUrgent ? "animate-pulse text-destructive" : "text-primary")} />
                  {language === "fr" ? "Temps de réflexion" : "Turn timer"}
                </span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    isUrgent ? "text-destructive" : isWarn ? "text-amber-500" : "text-primary",
                  )}
                >
                  {secsLeft}s / {room.turnLimitSec}s
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-100",
                    isUrgent ? "bg-destructive" : isWarn ? "bg-amber-500" : "bg-primary",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })()}

      {/* Timeout notice banner */}
      {room.lastTimeoutNotice && room.status === "playing" && (
        <div className="w-full rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center font-mono text-xs text-amber-600 dark:text-amber-400">
          ⏱ {room.lastTimeoutNotice}
        </div>
      )}

      {/* VICTORY / FORFEIT / ENDED CELEBRATION BANNER WITH ANIMATION */}
      <GameEndBanner
        show={Boolean(winnerInfo)}
        outcome={
          (room.status === "ended"
            ? "ended"
            : room.endReason === "forfeit"
              ? winnerInfo?.isWin
                ? "win"
                : "forfeit"
              : winnerInfo?.isDraw
                ? "draw"
                : winnerInfo?.isWin
                  ? "win"
                  : "lose") as GameEndOutcome
        }
        title={winnerInfo?.title ?? ""}
        subtitle={winnerInfo?.subtitle}
        primaryActionLabel={!isSpectator && room.status === "finished" ? (language === "fr" ? "Revanche" : "Rematch") : undefined}
        onPrimaryAction={!isSpectator && room.status === "finished" ? handleRematch : undefined}
        secondaryActionLabel={language === "fr" ? "Retour au lobby" : "Back to lobby"}
        onSecondaryAction={handleLeaveLocal}
      />

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
            {/* One tall clickable button per column (reliable on desktop & touch) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: 7 }, (_, col) => {
                const colFull = room.c4Board[col] !== null
                const myTurn = !isSpectator && room.status === "playing" && room.c4Turn === myC4Disc
                const canDrop = myTurn && !colFull
                const ghostColor = room.c4Turn === "R" ? "bg-primary/45 border-primary/60" : "bg-amber-500/45 border-amber-500/60"
                return (
                  <button
                    key={col}
                    type="button"
                    disabled={!canDrop}
                    onMouseEnter={() => setHoverCol(col)}
                    onClick={() => {
                      setHoverCol(null)
                      sendRoomAction({ action: "c4_drop", col })
                    }}
                    aria-label={`Colonne ${col + 1}`}
                    className={cn(
                      "flex flex-col gap-1 rounded-md p-0.5 transition-colors sm:gap-2",
                      canDrop && "cursor-pointer hover:bg-primary/10 active:bg-primary/20",
                      canDrop && hoverCol === col && "bg-primary/10",
                    )}
                  >
                    {/* Ghost preview disc */}
                    <span
                      className={cn(
                        "aspect-square w-full rounded-full border-2 border-dashed transition-opacity",
                        canDrop && hoverCol === col ? ghostColor : "border-transparent bg-transparent opacity-0",
                      )}
                    />
                    {Array.from({ length: 6 }, (_, row) => {
                      const idx = row * 7 + col
                      const cell = room.c4Board[idx]
                      const isWin = room.c4WinLine?.includes(idx) ?? false
                      return (
                        <span
                          key={idx}
                          className={cn(
                            "relative block aspect-square w-full overflow-hidden rounded-full border-2 bg-background/90",
                            cell === null && "border-border",
                            cell === "R" && "border-primary",
                            cell === "Y" && "border-amber-500",
                            isWin && "z-10 ring-4 ring-foreground/60",
                          )}
                        >
                          {cell && (
                            <motion.span
                              key={`${idx}-${cell}`}
                              initial={{ y: `-${(row + 1) * 115}%`, opacity: 0.6 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.7 }}
                              className={cn(
                                "absolute inset-0 rounded-full shadow-[inset_0_2px_3px_rgba(255,255,255,0.55),inset_0_-3px_5px_rgba(0,0,0,0.3)]",
                                cell === "R"
                                  ? "bg-gradient-to-br from-sky-400 via-primary to-indigo-700"
                                  : "bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600",
                              )}
                            />
                          )}
                        </span>
                      )
                    })}
                  </button>
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
          <div className="flex flex-wrap items-center justify-center gap-2.5 font-mono text-xs sm:text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1">
              <span>
                {room.host.name} : <strong className="text-primary">{room.rpsHostScore}</strong>/{room.rpsTarget}
              </span>
              {room.status === "playing" && (
                <span className={room.rpsHostChoice ? "text-emerald-500" : "text-muted-foreground"}>
                  {room.rpsHostChoice ? "✓ Prêt" : "⏳"}
                </span>
              )}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1">
              <span>
                {room.guest?.name} : <strong className="text-primary">{room.rpsGuestScore}</strong>/{room.rpsTarget}
              </span>
              {room.status === "playing" && (
                <span className={room.rpsGuestChoice ? "text-emerald-500" : "text-muted-foreground"}>
                  {room.rpsGuestChoice ? "✓ Prêt" : "⏳"}
                </span>
              )}
            </span>
          </div>

          {room.rpsLastRound && (
            <motion.div
              key={`rps-res-${room.rpsRound}`}
              initial={{ opacity: 0, scale: 0.94, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="w-full rounded-md border border-primary/30 bg-background px-4 py-3.5 text-center"
            >
              <p className="eyebrow text-primary">
                {language === "fr" ? `Résultat manche ${room.rpsRound - 1}` : `Round ${room.rpsRound - 1} result`}
              </p>
              <p className="mt-1.5 text-base sm:text-lg">
                <strong>{room.host.name}</strong> {RPS_LABELS[room.rpsLastRound.host].emoji}{" "}
                <span className="mx-1 text-muted-foreground">vs</span>{" "}
                {RPS_LABELS[room.rpsLastRound.guest].emoji} <strong>{room.guest?.name}</strong>
              </p>
              <p className="mt-1 font-mono text-xs text-primary">
                {room.rpsLastRound.winner === "draw"
                  ? language === "fr"
                    ? "Égalité — personne ne marque"
                    : "Draw — no point"
                  : language === "fr"
                    ? `${room.rpsLastRound.winner === "host" ? room.host.name : room.guest?.name} remporte la manche (+1) !`
                    : `${room.rpsLastRound.winner === "host" ? room.host.name : room.guest?.name} wins the round (+1)!`}
              </p>
            </motion.div>
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="eyebrow text-primary">
                      Question {qIdx + 1} / {room.quizQuestions.length}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {currentQ.category && (
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                          {currentQ.category}
                        </span>
                      )}
                      {currentQ.difficulty && (
                        <span className="font-mono text-[10px] text-amber-500">
                          {"★".repeat(currentQ.difficulty)}
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="mt-2.5 font-serif text-xl leading-snug sm:text-2xl">
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

      {/* 7. LUDO 1v1 */}
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "ludo" && (
        <LudoBoard
          state={room.ludoState}
          canInteractSide={room.status === "playing" ? (isHost ? "host" : isGuest ? "guest" : null) : null}
          rolling={ludoRolling}
          onRoll={async () => {
            if (ludoRolling) return
            setLudoRolling(true)
            await sendRoomAction({ action: "ludo_roll" })
            window.setTimeout(() => setLudoRolling(false), 380)
          }}
          onMoveToken={(tokenIdx) => sendRoomAction({ action: "ludo_move", tokenIdx })}
          hostLabel={room.host.name}
          guestLabel={room.guest?.name || "Adversaire"}
        />
      )}

      {/* 6. CHESS 1v1 */}
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "chess" && chessInstance && (
        <>
          {room.status === "playing" && (
            <p className="font-serif text-xl sm:text-2xl">
              {language === "fr"
                ? `C'est au tour de ${isHostTurnActive ? room.host.name : room.guest?.name} (${chessTurnColor === "w" ? "Blancs" : "Noirs"})${chessInstance.inCheck() ? " · Échec !" : ""}`
                : `${isHostTurnActive ? room.host.name : room.guest?.name}'s turn (${chessTurnColor === "w" ? "White" : "Black"})${chessInstance.inCheck() ? " · Check!" : ""}`}
            </p>
          )}

          <ChessBoard
            fen={room.chessFen}
            orientation={isGuest ? chessGuestColor : chessHostColor}
            interactive={!isSpectator && room.status === "playing"}
            allowedColor={isHost ? chessHostColor : isGuest ? chessGuestColor : "w"}
            lastMove={room.chessLastMove}
            onMove={(from, to) => sendRoomAction({ action: "chess_move", from, to })}
          />
          <ChessCapturedBar
            fen={room.chessFen}
            whiteLabel={room.chessWhiteSide === "host" ? room.host.name : room.guest?.name || "Blancs"}
            blackLabel={room.chessWhiteSide === "host" ? room.guest?.name || "Noirs" : room.host.name}
            className="max-w-[520px]"
          />
        </>
      )}

      {/* 8. INTERNATIONAL DRAUGHTS 1v1 */}
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "draughts" && (
        <>
          {room.status === "playing" && (
            <p className="font-serif text-xl sm:text-2xl">
              {language === "fr"
                ? `C'est au tour de ${isHostTurnActive ? room.host.name : room.guest?.name} (${room.draughtsState.turn === "w" ? "Blancs" : "Noirs"})`
                : `${isHostTurnActive ? room.host.name : room.guest?.name}'s turn (${room.draughtsState.turn === "w" ? "White" : "Black"})`}
            </p>
          )}
          <DraughtsBoard
            state={room.draughtsState}
            orientation={isGuest ? draughtsGuestColor : draughtsHostColor}
            canInteractSide={
              !isSpectator && room.status === "playing" ? (isHost ? draughtsHostColor : draughtsGuestColor) : null
            }
            onMove={(m) => sendRoomAction({ action: "draughts_move", from: m.from, to: m.to })}
            whiteLabel={room.draughtsWhiteSide === "host" ? room.host.name : room.guest?.name || "Blancs"}
            blackLabel={room.draughtsWhiteSide === "host" ? room.guest?.name || "Noirs" : room.host.name}
          />
          <DraughtsCapturedBar
            board={room.draughtsState.board}
            whiteLabel={room.draughtsWhiteSide === "host" ? room.host.name : room.guest?.name || "Blancs"}
            blackLabel={room.draughtsWhiteSide === "host" ? room.guest?.name || "Noirs" : room.host.name}
            className="max-w-[520px]"
          />
        </>
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
