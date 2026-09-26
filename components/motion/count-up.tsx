"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "framer-motion"

/** Compte de 0 jusqu'à la valeur quand le nombre entre dans l'écran ; garde le suffixe (« 20+ »). */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduce = useReducedMotion()
  const match = value.match(/^(\d+)(.*)$/)
  const [display, setDisplay] = useState(match && !reduce ? `0${match[2]}` : value)

  useEffect(() => {
    if (!match || reduce || !inView) {
      setDisplay(value)
      return
    }
    const target = Number(match[1])
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => setDisplay(`${Math.round(v)}${match[2]}`),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
