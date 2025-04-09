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
    <div className="relative w-full h-full">
      <svg viewBox="0 0 500 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Animated background shapes */}
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <motion.stop
              offset="0%"
              animate={{
                stopColor: [
                  `hsl(${primaryHue}, 70%, 50%)`,
                  `hsl(${(primaryHue + 60) % 360}, 70%, 50%)`,
                  `hsl(${primaryHue}, 70%, 50%)`,
                ],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.stop
              offset="100%"
              animate={{
                stopColor: [
                  `hsl(${(primaryHue + 60) % 360}, 70%, 50%)`,
                  `hsl(${primaryHue}, 70%, 50%)`,
                  `hsl(${(primaryHue + 60) % 360}, 70%, 50%)`,
                ],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            />
          </linearGradient>

          <clipPath id="imageClip">
            <path d="M250,30 C370,30 450,150 450,250 C450,350 370,470 250,470 C130,470 50,350 50,250 C50,150 130,30 250,30 Z" />
          </clipPath>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Animated background blob */}
        <motion.path
          d="M250,30 C370,30 450,150 450,250 C450,350 370,470 250,470 C130,470 50,350 50,250 C50,150 130,30 250,30 Z"
          fill="url(#grad1)"
          initial={{ opacity: 0.7 }}
          animate={{
            d: [
              "M250,30 C370,30 450,150 450,250 C450,350 370,470 250,470 C130,470 50,350 50,250 C50,150 130,30 250,30 Z",
              "M250,50 C350,50 430,130 430,250 C430,370 350,450 250,450 C150,450 70,370 70,250 C70,130 150,50 250,50 Z",
              "M250,30 C370,30 450,150 450,250 C450,350 370,470 250,470 C130,470 50,350 50,250 C50,150 130,30 250,30 Z",
            ],
            opacity: [0.7, 0.8, 0.7],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Image with clip path */}
        <image
          href={imageUrl}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#imageClip)"
        />

        {/* Decorative elements */}
        <g filter="url(#glow)">
          {/* Animated circles */}
          {[...Array(5)].map((_, i) => (
            <motion.circle
              key={i}
              cx={250 + Math.cos((i * Math.PI) / 2.5) * 220}
              cy={250 + Math.sin((i * Math.PI) / 2.5) * 220}
              r={5 + i * 2}
              fill={`hsl(${(primaryHue + i * 30) % 360}, 70%, 60%)`}
              initial={{ opacity: 0.7 }}
              animate={{
                opacity: [0.7, 1, 0.7],
                r: [5 + i * 2, 8 + i * 2, 5 + i * 2],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Animated lines connecting to center */}
          {[...Array(5)].map((_, i) => (
            <motion.line
              key={i}
              x1={250 + Math.cos((i * Math.PI) / 2.5) * 220}
              y1={250 + Math.sin((i * Math.PI) / 2.5) * 220}
              x2={250}
              y2={250}
              stroke={`hsl(${(primaryHue + i * 30) % 360}, 70%, 60%)`}
              strokeWidth="1"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                strokeWidth: ["1px", "2px", "1px"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </g>

        {/* Animated border */}
        <motion.path
          d="M250,30 C370,30 450,150 450,250 C450,350 370,470 250,470 C130,470 50,350 50,250 C50,150 130,30 250,30 Z"
          fill="none"
          stroke={`hsl(${primaryHue}, 70%, 60%)`}
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: 1,
            strokeDasharray: ["0 1", "1 0"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
          }}
        />

        {/* Pulsing dots along the border */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * Math.PI) / 4
          const x = 250 + Math.cos(angle) * 220
          const y = 250 + Math.sin(angle) * 220

          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill={`hsl(${(primaryHue + i * 45) % 360}, 70%, 60%)`}
              initial={{ scale: 0 }}
              animate={{
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.25,
                ease: "easeInOut",
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
