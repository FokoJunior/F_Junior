"use client"

import type React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

const EASE = [0.2, 0.8, 0.2, 1] as const

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: "div" | "section" | "li" | "article" | "header"
}

/** Apparition douce au défilement ; neutralisée si l'utilisateur préfère moins d'animations. */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const reduce = useReducedMotion()
  const Comp = motion[as]

  return (
    <Comp
      className={cn(className)}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </Comp>
  )
}

/** Dévoile une image comme un rideau qui s'ouvre, avec un léger dézoom. */
export function RevealImage({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={reduce ? false : { clipPath: "inset(12% 8% 12% 8% round 6px)", opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 6px)", opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      <motion.div
        className="h-full w-full"
        initial={reduce ? false : { scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.4, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/** Fait monter un texte lettre par lettre (titres). */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.035,
  animateOnMount = false,
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  animateOnMount?: boolean
}) {
  const reduce = useReducedMotion()
  if (reduce) return <span className={className}>{text}</span>

  const trigger = animateOnMount
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, margin: "-40px" } }

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {Array.from(text).map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", rotate: 6 },
              show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/** En-tête de section : numéro + libellé, avec un filet qui se trace. */
export function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <div className="relative pt-4">
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px origin-left bg-foreground/80"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-primary">{index}</span>
        <span className="eyebrow !text-foreground">{children}</span>
      </div>
    </div>
  )
}

/** Rend « *mot* » en italique accentué — permet de garder l'emphase dans les traductions. */
export function Emphasis({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={i} className="text-primary">
            {part.slice(1, -1)}
          </em>
        ) : (
          part
        ),
      )}
    </>
  )
}
