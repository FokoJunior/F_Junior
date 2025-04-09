"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedOrbProps {
  primaryHue?: number
}

export default function AnimatedOrb({ primaryHue = 0 }: AnimatedOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    setIsMounted(true)

    const handleResize = () => {
      if (canvasRef.current && typeof window !== "undefined") {
        const canvas = canvasRef.current
        const container = canvas.parentElement
        if (container) {
          const { width, height } = container.getBoundingClientRect()
          canvas.width = width
          canvas.height = height
          setDimensions({ width, height })
        }
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      // Initial size
      setTimeout(handleResize, 100)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let time = 0
    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const radius = Math.min(dimensions.width, dimensions.height) * 0.3

    const drawOrb = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      // Draw the main orb
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, `hsla(${primaryHue}, 70%, 60%, 0.8)`)
      gradient.addColorStop(0.5, `hsla(${(primaryHue + 30) % 360}, 70%, 50%, 0.6)`)
      gradient.addColorStop(1, `hsla(${(primaryHue + 60) % 360}, 70%, 40%, 0)`)

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw orbital rings
      for (let i = 0; i < 3; i++) {
        const ringRadius = radius * (0.6 + i * 0.2)
        const ringWidth = 1 + i * 0.5
        const speed = 0.0005 * (1 + i * 0.5)
        const offset = (i * Math.PI) / 3

        ctx.beginPath()
        ctx.ellipse(centerX, centerY, ringRadius, ringRadius * 0.4, time * speed + offset, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${(primaryHue + i * 40) % 360}, 70%, 60%, 0.4)`
        ctx.lineWidth = ringWidth
        ctx.stroke()
      }

      // Draw particles on the rings
      for (let i = 0; i < 3; i++) {
        const ringRadius = radius * (0.6 + i * 0.2)
        const speed = 0.0005 * (1 + i * 0.5)
        const offset = (i * Math.PI) / 3
        const particleCount = 5 + i * 3

        for (let j = 0; j < particleCount; j++) {
          const angle = (time * speed + offset + j * ((Math.PI * 2) / particleCount)) % (Math.PI * 2)
          const x = centerX + Math.cos(angle) * ringRadius
          const y = centerY + Math.sin(angle) * ringRadius * 0.4

          const particleRadius = 2 + Math.sin(time * 0.01 + j) * 1

          const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, particleRadius * 2)
          particleGradient.addColorStop(0, `hsla(${(primaryHue + i * 40 + j * 20) % 360}, 80%, 70%, 0.8)`)
          particleGradient.addColorStop(1, `hsla(${(primaryHue + i * 40 + j * 20) % 360}, 80%, 70%, 0)`)

          ctx.beginPath()
          ctx.arc(x, y, particleRadius * 2, 0, Math.PI * 2)
          ctx.fillStyle = particleGradient
          ctx.fill()
        }
      }

      // Draw glowing center
      const centerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.3)
      centerGlow.addColorStop(0, `hsla(${primaryHue}, 80%, 80%, 0.8)`)
      centerGlow.addColorStop(0.5, `hsla(${primaryHue}, 70%, 60%, 0.4)`)
      centerGlow.addColorStop(1, `hsla(${primaryHue}, 70%, 50%, 0)`)

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = centerGlow
      ctx.fill()

      // Draw pulsing waves
      for (let i = 0; i < 3; i++) {
        const waveRadius = radius * 0.3 + (Math.sin(time * 0.002 + (i * Math.PI) / 3) * 0.5 + 0.5) * radius * 0.7
        const opacity = 0.3 - ((waveRadius - radius * 0.3) / (radius * 0.7)) * 0.3

        ctx.beginPath()
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${primaryHue}, 70%, 60%, ${opacity})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      time++
      animationRef.current = requestAnimationFrame(drawOrb)
    }

    drawOrb()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [dimensions, primaryHue])

  if (!isMounted) return null

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
        <div className="bg-background/70 dark:bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="text-lg font-semibold mb-2" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}>
            Présence Mondiale
          </h3>
          <p className="text-sm text-muted-foreground">
            Découvrez notre réseau mondial de connexions et de collaborations à travers cette représentation
            interactive.
          </p>
        </div>
      </div>
    </div>
  )
}
