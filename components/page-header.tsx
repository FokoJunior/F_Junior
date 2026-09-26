"use client"

import type React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

/** En-tête commun des pages secondaires : fil d'Ariane, grand titre serif, introduction. */
export default function PageHeader({
  eyebrow,
  title,
  intro,
  back,
  children,
}: {
  eyebrow: React.ReactNode
  title: React.ReactNode
  intro?: React.ReactNode
  back?: { href: string; label: string }
  children?: React.ReactNode
}) {
  const reduce = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] as const },
  })

  return (
    <header className="container pb-12 pt-28 md:pb-16 md:pt-36">
      <motion.div {...rise(0)} className="flex items-center justify-between gap-4 border-b border-border pb-5">
        {back ? (
          <Link href={back.href} className="eyebrow group inline-flex items-center gap-2 hover:!text-foreground">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            {back.label}
          </Link>
        ) : (
          <span />
        )}
        <span className="eyebrow">{eyebrow}</span>
      </motion.div>
      <motion.h1
        {...rise(0.1)}
        className="mt-10 font-serif text-[clamp(3rem,10vw,9rem)] leading-[0.9] tracking-[-0.02em]"
      >
        {title}
      </motion.h1>
      {intro && (
        <motion.p {...rise(0.2)} className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {intro}
        </motion.p>
      )}
      {children && <motion.div {...rise(0.3)}>{children}</motion.div>}
    </header>
  )
}
