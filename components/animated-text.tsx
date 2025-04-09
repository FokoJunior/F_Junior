"use client"

import { useEffect, useState } from "react"
import { motion, useAnimationControls } from "framer-motion"

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  type?: "wave" | "bounce" | "fade" | "typewriter"
}

export default function AnimatedText({
  text,
  className = "",
  delay = 0.1,
  duration = 0.05,
  type = "wave",
}: AnimatedTextProps) {
  const controls = useAnimationControls()
  const [characters, setCharacters] = useState<string[]>([])

  useEffect(() => {
    setCharacters(text.split(""))
  }, [text])

  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * delay, duration },
    }))
  }, [controls, delay, duration])

  const getAnimation = (type: string) => {
    switch (type) {
      case "wave":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: i * delay,
              duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse" as const,
              repeatDelay: 5,
            },
          }),
        }
      case "bounce":
        return {
          hidden: { opacity: 0, scale: 0 },
          visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            transition: {
              delay: i * delay,
              duration,
              type: "spring",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse" as const,
              repeatDelay: 5,
            },
          }),
        }
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: (i: number) => ({
            opacity: 1,
            transition: {
              delay: i * delay,
              duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse" as const,
              repeatDelay: 5,
            },
          }),
        }
      case "typewriter":
        return {
          hidden: { opacity: 0, display: "none" },
          visible: (i: number) => ({
            opacity: 1,
            display: "inline-block",
            transition: {
              delay: i * delay,
              duration,
            },
          }),
        }
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * delay, duration },
          }),
        }
    }
  }

  const animation = getAnimation(type)

  return (
    <span className={className}>
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={animation}
          style={{ display: "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}
