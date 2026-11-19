"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  Bomb,
  BookOpen,
  Brain,
  Camera,
  Check,
  CircleDot,
  Crown,
  Gamepad2,
  Grid2x2,
  Hand,
  Hash,
  HelpCircle,
  Image as ImageIcon,
  Keyboard,
  Layers,
  Lightbulb,
  Loader2,
  Medal,
  Music,
  Pencil,
  Play,
  RefreshCw,
  Share2,
  Target,
  Trash2,
  Trophy,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

import Link from "next/link"
import type { DuoGameType } from "@/app/api/games/rooms/route"

import { useLanguage } from "@/components/language-provider"
import BreakoutGame from "@/components/games/breakout-game"
import DuoArena from "@/components/games/duo-arena"
import Game2048 from "@/components/games/game-2048"
import GameCover from "@/components/games/game-cover"
import MemoryGame from "@/components/games/memory-game"
import MinesweeperGame from "@/components/games/minesweeper-game"
import PuzzleGame from "@/components/games/puzzle-game"
import ReactionGame from "@/components/games/reaction-game"
import SimonGame from "@/components/games/simon-game"
import SnakeGame from "@/components/games/snake-game"
import TicTacToeGame from "@/components/games/tic-tac-toe-game"
import TypingGame from "@/components/games/typing-game"
import {
  formatScore,
  gameCategoryLabels,
  gamesCopy,
  gamesList,
  getPlayerAvatar,
  getPlayerId,
  getPlayerName,
  readScore,
  setPlayerAvatar,
  setPlayerName,
  submitLeaderboardScore,
  type GameCategory,
  type GameId,
  type LeaderboardEntry,
} from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Filter = "all" | GameCategory
type SideTab = "leaderboard" | "guide"

const GAME_ICONS: Record<GameId, LucideIcon> = {
  snake: Gamepad2,
  "2048": Grid2x2,
  tictactoe: Hash,
  memory: Brain,
  reaction: Zap,
  breakout: Layers,
  minesweeper: Bomb,
  typing: Keyboard,
  simon: Music,
  puzzle: ImageIcon,
  connect4: CircleDot,
  "duo-tictactoe": Users,
  rps: Hand,
  quiz: HelpCircle,
  "duo-reaction": Zap,
}

const DUO_ID_TO_TYPE: Partial<Record<GameId, DuoGameType>> = {
  connect4: "connect4",
  "duo-tictactoe": "tictactoe",
  rps: "rps",
  quiz: "quiz",
  "duo-reaction": "reaction",
}

const DUO_TYPE_TO_ID: Record<DuoGameType, GameId> = {
  connect4: "connect4",
  tictactoe: "duo-tictactoe",
  rps: "rps",
  quiz: "quiz",
  reaction: "duo-reaction",
}

