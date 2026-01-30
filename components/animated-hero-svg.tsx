"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedHeroSvgProps {
  imageUrl: string
  primaryHue?: number
}

export default function AnimatedHeroSvg({ imageUrl, primaryHue = 0 }: AnimatedHeroSvgProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <svg viewBox="0 0 500 500" className="w-full h-full max-w-[500px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <motion.stop
              offset="0%"
              animate={{
                stopColor: [
                  `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                  `hsl(${(primaryHue + 40) % 360}, 70%, 50%, 0.2)`,
                  `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                ],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.stop
              offset="100%"
              animate={{
                stopColor: [
                  `hsl(${(primaryHue + 40) % 360}, 70%, 50%, 0.05)`,
                  `hsl(${primaryHue}, 70%, 50%, 0.05)`,
                  `hsl(${(primaryHue + 40) % 360}, 70%, 50%, 0.05)`,
                ],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </linearGradient>

          <clipPath id="heroClip">
            <rect x="50" y="50" width="400" height="400" rx="30" />
          </clipPath>

          <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer pulsing ring */}
        <motion.rect
          x="30" y="30" width="440" height="440" rx="40"
          fill="none"
          stroke={`hsl(${primaryHue}, 70%, 50%, 0.2)`}
          strokeWidth="2"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main background shape */}
        <rect
          x="50" y="50" width="400" height="400" rx="30"
          fill="url(#heroGrad)"
          stroke={`hsl(${primaryHue}, 70%, 50%, 0.1)`}
          strokeWidth="1"
        />

        {/* The Image */}
        <image
          href={imageUrl}
          x="50" y="50" width="400" height="400"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#heroClip)"
          style={{ filter: "sepia(0.2) contrast(1.1)" }}
        />

        {/* Animated accent border */}
        <motion.rect
          x="50" y="50" width="400" height="400" rx="30"
          fill="none"
          stroke={`hsl(${primaryHue}, 70%, 60%)`}
          strokeWidth="4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Floating decorative elements (dots) */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12
          const radius = 240
          return (
            <motion.circle
              key={i}
              cx={250 + Math.cos(angle) * radius}
              cy={250 + Math.sin(angle) * radius}
              r={2 + (i % 3)}
              fill={`hsl(${primaryHue}, 70%, 50%, 0.4)`}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + (i % 4),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
