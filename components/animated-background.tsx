"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const mouseRef = useRef({ x: 0, y: 0, isActive: false })
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const { theme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  // Configuration
  const particleCount = 60 // Nombre de noeuds
  const connectionDistance = 150 // Distance de connexion neuronale
  const mouseRange = 250 // Rayon d'influence de la souris (IA qui "sent" l'utilisateur)
  const particleSpeed = 0.5 // Vitesse de base

  // Couleurs dynamiques selon le thème
  const getColors = () => {
    const isDark = theme === "dark"
    return {
      particle: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.3)",
      line: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
      background: isDark ? "#020817" : "#ffffff", // Fond tech sombre ou blanc pur
    }
  }

  const handleResize = () => {
    if (canvasRef.current && typeof window !== "undefined") {
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
      initParticles(window.innerWidth, window.innerHeight)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY, isActive: true }
  }

  const handleMouseLeave = () => {
    mouseRef.current.isActive = false
  }

  const initParticles = (width: number, height: number) => {
    particlesRef.current = []
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * particleSpeed,
        vy: (Math.random() - 0.5) * particleSpeed,
        size: Math.random() * 2 + 1,
        color: getColors().particle
      })
    }
  }

  const animate = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Nettoyage avec trainée légère pour effet fluide
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    const colors = getColors()
    const particles = particlesRef.current

    particles.forEach((p, i) => {
      // Mouvement de base
      p.x += p.vx
      p.y += p.vy

      // Rebond bords
      if (p.x < 0 || p.x > dimensions.width) p.vx *= -1
      if (p.y < 0 || p.y > dimensions.height) p.vy *= -1

      // Attraction/Répulsion Souris (Effet IA Magnetique)
      if (mouseRef.current.isActive) {
        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < mouseRange) {
          // Attraction douce vers la souris
          const forceDirectionX = dx / distance
          const forceDirectionY = dy / distance
          const force = (mouseRange - distance) / mouseRange

          // Coefficient d'attraction (0.02 = subtil mais visible)
          p.vx += forceDirectionX * force * 0.05
          p.vy += forceDirectionY * force * 0.05

          // Limite de vitesse pour éviter l'explosion
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
          if (speed > 2) {
            p.vx = (p.vx / speed) * 2
            p.vy = (p.vy / speed) * 2
          }
        }
      }

      // Dessin Particule (Noeud)
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = colors.particle
      ctx.fill()

      // Connexions (Synapses)
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]
        const dx = p.x - p2.x
        const dy = p.y - p2.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          ctx.beginPath()
          ctx.strokeStyle = colors.line
          ctx.lineWidth = 1 - distance / connectionDistance
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }

      // Connexion à la souris (Interface Humain-Machine)
      if (mouseRef.current.isActive) {
        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance * 1.5) {
          ctx.beginPath()
          ctx.strokeStyle = colors.line
          // Plus visible quand proche
          ctx.globalAlpha = (1 - distance / (connectionDistance * 1.5)) * 0.8
          ctx.lineWidth = 1
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
    })

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    setIsMounted(true)
    handleResize()

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [theme, dimensions.width]) // Retrigger si le thème ou la taille change

  if (!isMounted) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none -z-50 opacity-100 transition-opacity duration-1000"
    />
  )
}

