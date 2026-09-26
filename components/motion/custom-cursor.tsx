"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

import { cn } from "@/lib/utils"

/**
 * Curseur personnalisé : un point précis + un anneau qui suit en douceur.
 * L'anneau grandit sur les éléments cliquables et affiche un libellé sur ceux
 * qui portent `data-cursor="Voir"`. Désactivé sur écran tactile et si l'utilisateur
 * préfère réduire les animations.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [down, setDown] = useState(false)
  const [visible, setVisible] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 350, damping: 32, mass: 0.6 })
  const ringY = useSpring(y, { stiffness: 350, damping: 32, mass: 0.6 })

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setEnabled(fine.matches && !reduce.matches)
    update()
    fine.addEventListener("change", update)
    reduce.addEventListener("change", update)
    return () => {
      fine.removeEventListener("change", update)
      reduce.removeEventListener("change", update)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add("custom-cursor")

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "a, button, [role='button'], input, textarea, select, label, [data-cursor]",
      )
      setHover(!!target)
      setLabel(target?.dataset.cursor ?? null)
    }
    const onDown = () => setDown(true)
    const onUp = () => setDown(false)
    const onLeave = () => setVisible(false)

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerdown", onDown)
    window.addEventListener("pointerup", onUp)
    document.addEventListener("pointerleave", onLeave)
    return () => {
      document.documentElement.classList.remove("custom-cursor")
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const size = label ? 84 : hover ? 48 : 30

  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-[200] transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")}>
      {/* Anneau */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="absolute left-0 top-0"
      >
        <motion.div
          animate={{ width: size, height: size, scale: down ? 0.85 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className={cn(
            "-translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-300 flex items-center justify-center",
            label
              ? "border-primary bg-primary text-primary-foreground"
              : hover
                ? "border-primary/70 bg-primary/10"
                : "border-foreground/40",
          )}
        >
          {label && (
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em]">{label}</span>
          )}
        </motion.div>
      </motion.div>
      {/* Point */}
      <motion.div style={{ x, y }} className="absolute left-0 top-0">
        <div
          className={cn(
            "h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-transform duration-200",
            (hover || label) && "scale-0",
          )}
        />
      </motion.div>
    </div>
  )
}
