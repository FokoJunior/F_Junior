"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, Gauge, Play, Sparkles, Swords, Users, X } from "lucide-react"

import GameCover from "@/components/games/game-cover"
import { useLanguage } from "@/components/language-provider"
import { gameCategoryLabels, gamesList, type GameCategory, type GameId, type GameMeta } from "@/lib/games"
import { tr } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface DifficultyOption {
  value: string
  labelFr: string
  labelEn: string
  subFr?: string
  subEn?: string
}

export interface UnifiedGameGroup {
  key: string
  primaryId: GameId
  soloId?: GameId
  duoId?: GameId
  categories: GameCategory[]
  difficulties?: DifficultyOption[]
  defaultDifficulty?: string
}

export const UNIFIED_GAME_GROUPS: UnifiedGameGroup[] = [
  {
    key: "chess",
    primaryId: "chess",
    soloId: "chess",
    duoId: "duo-chess",
    categories: ["strategy", "duo"],
    defaultDifficulty: "normal",
    difficulties: [
      { value: "easy", labelFr: "IA Facile", labelEn: "Easy AI", subFr: "Pour débuter", subEn: "Beginner" },
      { value: "normal", labelFr: "IA Normale", labelEn: "Normal AI", subFr: "Équilibrée", subEn: "Balanced" },
      { value: "hard", labelFr: "IA Difficile", labelEn: "Hard AI", subFr: "Minimax avancé", subEn: "Deep minimax" },
      { value: "pvp", labelFr: "2 Joueurs local", labelEn: "2P Local", subFr: "Même écran", subEn: "Same screen" },
    ],
  },
  {
    key: "ludo",
    primaryId: "ludo",
    soloId: "ludo",
    duoId: "duo-ludo",
    categories: ["strategy", "duo"],
    defaultDifficulty: "normal",
    difficulties: [
      { value: "easy", labelFr: "IA Facile", labelEn: "Easy AI", subFr: "Détente", subEn: "Casual" },
      { value: "normal", labelFr: "IA Normale", labelEn: "Normal AI", subFr: "Tactique", subEn: "Tactical" },
      { value: "hard", labelFr: "IA Difficile", labelEn: "Hard AI", subFr: "Stratège", subEn: "Aggressive" },
      { value: "pvp", labelFr: "2 Joueurs local", labelEn: "2P Local", subFr: "Même écran", subEn: "Same screen" },
    ],
  },
  {
    key: "tictactoe",
    primaryId: "tictactoe",
    soloId: "tictactoe",
    duoId: "duo-tictactoe",
    categories: ["strategy", "duo"],
    defaultDifficulty: "impossible",
    difficulties: [
      { value: "normal", labelFr: "IA Normale", labelEn: "Normal AI", subFr: "Prend des risques", subEn: "Playable" },
      { value: "impossible", labelFr: "IA Impossible", labelEn: "Unbeatable AI", subFr: "Zéro erreur", subEn: "Minimax" },
      { value: "pvp", labelFr: "2 Joueurs local", labelEn: "2P Local", subFr: "Même écran", subEn: "Same screen" },
    ],
  },
  {
    key: "reaction",
    primaryId: "reaction",
    soloId: "reaction",
    duoId: "duo-reaction",
    categories: ["speed", "duo"],
  },
  {
    key: "connect4",
    primaryId: "connect4",
    duoId: "connect4",
    categories: ["duo", "strategy"],
  },
  {
    key: "rps",
    primaryId: "rps",
    duoId: "rps",
    categories: ["duo"],
  },
  {
    key: "quiz",
    primaryId: "quiz-solo",
    soloId: "quiz-solo",
    duoId: "quiz",
    categories: ["puzzle", "duo"],
    defaultDifficulty: "all",
    difficulties: [
      { value: "all", labelFr: "Mixte (1 100+)", labelEn: "Mixed (1,100+)", subFr: "Tous niveaux", subEn: "All levels" },
      { value: "1", labelFr: "Facile ★", labelEn: "Easy ★", subFr: "Culture accessible", subEn: "Casual" },
      { value: "2", labelFr: "Moyen ★★", labelEn: "Medium ★★", subFr: "Intermédiaire", subEn: "Balanced" },
      { value: "3", labelFr: "Difficile ★★★", labelEn: "Hard ★★★", subFr: "Expert", subEn: "Expert" },
    ],
  },
  {
    key: "snake",
    primaryId: "snake",
    soloId: "snake",
    categories: ["arcade"],
  },
  {
    key: "2048",
    primaryId: "2048",
    soloId: "2048",
    categories: ["puzzle"],
  },
  {
    key: "puzzle",
    primaryId: "puzzle",
    soloId: "puzzle",
    categories: ["puzzle"],
    defaultDifficulty: "3",
    difficulties: [
      { value: "3", labelFr: "3×3 Facile", labelEn: "3×3 Easy", subFr: "8 tuiles", subEn: "8 tiles" },
      { value: "4", labelFr: "4×4 Normal", labelEn: "4×4 Normal", subFr: "15 tuiles", subEn: "15 tiles" },
    ],
  },
  {
    key: "memory",
    primaryId: "memory",
    soloId: "memory",
    categories: ["puzzle"],
    defaultDifficulty: "8",
    difficulties: [
      { value: "6", labelFr: "4×3 Facile", labelEn: "4×3 Easy", subFr: "6 paires", subEn: "6 pairs" },
      { value: "8", labelFr: "4×4 Normal", labelEn: "4×4 Normal", subFr: "8 paires", subEn: "8 pairs" },
    ],
  },
  {
    key: "breakout",
    primaryId: "breakout",
    soloId: "breakout",
    categories: ["arcade"],
  },
  {
    key: "minesweeper",
    primaryId: "minesweeper",
    soloId: "minesweeper",
    categories: ["strategy"],
  },
  {
    key: "typing",
    primaryId: "typing",
    soloId: "typing",
    categories: ["speed"],
  },
  {
    key: "simon",
    primaryId: "simon",
    soloId: "simon",
    categories: ["speed"],
  },
]

