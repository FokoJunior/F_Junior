"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface CursorParticlesProps {
  count?: number
  color?: string
  size?: number
  speed?: number
  lifetime?: number
}

export default function CursorParticles({
  count = 15,
  color = "hsl(var(--primary))",
  size = 8,
  speed = 0.5,
  lifetime = 1000,
}: CursorParticlesProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      color: string
      createdAt: number
    }>
  >([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const nextId = useRef(0)
  const frame = useRef(0)
  const lastEmit = useRef(0)

  useEffect(() => {
    setIsMounted(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      // Emit particles at intervals
      const now = Date.now()
      if (now - lastEmit.current > 50) {
        // Emit every 50ms
        lastEmit.current = now

        // Add a new particle
        setParticles((prev) => {
          const newParticle = {
            id: nextId.current++,
            x: e.clientX,
            y: e.clientY,
            size: Math.random() * size + 2,
            color: color,
            createdAt: now,
          }

          return [...prev, newParticle].slice(-count) // Keep only the latest 'count' particles
        })
      }
    }

    const animateParticles = () => {
      const now = Date.now()

      // Remove expired particles and animate existing ones
      setParticles((prev) => prev.filter((p) => now - p.createdAt < lifetime))

      frame.current = requestAnimationFrame(animateParticles)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove)
      frame.current = requestAnimationFrame(animateParticles)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove)
        cancelAnimationFrame(frame.current)
      }
    }
  }, [count, color, size, lifetime])

  // Don't render on server
  if (!isMounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => {
        const age = Date.now() - particle.createdAt
        const opacity = 1 - age / lifetime
        const scale = 1 - age / lifetime

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
            initial={{ scale: 1 }}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: (lifetime / 1000) * speed,
              ease: "easeOut",
            }}
          />
        )
      })}
    </div>
  )
}