export default function GamesHub() {
  const { t, language } = useLanguage()
  const [filter, setFilter] = useState<Filter>("all")
  const [activeId, setActiveId] = useState<GameId>("snake")
  const [sideTab, setSideTab] = useState<SideTab>("leaderboard")

  // Player identity
  const [playerName, setPlayerNameState] = useState<string>("")
  const [playerAvatar, setPlayerAvatarState] = useState<string>("")
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState<string>("")
  const [editingName, setEditingName] = useState<boolean>(false)
  const [hydrated, setHydrated] = useState<boolean>(false)

  // Local records + server leaderboard
  const [records, setRecords] = useState<Record<GameId, number | null>>({
    snake: null,
    "2048": null,
    tictactoe: null,
    memory: null,
    reaction: null,
    breakout: null,
    minesweeper: null,
    typing: null,
    simon: null,
    puzzle: null,
    connect4: null,
    "duo-tictactoe": null,
    rps: null,
    quiz: null,
    "duo-reaction": null,
  })
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingBoard, setLoadingBoard] = useState<boolean>(false)
  const [initialRoomCode, setInitialRoomCode] = useState<string | null>(null)
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null)
  const [sharedCopied, setSharedCopied] = useState<boolean>(false)

  const arenaRef = useRef<HTMLElement | null>(null)

  const refreshRecords = useCallback(() => {
    const next: Record<GameId, number | null> = {
      snake: null,
      "2048": null,
      tictactoe: null,
      memory: null,
      reaction: null,
      breakout: null,
      minesweeper: null,
      typing: null,
      simon: null,
      puzzle: null,
      connect4: null,
      "duo-tictactoe": null,
      rps: null,
      quiz: null,
      "duo-reaction": null,
    }
    for (const g of gamesList) {
      next[g.id] = readScore(g.scoreKey)
    }
    setRecords(next)
  }, [])

  const fetchLeaderboard = useCallback(async (game: GameId) => {
    setLoadingBoard(true)
    try {
      const res = await fetch(`/api/games/leaderboard?game=${encodeURIComponent(game)}`, {
        cache: "no-store",
      })
      if (!res.ok) return
      const data = await res.json()
      setLeaderboard(Array.isArray(data.entries) ? data.entries : [])
    } catch {
      // Keep current list on network error
    } finally {
      setLoadingBoard(false)
    }
  }, [])

  useEffect(() => {
    getPlayerId()
    const saved = getPlayerName()
    setPlayerNameState(saved)
    setNameInput(saved)
    setPlayerAvatarState(getPlayerAvatar())
    setHydrated(true)
    refreshRecords()

    // Read ?room=CODE or ?game=ID from URL
    const params = new URLSearchParams(window.location.search)
    const roomParam = params.get("room")?.trim().toUpperCase()
    const gameParam = params.get("game")?.trim().toLowerCase() as GameId | null
    if (roomParam) {
      setInitialRoomCode(roomParam)
      setActiveRoomCode(roomParam)
      setActiveId("connect4")
      fetch(`/api/games/rooms?code=${encodeURIComponent(roomParam)}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const gType = data?.room?.gameType as DuoGameType | undefined
          if (gType && DUO_TYPE_TO_ID[gType]) {
            setActiveId(DUO_TYPE_TO_ID[gType])
          }
        })
        .catch(() => {})
    } else if (gameParam && gamesList.some((g) => g.id === gameParam)) {
      setActiveId(gameParam)
    }

    const onScoreUpdated = () => refreshRecords()
    const onNameUpdated = (e: Event) => {
      const nextName = (e as CustomEvent<string>).detail
      if (typeof nextName === "string" && nextName.trim().length >= 2) {
        setPlayerNameState(nextName.trim())
        setNameInput(nextName.trim())
      }
    }
    const onLeaderboardUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ game: GameId; entries: LeaderboardEntry[] }>).detail
      if (detail && detail.game === activeId && Array.isArray(detail.entries)) {
        setLeaderboard(detail.entries)
      }
    }

    window.addEventListener("fj-game-score-updated", onScoreUpdated)
    window.addEventListener("fj-player-name-updated", onNameUpdated)
    window.addEventListener("fj-leaderboard-updated", onLeaderboardUpdated)
    return () => {
      window.removeEventListener("fj-game-score-updated", onScoreUpdated)
      window.removeEventListener("fj-player-name-updated", onNameUpdated)
      window.removeEventListener("fj-leaderboard-updated", onLeaderboardUpdated)
    }
  }, [activeId, refreshRecords])

  useEffect(() => {
    fetchLeaderboard(activeId)
  }, [activeId, fetchLeaderboard])

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: t("all") },
    ...(Object.keys(gameCategoryLabels) as GameCategory[]).map((c) => ({
      value: c,
      label: tr(gameCategoryLabels[c], language),
    })),
  ]

  const count = (f: Filter) => gamesList.filter((g) => f === "all" || g.category === f).length
  const visibleGames = gamesList.filter((g) => filter === "all" || g.category === filter)
  const activeGame = gamesList.find((g) => g.id === activeId) ?? gamesList[0]

  const selectGame = (id: GameId) => {
    setActiveId(id)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("room")
      url.searchParams.set("game", id)
      window.history.replaceState({}, "", url.toString())
    }
    arenaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleRoomChange = useCallback((code: string | null) => {
    setActiveRoomCode(code)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("game")
      if (code) url.searchParams.set("room", code)
      else url.searchParams.delete("room")
      window.history.replaceState({}, "", url.toString())
    }
  }, [])

  const handleShareGame = async () => {
    if (typeof window === "undefined") return
    const shareUrl =
      DUO_ID_TO_TYPE[activeId] && activeRoomCode
        ? `${window.location.origin}/jeux?room=${activeRoomCode}`
        : `${window.location.origin}/jeux?game=${activeId}`
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `F_Junior — ${tr(activeGame.title, language)}`,
          url: shareUrl,
        })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setSharedCopied(true)
      window.setTimeout(() => setSharedCopied(false), 2000)
    } catch {}
  }

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault()
    const saved = setPlayerName(nameInput)
    if (saved.length < 2) return
    setPlayerNameState(saved)
    setNameInput(saved)
    setEditingName(false)

    // Sync existing local best for current game if any
    const currentBest = readScore(activeGame.scoreKey)
    if (currentBest !== null) {
      submitLeaderboardScore(activeGame.id, currentBest)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setAvatarError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("deviceId", getPlayerId())
      const res = await fetch("/api/games/avatar", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        setAvatarError(data.error || "Erreur d'envoi")
        return
      }
      if (data.url) {
        setPlayerAvatar(data.url)
        setPlayerAvatarState(data.url)
        fetchLeaderboard(activeId)
      }
    } catch {
      setAvatarError(language === "fr" ? "Erreur réseau" : "Network error")
    } finally {
      setUploadingAvatar(false)
      e.target.value = ""
    }
  }

  const clearAllRecords = () => {
    try {
      for (const g of gamesList) {
        window.localStorage.removeItem(g.scoreKey)
      }
      window.localStorage.removeItem("fj_game_best_memory_6")
      window.dispatchEvent(new CustomEvent("fj-game-score-updated"))
    } catch {}
  }

  const hasAnyRecord = Object.values(records).some((v) => v !== null)
  const needsPseudo = hydrated && (!playerName || editingName)

  return (
    <>
      {/* Full-bleed Hero Banner with Background Image */}
      <header className="relative overflow-hidden border-b border-border bg-[#0c1018] text-white">
        {/* Background Image */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <img
            src="/games-banner.jpg"
            alt=""
            className="h-full w-full object-cover object-[78%_center] opacity-85 sm:object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17]/95 via-[#0b0f17]/72 to-[#0b0f17]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-[#0b0f17]/60" />
        </div>

        <div className="container relative z-10 pb-12 pt-28 md:pb-16 md:pt-36">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-white/75 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              {t("backToHome")}
            </Link>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-white/75">
              {tr(gamesCopy.eyebrow, language)}
            </span>
          </div>

          <h1 className="mt-10 font-serif text-[clamp(3rem,10vw,9rem)] leading-[0.9] tracking-[-0.02em] text-white">
            {tr(gamesCopy.title, language)}
            <span className="text-primary">.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:mt-8 sm:text-lg md:text-xl">
            {tr(gamesCopy.intro, language)}
          </p>

          <div
            className="-mx-4 mt-8 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-10 sm:flex-wrap sm:overflow-visible sm:px-0"
            role="group"
            aria-label={tr(gamesCopy.selectGame, language)}
          >
            {filters.map((f) => {
              const active = filter === f.value
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  data-active={active}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 font-mono text-[0.72rem] uppercase tracking-wider backdrop-blur-sm transition-colors",
                    active
                      ? "border-white bg-white text-[#0b0f17]"
                      : "border-white/25 bg-[#0b0f17]/45 text-white/85 hover:border-white/60 hover:text-white",
                  )}
                >
                  {f.label}
                  <span className="opacity-65">{count(f.value)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Active Game Arena (mobile-first full-bleed feel -> wider max-w-1440px on desktop) */}
      <section ref={arenaRef} id="game-arena" className="mx-auto w-full max-w-[1440px] scroll-mt-20 px-3 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-10">
        <div className="overflow-hidden rounded-md border border-border bg-card">
          {/* Arena Header */}
          <div className="flex flex-col gap-3.5 border-b border-border px-4 py-4 sm:px-8 sm:py-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 xl:justify-start">
              <div>
                <p className="eyebrow">
                  {tr(gamesCopy.arenaEyebrow, language)} · {tr(gameCategoryLabels[activeGame.category], language)}
                </p>
                <h2 className="mt-1 font-serif text-2xl leading-tight sm:text-4xl">
                  {tr(activeGame.title, language)}
                  <span className="ml-2 hidden font-sans text-sm font-normal text-muted-foreground sm:inline">
                    — {tr(activeGame.tagline, language)}
                  </span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {playerName && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(playerName)
                      setEditingName(true)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground sm:px-3 sm:text-xs"
                  >
                    {playerAvatar ? (
                      <img
                        src={playerAvatar}
                        alt={playerName}
                        className="h-4 w-4 rounded-full object-cover sm:h-5 sm:w-5"
                      />
                    ) : (
                      <User className="h-3.5 w-3.5 text-primary" />
                    )}
                    <strong className="max-w-[96px] truncate text-foreground sm:max-w-none">{playerName}</strong>
                    <Pencil className="h-3 w-3 opacity-60" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleShareGame}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground sm:px-3.5 sm:text-xs"
                >
                  {sharedCopied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="hidden xs:inline sm:inline">
                    {sharedCopied ? tr(gamesCopy.linkCopied, language) : tr(gamesCopy.share, language)}
                  </span>
                </button>
              </div>
            </div>

            {/* Horizontal swipeable game rail on mobile, clean wrap on desktop */}
            <div className="-mx-4 flex flex-nowrap items-center gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 lg:flex-wrap lg:overflow-visible lg:pb-0">
              {gamesList.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setActiveId(g.id)
                    if (typeof window !== "undefined") {
                      const url = new URL(window.location.href)
                      url.searchParams.delete("room")
                      url.searchParams.set("game", g.id)
                      window.history.replaceState({}, "", url.toString())
                    }
                  }}
                  data-active={activeId === g.id}
                  className="chip shrink-0"
                >
                  {tr(g.title, language)}
                </button>
              ))}
            </div>
          </div>

          {/* Arena Stage + Right Sidebar (Leaderboard & CCM) */}
          <div className="grid lg:grid-cols-12">
            {/* Playable Game Area (Mobile-first padding + ambient backdrop + 8 cols on desktop) */}
            <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden p-3.5 sm:min-h-[480px] sm:p-8 lg:col-span-8 lg:min-h-[540px] lg:p-10">
              {/* Ambient Studio Background Image */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <img
                  src="/arena-bg.jpg"
                  alt=""
                  className="h-full w-full object-cover object-center opacity-30 dark:opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-card/55 via-card/30 to-card/60 dark:from-card/50 dark:via-card/30 dark:to-card/60" />
              </div>

              <div className="relative z-10 w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                  >
                    {activeId === "snake" && <SnakeGame />}
                    {activeId === "2048" && <Game2048 />}
                    {activeId === "tictactoe" && <TicTacToeGame />}
                    {activeId === "memory" && <MemoryGame />}
                    {activeId === "reaction" && <ReactionGame />}
                    {activeId === "breakout" && <BreakoutGame />}
                    {activeId === "minesweeper" && <MinesweeperGame />}
                    {activeId === "typing" && <TypingGame />}
                    {activeId === "simon" && <SimonGame />}
                    {activeId === "puzzle" && <PuzzleGame />}
                    {DUO_ID_TO_TYPE[activeId] && (
                      <DuoArena
                        key={activeId}
                        gameType={DUO_ID_TO_TYPE[activeId]!}
                        scoreKey={activeGame.scoreKey}
                        playerName={playerName}
                        initialRoomCode={initialRoomCode}
                        onRoomChange={handleRoomChange}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Player Pseudo Gate Overlay */}
              <AnimatePresence>
                {needsPseudo && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-background/85 p-4 backdrop-blur-md sm:p-6"
                  >
                    <form
                      onSubmit={handleSaveName}
                      className="my-auto w-full max-w-md rounded-md border border-border bg-card p-5 shadow-lg sm:p-8"
                    >
                      <div className="mb-4 flex items-center gap-4">
                        <label className="group relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors hover:border-primary">
                          {uploadingAvatar ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : playerAvatar ? (
                            <img src={playerAvatar} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <Camera className="h-5 w-5" />
                          )}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={handleAvatarUpload}
                            className="sr-only"
                          />
                        </label>
                        <div>
                          <p className="font-mono text-xs uppercase tracking-wider text-primary">
                            {language === "fr" ? "Photo de profil (optionnel)" : "Profile photo (optional)"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {language === "fr"
                              ? "Cliquez sur le cercle pour ajouter un avatar"
                              : "Click the circle to upload an avatar"}
                          </p>
                          {avatarError && <p className="mt-1 text-xs text-destructive">{avatarError}</p>}
                        </div>
                      </div>
                      <h3 className="font-serif text-3xl leading-tight">
                        {tr(gamesCopy.enterPseudoTitle, language)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {tr(gamesCopy.enterPseudoDesc, language)}
                      </p>

                      <div className="mt-5 space-y-3">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder={tr(gamesCopy.pseudoPlaceholder, language)}
                          minLength={2}
                          maxLength={24}
                          required
                          autoFocus
                          className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="submit"
                            disabled={nameInput.trim().length < 2}
                            className="btn btn-solid flex-1"
                          >
                            <Play className="h-4 w-4" />
                            {tr(gamesCopy.saveAndPlay, language)}
                          </button>
                          {editingName && playerName && (
                            <button
                              type="button"
                              onClick={() => setEditingName(false)}
                              className="btn btn-outline px-4"
                            >
                              {t("close")}
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Sidebar: Leaderboard + How It Works (CCM) */}
            <aside className="flex flex-col border-t border-border bg-background/40 lg:col-span-4 lg:border-l lg:border-t-0">
              {/* Sidebar Tabs */}
              <div className="grid grid-cols-2 border-b border-border bg-card/50">
                <button
                  type="button"
                  onClick={() => setSideTab("leaderboard")}
                  className={cn(
                    "flex items-center justify-center gap-2 border-b-2 px-4 py-3.5 font-mono text-xs uppercase tracking-wider transition-colors",
                    sideTab === "leaderboard"
                      ? "border-primary bg-background/60 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Trophy className="h-3.5 w-3.5 text-primary" />
                  {tr(gamesCopy.leaderboard, language)}
                </button>
                <button
                  type="button"
                  onClick={() => setSideTab("guide")}
                  className={cn(
                    "flex items-center justify-center gap-2 border-b-2 px-4 py-3.5 font-mono text-xs uppercase tracking-wider transition-colors",
                    sideTab === "guide"
                      ? "border-primary bg-background/60 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  {tr(gamesCopy.howToPlay, language)}
                </button>
              </div>

              {/* Sidebar Body */}
              <div className="flex-1 p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {sideTab === "leaderboard" ? (
                    <motion.div
                      key={`lb-${activeId}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="eyebrow">{tr(gamesCopy.topPlayers, language)}</p>
                          <p className="mt-0.5 font-serif text-2xl">{tr(activeGame.title, language)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fetchLeaderboard(activeId)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                          aria-label="Refresh leaderboard"
                        >
                          <RefreshCw className={cn("h-3.5 w-3.5", loadingBoard && "animate-spin")} />
                        </button>
                      </div>

                      {leaderboard.length === 0 ? (
                        <div className="rounded-md border border-dashed border-border bg-card/50 p-6 text-center">
                          <Trophy className="mx-auto h-7 w-7 text-primary/60" />
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {tr(gamesCopy.noLeaderboardYet, language)}
                          </p>
                        </div>
                      ) : (
                        <ol className="space-y-2">
                          {leaderboard.slice(0, 10).map((entry, idx) => {
                            const rank = idx + 1
                            const isMe =
                              entry.isCurrentPlayer &&
                              playerName &&
                              entry.name.toLowerCase() === playerName.toLowerCase()
                            return (
                              <li
                                key={entry.id}
                                className={cn(
                                  "flex items-center justify-between gap-3 rounded-md border px-3.5 py-2.5 transition-colors",
                                  isMe
                                    ? "border-primary/50 bg-primary/10"
                                    : rank === 1
                                      ? "border-amber-500/40 bg-amber-500/5"
                                      : "border-border bg-card/60",
                                )}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <span
                                    className={cn(
                                      "grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold",
                                      rank === 1 && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                                      rank === 2 && "bg-slate-400/20 text-slate-600 dark:text-slate-300",
                                      rank === 3 && "bg-orange-500/20 text-orange-600 dark:text-orange-400",
                                      rank > 3 && "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    {rank === 1 ? (
                                      <Crown className="h-3.5 w-3.5" />
                                    ) : rank <= 3 ? (
                                      <Medal className="h-3.5 w-3.5" />
                                    ) : (
                                      rank
                                    )}
                                  </span>
                                  {entry.avatarUrl && (
                                    <img
                                      src={entry.avatarUrl}
                                      alt={entry.name}
                                      className="h-6 w-6 shrink-0 rounded-full border border-border object-cover"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                                      <span className="truncate">{entry.name}</span>
                                      {isMe && (
                                        <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                                          {tr(gamesCopy.youBadge, language)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
                                  {formatScore(entry.score, activeGame.scoreUnit, language)}
                                </span>
                              </li>
                            )
                          })}
                        </ol>
                      )}

                      {/* Compact quick summary of objective below leaderboard */}
                      <div className="rounded-md border border-border bg-card/50 p-4">
                        <p className="eyebrow inline-flex items-center gap-1.5 text-foreground">
                          <Target className="h-3.5 w-3.5 text-primary" />
                          {tr(gamesCopy.objective, language)}
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                          {tr(activeGame.objective, language)}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`guide-${activeId}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      {/* Description */}
                      <div>
                        <p className="eyebrow inline-flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          {tr(gamesCopy.aboutGame, language)}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {tr(activeGame.description, language)}
                        </p>
                      </div>

                      {/* Objective */}
                      <div className="rounded-md border border-border bg-card/70 p-4">
                        <p className="eyebrow inline-flex items-center gap-1.5 text-foreground">
                          <Target className="h-3.5 w-3.5 text-primary" />
                          {tr(gamesCopy.objective, language)}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                          {tr(activeGame.objective, language)}
                        </p>
                      </div>

                      {/* How it works (Comment ça marche) */}
                      <div>
                        <p className="eyebrow mb-3">{tr(gamesCopy.howToPlay, language)}</p>
                        <ol className="space-y-2.5">
                          {activeGame.howToPlay.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                            >
                              <span className="mt-0.5 shrink-0 font-mono text-xs text-primary">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span>{tr(step, language)}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Pro Tip */}
                      <div className="rounded-md border border-primary/25 bg-primary/5 p-4">
                        <p className="eyebrow inline-flex items-center gap-1.5 text-primary">
                          <Lightbulb className="h-3.5 w-3.5" />
                          {tr(gamesCopy.proTip, language)}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                          {tr(activeGame.tip, language)}
                        </p>
                      </div>

                      {/* Shortcuts */}
                      <div>
                        <p className="eyebrow mb-2.5 inline-flex items-center gap-1.5">
                          <Keyboard className="h-3.5 w-3.5 text-primary" />
                          {tr(gamesCopy.controlsLabel, language)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeGame.shortcuts.map((keyLabel) => (
                            <kbd
                              key={keyLabel}
                              className="rounded border border-border bg-background px-2.5 py-1 font-mono text-xs text-foreground shadow-sm"
                            >
                              {keyLabel}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </aside>
          </div>

          {/* Arena Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/50 px-5 py-3.5 sm:px-8">
            <p className="font-mono text-xs text-muted-foreground">
              <span className="text-foreground">{tr(gamesCopy.controlsLabel, language)} :</span>{" "}
              {tr(activeGame.controls, language)}
            </p>
            <p className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-primary" />
              {tr(gamesCopy.record, language)} :{" "}
              <span className="text-foreground">
                {formatScore(records[activeGame.id], activeGame.scoreUnit, language)}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Games Catalog Grid */}
      <section className="border-t border-border bg-card/50">
        <div className="container py-20 md:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{tr(gamesCopy.selectGame, language)}</p>
              <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
                {language === "fr" ? "Catalogue des jeux" : "Game catalog"}
              </h2>
            </div>

            {hasAnyRecord && (
              <button
                type="button"
                onClick={clearAllRecords}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {tr(gamesCopy.resetScores, language)}
              </button>
            )}
          </div>

          <motion.ul layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visibleGames.map((game) => {
                const index = gamesList.indexOf(game)
                const Icon = GAME_ICONS[game.id]
                const isSelected = activeId === game.id
                const best = records[game.id]

                return (
                  <motion.li
                    layout
                    key={game.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      type="button"
                      onClick={() => selectGame(game.id)}
                      data-cursor={tr(gamesCopy.play, language)}
                      className={cn(
                        "group flex h-full w-full flex-col justify-between overflow-hidden rounded-md border p-4 text-left transition-all duration-300 sm:p-5",
                        isSelected
                          ? "border-primary bg-background shadow-sm"
                          : "border-border bg-background/70 hover:border-foreground/40 hover:bg-background",
                      )}
                    >
                      <div>
                        <GameCover gameId={game.id} />

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="eyebrow inline-flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                            {String(index + 1).padStart(2, "0")} · {tr(gameCategoryLabels[game.category], language)}
                          </span>
                        </div>

                        <h3 className="mt-2 font-serif text-3xl leading-tight transition-colors group-hover:text-primary">
                          {tr(game.title, language)}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {tr(game.description, language)}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <Trophy className="h-3.5 w-3.5 text-primary" />
                          {best !== null
                            ? formatScore(best, game.scoreUnit, language)
                            : tr(gamesCopy.noRecord, language)}
                        </span>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "border border-border text-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
                          )}
                        >
                          <Play className="h-3 w-3" />
                          {isSelected ? tr(gamesCopy.playing, language) : tr(gamesCopy.play, language)}
                        </span>
                      </div>
                    </button>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </motion.ul>
        </div>
      </section>
    </>
  )
}