export function findGroupByGameId(id: GameId): UnifiedGameGroup {
  return (
    UNIFIED_GAME_GROUPS.find((g) => g.soloId === id || g.duoId === id || g.primaryId === id) ??
    UNIFIED_GAME_GROUPS[0]
  )
}

export function getGameMeta(id: GameId): GameMeta {
  return gamesList.find((g) => g.id === id) ?? gamesList[0]
}

interface GameLaunchModalProps {
  group: UnifiedGameGroup | null
  initialPlayMode?: "solo" | "duo"
  onClose: () => void
  onLaunch: (gameId: GameId, difficulty?: string) => void
}

export default function GameLaunchModal({
  group,
  initialPlayMode,
  onClose,
  onLaunch,
}: GameLaunchModalProps) {
  const { language } = useLanguage()
  const [playMode, setPlayMode] = useState<"solo" | "duo">("solo")
  const [difficulty, setDifficulty] = useState<string>("")

  useEffect(() => {
    if (!group) return
    const defaultMode: "solo" | "duo" =
      initialPlayMode === "duo" && group.duoId
        ? "duo"
        : group.soloId
          ? "solo"
          : "duo"
    setPlayMode(defaultMode)
    setDifficulty(group.defaultDifficulty ?? group.difficulties?.[0]?.value ?? "")
  }, [group, initialPlayMode])

  useEffect(() => {
    if (!group) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [group, onClose])

  const targetId = group
    ? playMode === "duo" && group.duoId
      ? group.duoId
      : group.soloId ?? group.duoId ?? group.primaryId
    : null
  const meta = targetId ? getGameMeta(targetId) : null
  const hasBothModes = Boolean(group?.soloId && group?.duoId)

  const handleConfirm = () => {
    if (!targetId) return
    onLaunch(targetId, playMode === "solo" ? difficulty || undefined : undefined)
  }

  return (
    <AnimatePresence>
      {group && meta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card shadow-2xl"
          >
            {/* Cover Banner */}
            <div className="relative aspect-[16/8] w-full overflow-hidden border-b border-border bg-muted">
              <GameCover gameId={meta.id} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

              <button
                type="button"
                onClick={onClose}
                aria-label={language === "fr" ? "Fermer" : "Close"}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/75"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-primary/40 bg-primary/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary backdrop-blur-md">
                      {tr(gameCategoryLabels[meta.category], language)}
                    </span>
                    {hasBothModes && (
                      <span className="rounded-full border border-white/20 bg-black/55 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-md">
                        Solo & 1v1
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 font-serif text-3xl leading-tight">{tr(meta.title, language)}</h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-5 p-5 sm:p-6">
              {/* Brief presentation */}
              <div className="space-y-1.5">
                <p className="text-sm leading-relaxed text-muted-foreground">{tr(meta.description, language)}</p>
                <p className="font-mono text-[11px] text-primary">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {tr(meta.controls, language)}
                </p>
              </div>

              {/* Step 1: Choose Solo vs 1v1 Online (when game supports both) */}
              {hasBothModes && (
                <div className="space-y-2">
                  <p className="eyebrow">
                    {language === "fr" ? "1. Choisissez votre mode de jeu" : "1. Choose game mode"}
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPlayMode("solo")}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-lg border p-3.5 text-left transition-all",
                        playMode === "solo"
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                          : "border-border bg-background hover:border-foreground/30",
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Bot className={cn("h-4 w-4", playMode === "solo" ? "text-primary" : "text-muted-foreground")} />
                        {language === "fr" ? "Solo / IA" : "Solo / AI"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language === "fr" ? "Contre l'IA ou 2 joueurs local" : "vs AI or 2P local"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlayMode("duo")}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-lg border p-3.5 text-left transition-all",
                        playMode === "duo"
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                          : "border-border bg-background hover:border-foreground/30",
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Swords className={cn("h-4 w-4", playMode === "duo" ? "text-primary" : "text-muted-foreground")} />
                        {language === "fr" ? "Duo 1v1 en ligne" : "Online 1v1"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language === "fr" ? "Salon privé · lien · spectateurs" : "Private room · link · live"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Choose Difficulty (when Solo is selected and options exist) */}
              {playMode === "solo" && group.difficulties && group.difficulties.length > 0 && (
                <div className="space-y-2">
                  <p className="eyebrow inline-flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5 text-primary" />
                    {hasBothModes
                      ? language === "fr"
                        ? "2. Niveau de difficulté"
                        : "2. Difficulty level"
                      : language === "fr"
                        ? "Choisissez la difficulté"
                        : "Choose difficulty"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.difficulties.map((opt) => {
                      const active = difficulty === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDifficulty(opt.value)}
                          className={cn(
                            "flex flex-col items-start rounded-md border px-3 py-2.5 text-left transition-all",
                            active
                              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/40"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                          )}
                        >
                          <span className="font-mono text-xs font-semibold">
                            {language === "fr" ? opt.labelFr : opt.labelEn}
                          </span>
                          {(opt.subFr || opt.subEn) && (
                            <span className="text-[11px] opacity-75">
                              {language === "fr" ? opt.subFr : opt.subEn}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Info note when Duo 1v1 is selected */}
              {playMode === "duo" && (
                <div className="flex items-start gap-2.5 rounded-md border border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {language === "fr"
                      ? "Vous pourrez choisir le temps de réflexion par tour (4s, 10s, 15s, 30s…), créer un salon privé ou rejoindre un ami avec son code."
                      : "You can set the turn thinking timer (4s, 10s, 15s, 30s…), create a private room, or join a friend by code."}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button type="button" onClick={onClose} className="btn btn-outline h-10 px-4 text-xs">
                  {language === "fr" ? "Annuler" : "Cancel"}
                </button>
                <button type="button" onClick={handleConfirm} className="btn btn-solid h-10 px-6 text-xs">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {playMode === "duo"
                    ? language === "fr"
                      ? "Ouvrir le salon 1v1"
                      : "Open 1v1 Lobby"
                    : language === "fr"
                      ? "Lancer la partie"
                      : "Start game"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
