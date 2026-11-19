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
import { ChessPlayerCaptures, DraughtsPlayerCaptures } from "@/components/games/captured-pieces"
import DraughtsBoard from "@/components/games/draughts-board"
import GameEndBanner, { type GameEndOutcome } from "@/components/games/game-end-overlay"
import LudoBoard from "@/components/games/ludo-board"
import { useLanguage } from "@/components/language-provider"
import { getPlayerId, looksLikeRoomCode, readScore, saveBestScore, setPlayerName } from "@/lib/games"
import {
  playCapture,
  playClick,
  playDice,
  playDraughtsCapture,
  playDraughtsKing,
  playDraughtsMove,
  playMove,
  playScore,
} from "@/lib/game-sound"
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
  const lastDraughtsMoveRef = useRef<string | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFs = () => {
      const hasNative = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement)
      if (!hasNative) setIsFullscreen(false)
    }
    document.addEventListener("fullscreenchange", onFs)
    document.addEventListener("webkitfullscreenchange", onFs)
    return () => {
      document.removeEventListener("fullscreenchange", onFs)
      document.removeEventListener("webkitfullscreenchange", onFs)
    }
  }, [])

  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false)
        try {
          if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {})
            else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen()
          }
        } catch {}
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isFullscreen])

  useEffect(() => {
    if (!isFullscreen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isFullscreen])

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
        if (data.room) {
          const nextRoom = data.room as DuoRoom
          if (nextRoom.gameType === "draughts" && nextRoom.draughtsState?.lastMove) {
            const moveKey = `${nextRoom.draughtsState.lastMove.from.join(",")}-${nextRoom.draughtsState.lastMove.to.join(",")}`
            if (lastDraughtsMoveRef.current !== moveKey) {
              lastDraughtsMoveRef.current = moveKey
              const [toR, toC] = nextRoom.draughtsState.lastMove.to
              const destPiece = nextRoom.draughtsState.board?.[toR]?.[toC]
              const isKingNow = destPiece === "W" || destPiece === "B"
              const capCount = nextRoom.draughtsState.lastMove.captures || 0
              if (isKingNow && (toR === 0 || toR === 9)) {
                playDraughtsKing()
              } else if (capCount > 0) {
                playDraughtsCapture(capCount)
              } else {
                playDraughtsMove()
              }
            }
          }
          setRoom(nextRoom)
        }
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
    else if (act === "move" || act === "chess_move" || act === "ludo_move") playMove()
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

  const toggleFullscreen = async () => {
    if (typeof document === "undefined") return
    const el = rootRef.current

    if (isFullscreen) {
      setIsFullscreen(false)
      try {
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen()
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen()
          }
        }
      } catch {}
    } else {
      setIsFullscreen(true)
      if (el) {
        try {
          if (el.requestFullscreen) {
            await el.requestFullscreen()
          } else if ((el as any).webkitRequestFullscreen) {
            await (el as any).webkitRequestFullscreen()
          }
        } catch {}
      }
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

  // 1v1 Perspective:
  // - Top card: Opponent (if guest, host is opponent; if host, guest is opponent; if spectator, guest)
  // - Bottom card: You (if guest, guest is you; if host, host is you; if spectator, host)
  const topPlayer = isGuest ? room.host : room.guest
  const bottomPlayer = isGuest ? room.guest : room.host

  const isTopMe = false
  const isBottomMe = !isSpectator

  const isTopHost = isGuest
  const isBottomHost = !isGuest

  const isTopTurnActive = isTopHost ? isHostTurnActive : isGuestTurnActive
  const isBottomTurnActive = isBottomHost ? isHostTurnActive : isGuestTurnActive

  const topLiveMs = isTopHost ? hostLiveMs : guestLiveMs
  const bottomLiveMs = isBottomHost ? hostLiveMs : guestLiveMs

  const topMissedTurns = isTopHost ? room.hostMissedTurns : room.guestMissedTurns
  const bottomMissedTurns = isBottomHost ? room.hostMissedTurns : room.guestMissedTurns

  // Turn thinking countdown calculation
  const limitMs = room.turnLimitSec * 1000
  const remainingMs = Math.max(0, limitMs - liveTurnDelta)
  const countdownPct = Math.max(0, Math.min(100, (remainingMs / (limitMs || 1)) * 100))
  const countdownSecsLeft = (remainingMs / 1000).toFixed(1)
  const isCountdownUrgent = remainingMs <= 2000
  const isCountdownWarn = !isCountdownUrgent && countdownPct <= 45

  const getPlayerBadge = (isHostSide: boolean) => {
    if (room.gameType === "connect4") {
      const disc = isHostSide ? "R" : "Y"
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
            disc === "R"
              ? "border border-primary/30 bg-primary/15 text-primary"
              : "border border-amber-400/30 bg-amber-400/15 text-amber-500",
          )}
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full shadow-sm",
              disc === "R" ? "bg-primary" : "bg-amber-400",
            )}
          />
          {disc === "R" ? (language === "fr" ? "Rouge" : "Red") : language === "fr" ? "Jaune" : "Yellow"}
        </span>
      )
    }
    if (room.gameType === "tictactoe") {
      const sym = isHostSide ? "X" : "O"
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-bold border",
            sym === "X"
              ? "border-primary/40 bg-primary/15 text-primary"
              : "border-border bg-card text-foreground",
          )}
        >
          {sym}
        </span>
      )
    }
    if (room.gameType === "chess") {
      const side = isHostSide ? chessHostColor : chessGuestColor
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[11px]">
          <span className="text-base leading-none">{side === "w" ? "♔" : "♚"}</span>
          <span className="text-[10px] uppercase">
            {side === "w" ? (language === "fr" ? "Blancs" : "White") : language === "fr" ? "Noirs" : "Black"}
          </span>
        </span>
      )
    }
    if (room.gameType === "draughts") {
      const side = isHostSide ? draughtsHostColor : draughtsGuestColor
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[11px]">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full border shadow-sm",
              side === "w" ? "border-slate-300 bg-white" : "border-amber-400/80 bg-slate-900",
            )}
          />
          <span className="text-[10px] uppercase">
            {side === "w" ? (language === "fr" ? "Blancs" : "White") : language === "fr" ? "Noirs" : "Black"}
          </span>
        </span>
      )
    }
    if (room.gameType === "ludo") {
      const side = isHostSide ? "host" : "guest"
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold border",
            side === "host"
              ? "border-blue-500/30 bg-blue-500/15 text-blue-500"
              : "border-emerald-500/30 bg-emerald-500/15 text-emerald-500",
          )}
        >
          <span
            className={cn("h-2 w-2 rounded-full", side === "host" ? "bg-blue-500" : "bg-emerald-500")}
          />
          {side === "host" ? (language === "fr" ? "Bleus" : "Blue") : language === "fr" ? "Verts" : "Green"}
        </span>
      )
    }
    if (room.gameType === "rps") {
      const score = isHostSide ? room.rpsHostScore : room.rpsGuestScore
      const ready = isHostSide ? !!room.rpsHostChoice : !!room.rpsGuestChoice
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[11px]">
          <span className="font-semibold text-primary">{score}</span>/{room.rpsTarget}
          {room.status === "playing" && (
            <span className={ready ? "text-emerald-500 font-bold" : "text-muted-foreground"}>
              {ready ? "✓" : "⏳"}
            </span>
          )}
        </span>
      )
    }
    if (room.gameType === "quiz") {
      const score = isHostSide ? room.quizHostScore : room.quizGuestScore
      const answered = isHostSide ? room.quizHostAnswers.length : room.quizGuestAnswers.length
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[11px]">
          <span className="font-semibold text-primary">{score}</span>/{room.quizQuestions.length} pts
          <span className="text-muted-foreground">({answered} rép.)</span>
        </span>
      )
    }
    if (room.gameType === "reaction") {
      const times = isHostSide ? room.hostTimes : room.guestTimes
      const avgMs = avg(times)
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[11px]">
          <span className="font-semibold text-primary">{avgMs !== null ? `${avgMs}ms` : "—"}</span>
          <span className="text-muted-foreground">({times.length}/{room.reactionTargetRounds})</span>
        </span>
      )
    }
    return null
  }

  const getCapturesStrip = (isHostSide: boolean) => {
    if (room.gameType === "chess") {
      const side = isHostSide ? chessHostColor : chessGuestColor
      return <ChessPlayerCaptures fen={room.chessFen} side={side} />
    }
    if (room.gameType === "draughts") {
      const side = isHostSide ? draughtsHostColor : draughtsGuestColor
      return <DraughtsPlayerCaptures board={room.draughtsState.board} side={side} />
    }
    return null
  }

  const renderPlayerCard = (
    player: { id: string; name: string; wins: number } | null,
    isMe: boolean,
    isHostSide: boolean,
    position: "top" | "bottom",
  ) => {
    const isTurnActive = isHostSide ? isHostTurnActive : isGuestTurnActive
    const liveMs = isHostSide ? hostLiveMs : guestLiveMs
    const missedTurns = isHostSide ? room.hostMissedTurns : room.guestMissedTurns
    const gameBadge = getPlayerBadge(isHostSide)
    const capturesStrip = getCapturesStrip(isHostSide)

    const showCountdownBar =
      isTurnActive &&
      room.status === "playing" &&
      room.turnLimitSec > 0 &&
      (room.gameType === "tictactoe" ||
        room.gameType === "connect4" ||
        room.gameType === "rps" ||
        room.gameType === "chess" ||
        room.gameType === "ludo" ||
        room.gameType === "draughts")

    return (
      <div
        className={cn(
          "w-full rounded-md border p-2.5 sm:p-3 transition-all duration-300",
          isTurnActive
            ? isMe
              ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.18)] ring-2 ring-primary/40"
              : "border-amber-500/80 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30"
            : "border-border bg-card/85",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Avatar, Name, Role Tag, Badge, Captures */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <div
              className={cn(
                "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold shadow-sm sm:h-9 sm:w-9",
                isTurnActive
                  ? isMe
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                    : "bg-amber-500 text-white ring-2 ring-amber-500/50"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {player ? player.name.slice(0, 2).toUpperCase() : "?"}
              {isTurnActive && (
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                      isMe ? "bg-primary" : "bg-amber-400",
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex h-2.5 w-2.5 rounded-full",
                      isMe ? "bg-primary" : "bg-amber-500",
                    )}
                  />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {player ? player.name : language === "fr" ? "En attente…" : "Waiting…"}
                </span>
                {isMe ? (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                    {language === "fr" ? "VOUS" : "YOU"}
                  </span>
                ) : (
                  <span className="rounded-full bg-muted/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    {isSpectator
                      ? isHostSide
                        ? "J1"
                        : "J2"
                      : language === "fr"
                        ? "ADVERSAIRE"
                        : "OPPONENT"}
                  </span>
                )}
                {gameBadge}
              </div>

              {capturesStrip && <div className="mt-0.5">{capturesStrip}</div>}
            </div>
          </div>

          {/* Right: Turn status badge, timer, and score */}
          <div className="flex items-center gap-2 sm:gap-3">
            {missedTurns > 0 && (
              <span className="rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 font-mono text-[10px] text-destructive">
                ⚠️ {missedTurns}/4 {language === "fr" ? "manqué" : "missed"}
              </span>
            )}

            {room.status === "playing" && (
              <>
                {isTurnActive ? (
                  isMe ? (
                    <span className="inline-flex animate-pulse items-center gap-1 rounded-full border border-primary/50 bg-primary/20 px-2 py-0.5 font-mono text-[10px] font-bold text-primary sm:px-2.5 sm:text-[11px]">
                      ⚡ {language === "fr" ? "À VOUS !" : "YOUR TURN!"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] text-amber-500 sm:px-2.5 sm:text-[11px]">
                      ⏳ {language === "fr" ? "Réfléchit…" : "Thinking…"}
                    </span>
                  )
                ) : null}
              </>
            )}

            {/* Live Clock for this player */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-xs tabular-nums",
                isTurnActive
                  ? isMe
                    ? "border-primary/40 bg-primary/10 font-semibold text-primary"
                    : "border-amber-500/40 bg-amber-500/10 font-semibold text-amber-500"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              <Clock className={cn("h-3 w-3", isTurnActive && (isMe ? "text-primary" : "text-amber-500"))} />
              {fmtClock(liveMs)}
            </span>

            {/* Wins count */}
            <span
              className="inline-flex min-w-[32px] items-center justify-center rounded border border-border bg-background px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-foreground"
              title={language === "fr" ? "Victoires" : "Wins"}
            >
              {player?.wins ?? 0} {language === "fr" ? "vic." : "w"}
            </span>
          </div>
        </div>

        {/* Turn countdown bar attached directly to active player's card */}
        {showCountdownBar && (
          <div className="mt-2 space-y-1 border-t border-border/40 pt-1.5">
            <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>{language === "fr" ? "Temps de coup" : "Turn limit"}</span>
              <span
                className={cn(
                  "font-bold tabular-nums",
                  isCountdownUrgent
                    ? "animate-pulse text-destructive"
                    : isCountdownWarn
                      ? "text-amber-500"
                      : "text-primary",
                )}
              >
                {countdownSecsLeft}s / {room.turnLimitSec}s
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-100",
                  isCountdownUrgent ? "bg-destructive" : isCountdownWarn ? "bg-amber-500" : "bg-primary",
                )}
                style={{ width: `${countdownPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 sm:gap-5 transition-all",
        isFullscreen &&
          "fixed inset-0 z-[99999] h-[100dvh] w-screen max-w-none overflow-y-auto bg-background p-3 sm:p-6",
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
            className={cn(
              "btn h-8 px-2.5 text-xs transition-colors",
              isFullscreen
                ? "border-primary/60 bg-primary/20 text-primary shadow-sm hover:bg-primary/25"
                : "btn-outline",
            )}
            title={
              isFullscreen
                ? language === "fr"
                  ? "Quitter le plein écran (Échap)"
                  : "Exit fullscreen (Esc)"
                : language === "fr"
                  ? "Plein écran"
                  : "Fullscreen"
            }
            aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 text-primary" /> : <Maximize2 className="h-3.5 w-3.5" />}
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

      {/* Timeout notice banner */}
      {room.lastTimeoutNotice && room.status === "playing" && (
        <div className="w-full rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center font-mono text-xs text-amber-600 dark:text-amber-400">
          ⏱ {room.lastTimeoutNotice}
        </div>
      )}

      {/* 1V1 SCREEN LAYOUT: TOP PLAYER (OPPONENT / FACING YOU) */}
      {room.status !== "waiting" && renderPlayerCard(topPlayer, isTopMe, isTopHost, "top")}

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
      )}

      {/* 2. TIC-TAC-TOE 1v1 */}
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "tictactoe" && (
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
        <ChessBoard
          fen={room.chessFen}
          orientation={isGuest ? chessGuestColor : chessHostColor}
          interactive={!isSpectator && room.status === "playing"}
          allowedColor={isHost ? chessHostColor : isGuest ? chessGuestColor : "w"}
          lastMove={room.chessLastMove}
          onMove={(from, to) => sendRoomAction({ action: "chess_move", from, to })}
        />
      )}

      {/* 8. INTERNATIONAL DRAUGHTS 1v1 */}
      {room.status !== "waiting" && room.status !== "ended" && room.gameType === "draughts" && (
        <DraughtsBoard
          state={room.draughtsState}
          orientation={isGuest ? draughtsGuestColor : draughtsHostColor}
          canInteractSide={
            !isSpectator && room.status === "playing" ? (isHost ? draughtsHostColor : draughtsGuestColor) : null
          }
          onMove={(m) => {
            lastDraughtsMoveRef.current = `${m.from.join(",")}-${m.to.join(",")}`
            sendRoomAction({ action: "draughts_move", from: m.from, to: m.to, move: m })
          }}
          whiteLabel={room.draughtsWhiteSide === "host" ? room.host.name : room.guest?.name || "Blancs"}
          blackLabel={room.draughtsWhiteSide === "host" ? room.guest?.name || "Noirs" : room.host.name}
        />
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

      {/* 1V1 SCREEN LAYOUT: BOTTOM PLAYER (YOU / ME) */}
      {room.status !== "waiting" && renderPlayerCard(bottomPlayer, isBottomMe, isBottomHost, "bottom")}
    </div>
  )
}
