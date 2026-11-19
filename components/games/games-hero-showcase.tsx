"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Gamepad2,
  Play,
  Shuffle,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react"

import GameCover from "@/components/games/game-cover"
import { UNIFIED_GAME_GROUPS } from "@/components/games/game-launch-modal"
import { useLanguage } from "@/components/language-provider"
import { gameCategoryLabels, gamesList, type GameId } from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface GamesHeroShowcaseProps {
  onSelectGame: (id: GameId) => void
  onQuickJoinRoom: (code: string) => void
  topLeader?: { playerName: string; score: number; gameTitle: string } | null
}

const FEATURED_IDS: GameId[] = [
  "chess",
  "ludo",
  "connect4",
  "snake",
  "puzzle",
  "2048",
  "rps",
  "quiz",
]

type TabMode = "spotlight" | "quick"

export default function GamesHeroShowcase({
  onSelectGame,
  onQuickJoinRoom,
  topLeader,
}: GamesHeroShowcaseProps) {
  const { language } = useLanguage()
  const [tab, setTab] = useState<TabMode>("spotlight")
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [roomInput, setRoomInput] = useState("")

  const featuredGames = FEATURED_IDS.map((id) => gamesList.find((g) => g.id === id)).filter(
    (g): g is (typeof gamesList)[number] => Boolean(g),
  )

  useEffect(() => {
    if (paused || tab !== "spotlight") return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % featuredGames.length)
    }, 4500)
    return () => window.clearInterval(id)
  }, [featuredGames.length, paused, tab])

  const current = featuredGames[index] ?? gamesList[0]
  const isDuo = current.category === "duo"

  const goPrev = () => setIndex((i) => (i - 1 + featuredGames.length) % featuredGames.length)
  const goNext = () => setIndex((i) => (i + 1) % featuredGames.length)

  const handleSurpriseMe = () => {
    const random = gamesList[Math.floor(Math.random() * gamesList.length)]
    if (random) onSelectGame(random.id)
  }

  const handleQuickJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = roomInput.trim().toUpperCase()
    if (clean.length < 4) return
    onQuickJoinRoom(clean)
    setRoomInput("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full overflow-hidden rounded-xl border border-white/15 bg-[#0d1322]/75 p-4 text-white shadow-2xl backdrop-blur-md sm:p-5"
    >
      {/* Subtle animated ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-blue-400/15 blur-3xl"
      />

      {/* Top multifunctional switcher */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-0.5">
          <button
            type="button"
            onClick={() => setTab("spotlight")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
              tab === "spotlight" ? "bg-white text-[#0b0f17] font-semibold" : "text-white/70 hover:text-white",
            )}
          >
            <Flame className="h-3 w-3 text-primary" />
            {language === "fr" ? "À l'affiche" : "Spotlight"}
          </button>
          <button
            type="button"
            onClick={() => setTab("quick")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
              tab === "quick" ? "bg-white text-[#0b0f17] font-semibold" : "text-white/70 hover:text-white",
            )}
          >
            <Swords className="h-3 w-3 text-primary" />
            {language === "fr" ? "Accès rapide" : "Quick play"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSurpriseMe}
          title={language === "fr" ? "Lancer un jeu aléatoire" : "Play a random game"}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80 transition-colors hover:border-primary/60 hover:bg-primary/20 hover:text-white"
        >
          <Shuffle className="h-3 w-3 text-primary" />
          <span className="hidden sm:inline">{language === "fr" ? "Aléatoire" : "Random"}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="relative z-10 mt-3.5 min-h-[225px]">
        <AnimatePresence mode="wait">
          {tab === "spotlight" ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col gap-3.5"
            >
              {/* Visual Cover + Live Promo Badge */}
              <div
                onClick={() => onSelectGame(current.id)}
                className="group relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-lg border border-white/15 bg-[#090d16]"
              >
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                  <GameCover gameId={current.id} />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090d16]/85 via-transparent to-transparent" />

                <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md",
                      isDuo
                        ? "border border-primary/50 bg-primary/80 text-white"
                        : "border border-white/20 bg-[#0b0f17]/70 text-white/90",
                    )}
                  >
                    {isDuo ? <Users className="h-2.5 w-2.5" /> : <Gamepad2 className="h-2.5 w-2.5" />}
                    {tr(gameCategoryLabels[current.category], language)}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-xl leading-tight text-white sm:text-2xl">
                      {tr(current.title, language)}
                    </p>
                    <p className="truncate font-mono text-[11px] text-white/75">
                      {tr(current.tagline, language)}
                    </p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#0b0f17] shadow-lg transition-transform duration-200 group-hover:scale-110">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                </div>
              </div>

              {/* Description + Controls */}
              <p className="line-clamp-2 text-xs leading-relaxed text-white/75">
                {tr(current.description, language)}
              </p>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectGame(current.id)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0b0f17] transition-transform hover:scale-[1.02]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {language === "fr" ? "Jouer maintenant" : "Play now"}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Jeu précédent"
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-mono text-[10px] tabular-nums text-white/60">
                    {index + 1}/{featuredGames.length}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Jeu suivant"
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Animated progress dots */}
              <div className="flex items-center gap-1 pt-0.5">
                {featuredGames.map((g, idx) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setIndex(idx)}
                    aria-label={tr(g.title, language)}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      idx === index ? "flex-1 bg-primary" : "w-3 bg-white/20 hover:bg-white/40",
                    )}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quick-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3.5"
            >
              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-2.5">
                  <p className="font-mono text-lg font-bold tabular-nums text-white">{UNIFIED_GAME_GROUPS.length}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-white/60">
                    {language === "fr" ? "Jeux" : "Games"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-2.5">
                  <p className="font-mono text-lg font-bold tabular-nums text-primary">
                    {UNIFIED_GAME_GROUPS.filter((g) => Boolean(g.duoId)).length}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-white/60">Duo 1v1</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-2.5">
                  <p className="font-mono text-lg font-bold tabular-nums text-emerald-400">Live</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-white/60">
                    {language === "fr" ? "Classement" : "Ranks"}
                  </p>
                </div>
              </div>

              {/* Quick join 1v1 room */}
              <form onSubmit={handleQuickJoinSubmit} className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-white/70">
                  {language === "fr" ? "Rejoindre un salon 1v1 par code" : "Join a 1v1 room by code"}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                    maxLength={8}
                    placeholder="EX: A7K9P2"
                    className="h-9 flex-1 rounded-md border border-white/15 bg-white/5 px-3 font-mono text-xs uppercase tracking-widest text-white placeholder:text-white/35 focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={roomInput.trim().length < 4}
                    className="h-9 rounded-md bg-primary px-3.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition-opacity disabled:opacity-40"
                  >
                    {language === "fr" ? "Go" : "Join"}
                  </button>
                </div>
              </form>

              {/* Featured quick-launch pills */}
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
                  {language === "fr" ? "Lancements populaires" : "Popular picks"}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["duo-ludo", "duo-chess", "connect4", "snake"] as GameId[]).map((gid) => {
                    const g = gamesList.find((x) => x.id === gid)
                    if (!g) return null
                    return (
                      <button
                        key={gid}
                        type="button"
                        onClick={() => onSelectGame(gid)}
                        className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-2.5 py-2 text-left text-xs text-white/90 transition-colors hover:border-primary/50 hover:bg-primary/15"
                      >
                        <span className="truncate font-medium">{tr(g.title, language)}</span>
                        <Play className="h-3 w-3 shrink-0 text-primary" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Current #1 leader highlight if available */}
              {topLeader && (
                <div className="flex items-center justify-between gap-2 rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 font-mono text-[11px]">
                  <span className="inline-flex items-center gap-1.5 truncate text-amber-300">
                    <Trophy className="h-3.5 w-3.5 shrink-0" />
                    <strong className="truncate">{topLeader.playerName}</strong>
                  </span>
                  <span className="shrink-0 text-white/80">
                    #1 · {topLeader.gameTitle}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
