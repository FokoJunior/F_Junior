"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface LudoDice3DProps {
  value: number | null
  rolling: boolean
  canRoll: boolean
  onRoll: () => void
  accent?: "host" | "guest"
  rollKey?: string | null
}

// Target cube angles so face 1..6 faces the player with a subtle realistic 3D perspective tilt
const FACE_ANGLES: Record<number, { rx: number; ry: number }> = {
  1: { rx: -12, ry: 14 },
  2: { rx: -102, ry: 14 },
  3: { rx: -12, ry: -76 },
  4: { rx: -12, ry: 104 },
  5: { rx: 78, ry: 14 },
  6: { rx: -12, ry: 194 },
}

// 3x3 pip grid positions (indices 0..8) for each face 1..6
const PIP_LAYOUTS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function DiceFace({
  face,
  transform,
}: {
  face: number
  transform: string
}) {
  const pips = PIP_LAYOUTS[face] || []
  const isOne = face === 1
  const isSix = face === 6

  return (
    <div
      style={{
        transform,
        backfaceVisibility: "hidden",
      }}
      className={cn(
        "absolute inset-0 grid grid-cols-3 grid-rows-3 place-items-center rounded-[10px] border border-slate-300/90 p-2",
        "bg-gradient-to-br from-white via-slate-50 to-slate-200",
        "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_6px_rgba(15,23,42,0.18)]",
      )}
    >
      {Array.from({ length: 9 }, (_, idx) => {
        const hasPip = pips.includes(idx)
        return (
          <span
            key={idx}
            className={cn(
              "rounded-full transition-opacity",
              hasPip ? "opacity-100" : "opacity-0",
              isOne
                ? "h-3 w-3 bg-gradient-to-br from-rose-500 to-red-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]"
                : isSix
                  ? "h-2 w-2 bg-gradient-to-br from-blue-600 to-indigo-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]"
                  : "h-2 w-2 bg-gradient-to-br from-slate-700 to-slate-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]",
            )}
          />
        )
      })}
    </div>
  )
}

export default function LudoDice3D({
  value,
  rolling,
  canRoll,
  onRoll,
  accent = "host",
  rollKey,
}: LudoDice3DProps) {
  const displayFace = value && value >= 1 && value <= 6 ? value : 1
  const [rot, setRot] = useState<{ rx: number; ry: number }>(() => FACE_ANGLES[displayFace])
  const [jumping, setJumping] = useState(false)
  const spinCountRef = useRef(0)
  const prevRollingRef = useRef(false)
  const prevValueRef = useRef<number | null>(value)
  const prevRollKeyRef = useRef<string | null | undefined>(rollKey)

  useEffect(() => {
    const startedRolling = rolling && !prevRollingRef.current
    const valueChanged =
      value !== null &&
      (value !== prevValueRef.current || (rollKey !== undefined && rollKey !== prevRollKeyRef.current))

    if (startedRolling) {
      // Launch mid-air spin immediately
      spinCountRef.current += 1
      const mult = spinCountRef.current
      setJumping(true)
      setRot({
        rx: mult * 360 + 210,
        ry: mult * 360 + 250,
      })
    } else if ((!rolling && prevRollingRef.current) || (!rolling && valueChanged)) {
      // Settle onto the exact rolled 3D face
      spinCountRef.current += 1
      const mult = spinCountRef.current
      const target = FACE_ANGLES[displayFace]
      setJumping(true)
      setRot({
        rx: mult * 360 + target.rx,
        ry: mult * 360 + target.ry,
      })
      const id = window.setTimeout(() => setJumping(false), 520)
      prevRollingRef.current = rolling
      prevValueRef.current = value
      prevRollKeyRef.current = rollKey
      return () => window.clearTimeout(id)
    }

    prevRollingRef.current = rolling
    prevValueRef.current = value
    prevRollKeyRef.current = rollKey
  }, [displayFace, rollKey, rolling, value])

  const half = 26 // 52px / 2

  return (
    <button
      type="button"
      onClick={() => {
        if (canRoll && !rolling) onRoll()
      }}
      disabled={!canRoll || rolling}
      aria-label={value ? `Dé 3D : ${value}` : "Lancer le dé 3D"}
      title={canRoll ? "Cliquer pour lancer le dé 3D" : undefined}
      className={cn(
        "group relative flex h-16 w-16 flex-col items-center justify-center rounded-xl transition-transform focus:outline-none",
        canRoll && !rolling ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default",
      )}
    >
      {/* Pulsing ready halo when it's your turn to roll */}
      {canRoll && !rolling && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-xl border-2 animate-pulse",
            accent === "host" ? "border-primary/60 bg-primary/10" : "border-amber-500/60 bg-amber-500/10",
          )}
        />
      )}

      {/* Golden celebration ring when a 6 lands */}
      {!rolling && value === 6 && (
        <motion.span
          key={`six-${spinCountRef.current}`}
          aria-hidden
          initial={{ scale: 0.75, opacity: 0.9 }}
          animate={{ scale: 1.45, opacity: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="pointer-events-none absolute inset-1 rounded-xl border-2 border-amber-400"
        />
      )}

      {/* 3D Perspective Stage */}
      <div
        className="relative flex h-[52px] w-[52px] items-center justify-center"
        style={{ perspective: "420px" }}
      >
        <motion.div
          animate={{
            y: rolling ? -12 : jumping ? [0, -14, 2, 0] : 0,
            scale: rolling ? 1.08 : jumping ? [1, 1.1, 0.96, 1] : 1,
          }}
          transition={{
            duration: rolling ? 0.35 : 0.55,
            ease: "easeOut",
          }}
          className="relative h-[52px] w-[52px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            animate={{
              rotateX: rot.rx,
              rotateY: rot.ry,
            }}
            transition={
              rolling
                ? { duration: 0.55, ease: "linear" }
                : { type: "spring", stiffness: 120, damping: 14, mass: 0.9 }
            }
            className="relative h-[52px] w-[52px]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <DiceFace face={1} transform={`translateZ(${half}px)`} />
            <DiceFace face={6} transform={`rotateY(180deg) translateZ(${half}px)`} />
            <DiceFace face={3} transform={`rotateY(90deg) translateZ(${half}px)`} />
            <DiceFace face={4} transform={`rotateY(-90deg) translateZ(${half}px)`} />
            <DiceFace face={2} transform={`rotateX(90deg) translateZ(${half}px)`} />
            <DiceFace face={5} transform={`rotateX(-90deg) translateZ(${half}px)`} />
          </motion.div>
        </motion.div>
      </div>

      {/* Dynamic elliptical ground shadow */}
      <motion.span
        aria-hidden
        animate={{
          scaleX: rolling || jumping ? 0.65 : 1,
          opacity: rolling || jumping ? 0.28 : 0.55,
        }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none mt-1 h-1.5 w-9 rounded-full bg-black/70 blur-[2px]"
      />
    </button>
  )
}
