"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

interface ParallaxEffectProps {
  children: React.ReactNode
  intensity?: number
}

export default function ParallaxEffect({ children, intensity = 0.1 }: ParallaxEffectProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 500 * intensity])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 10 * intensity])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1 + 0.2 * intensity, 1])

  const springY = useSpring(y, { stiffness: 100, damping: 30 })
  const springRotate = useSpring(rotate, { stiffness: 100, damping: 30 })
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 })

  return (
    <div ref={ref} className="relative">
      <motion.div
        style={{
          y: springY,
          rotate: springRotate,
          scale: springScale,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
