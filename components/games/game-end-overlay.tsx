"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Crown, Flag, Handshake, Power, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export type GameEndOutcome = "win" | "lose" | "draw" | "forfeit" | "ended" | "gameover"

interface GameEndBannerProps {
  show: boolean
  outcome: GameEndOutcome
  title: string
  subtitle?: string
  stat?: string
  isNewRecord?: boolean
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

// Deterministic confetti particles for crisp, zero-hydration-mismatch celebrations
const CONFETTI_PIECES = Array.from({ length: 36 }, (_, i) => {
  const colors = ["#3b82f6", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#eab308"]
  const left = ((i * 29 + 7) % 96) + 2
  const drift = ((i % 7) - 3) * 32
  const delay = (i % 12) * 0.06
  const duration = 1.9 + (i % 5) * 0.28
  const rotate = ((i % 2 === 0 ? 1 : -1) * (240 + (i % 4) * 90))
  const width = i % 3 === 0 ? 10 : 7
  const height = i % 3 === 0 ? 10 : 14
  const rounded = i % 4 === 0
  return {
    id: i,
    color: colors[i % colors.length],
    left: `${left}%`,
    drift,
    delay,
    duration,
    rotate,
    width,
    height,
    rounded,
  }
})

const CARD_BURST = [
  { x: -140, y: -75, color: "#3b82f6" },
  { x: -95, y: -115, color: "#f59e0b" },
  { x: -45, y: -130, color: "#10b981" },
  { x: 10, y: -135, color: "#ec4899" },
  { x: 65, y: -120, color: "#8b5cf6" },
  { x: 120, y: -90, color: "#06b6d4" },
  { x: 145, y: -35, color: "#f97316" },
  { x: -135, y: 25, color: "#eab308" },
  { x: 130, y: 40, color: "#60a5fa" },
  { x: -70, y: 65, color: "#34d399" },
  { x: 75, y: 65, color: "#fbbf24" },
]

export default function GameEndBanner({
  show,
  outcome,
  title,
  subtitle,
  stat,
  isNewRecord,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: GameEndBannerProps) {
  const [showShower, setShowShower] = useState(false)

  const celebrate = outcome === "win" || Boolean(isNewRecord)

  useEffect(() => {
    if (!show || !celebrate) {
      setShowShower(false)
      return
    }
    setShowShower(true)
    const id = window.setTimeout(() => setShowShower(false), 3200)
    return () => window.clearTimeout(id)
  }, [show, celebrate])

  const borderBg =
    outcome === "win"
      ? "border-primary/50 bg-gradient-to-b from-primary/15 via-primary/10 to-background"
      : outcome === "lose" || outcome === "gameover"
        ? "border-destructive/40 bg-gradient-to-b from-destructive/12 via-destructive/5 to-background"
        : outcome === "forfeit"
          ? "border-amber-500/45 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-background"
          : outcome === "draw"
            ? "border-blue-500/40 bg-gradient-to-b from-blue-500/10 to-background"
            : "border-border bg-card"

  const iconBg =
    outcome === "win"
      ? "bg-primary/20 text-primary ring-4 ring-primary/15"
      : outcome === "lose" || outcome === "gameover"
        ? "bg-destructive/15 text-destructive ring-4 ring-destructive/10"
        : outcome === "forfeit"
          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-4 ring-amber-500/10"
          : "bg-muted text-foreground ring-4 ring-border/50"

  const Icon =
    outcome === "win"
      ? Trophy
      : outcome === "forfeit"
        ? Flag
        : outcome === "ended"
          ? Power
          : outcome === "draw"
            ? Handshake
            : XCircle

  return (
    <>
      {/* Full-screen non-blocking confetti shower on victory or new record */}
      <AnimatePresence>
        {showShower && (
          <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {CONFETTI_PIECES.map((p) => (
              <motion.span
                key={p.id}
                initial={{ y: -24, x: 0, opacity: 1, rotate: 0, scale: 0.7 }}
                animate={{
                  y: "105vh",
                  x: p.drift,
                  opacity: [1, 1, 0.9, 0],
                  rotate: p.rotate,
                  scale: [0.8, 1.15, 0.95],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
                style={{
                  position: "absolute",
                  left: p.left,
                  top: 0,
                  width: p.width,
                  height: p.height,
                  backgroundColor: p.color,
                  borderRadius: p.rounded ? "9999px" : "2px",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Animated end-of-game card */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={
              outcome === "lose" || outcome === "gameover"
                ? { opacity: 0, scale: 0.92, x: -6 }
                : { opacity: 0, scale: 0.88, y: 14 }
            }
            animate={
              outcome === "lose" || outcome === "gameover"
                ? { opacity: 1, scale: 1, x: [0, -6, 6, -4, 4, 0] }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={
              outcome === "lose" || outcome === "gameover"
                ? { duration: 0.48, ease: "easeOut" }
                : { type: "spring", stiffness: 280, damping: 20 }
            }
            className={cn(
              "relative flex w-full flex-col items-center gap-3 overflow-hidden rounded-md border p-5 text-center shadow-sm sm:p-6",
              borderBg,
              className,
            )}
          >
            {/* Card-local radial burst on victory / new record */}
            {celebrate && (
              <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {CARD_BURST.map((p, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ x: p.x, y: p.y, scale: [0, 1.4, 0.7], opacity: [1, 1, 0] }}
                    transition={{ duration: 1.15, delay: idx * 0.035, ease: "easeOut" }}
                    className="absolute h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            )}

            {/* Animated icon badge */}
            <motion.div
              initial={{ scale: 0.4, rotate: -18 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 16, delay: 0.05 }}
              className={cn("relative grid h-13 w-13 place-items-center rounded-full", iconBg)}
            >
              {celebrate && (
                <motion.span
                  aria-hidden
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1.75, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: 2, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-2 border-primary"
                />
              )}
              <Icon className="h-6 w-6" />
            </motion.div>

            {/* Optional New Record badge */}
            {isNewRecord && (
              <motion.span
                initial={{ opacity: 0, y: -6, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.14, type: "spring", stiffness: 320, damping: 18 }}
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"
              >
                <Crown className="h-3 w-3" />
                Nouveau record !
              </motion.span>
            )}

            {/* Title & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.25 }}
              className="space-y-1"
            >
              <p className="font-serif text-2xl sm:text-3xl">{title}</p>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              {stat && (
                <p className="inline-flex items-center gap-1.5 pt-1 font-mono text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {stat}
                </p>
              )}
            </motion.div>

            {/* Action buttons */}
            {(primaryActionLabel || secondaryActionLabel) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.25 }}
                className="mt-1 flex flex-wrap items-center justify-center gap-2"
              >
                {primaryActionLabel && onPrimaryAction && (
                  <button type="button" onClick={onPrimaryAction} className="btn btn-solid h-9 px-5 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" />
                    {primaryActionLabel}
                  </button>
                )}
                {secondaryActionLabel && onSecondaryAction && (
                  <button type="button" onClick={onSecondaryAction} className="btn btn-outline h-9 px-4 text-xs">
                    {secondaryActionLabel}
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
