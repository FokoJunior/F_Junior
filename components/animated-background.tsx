"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useTheme } from "next-themes"

interface Molecule {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  blinkSpeed: number
  blinkOffset: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const moleculesRef = useRef<Molecule[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animationRef = useRef<number>(0)
  const hueRef = useRef<number>(0)
  const { theme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  // Configuration simple et élégante
  const moleculeCount = 80
  const connectionDistance = 180
  const mouseRadius = 250

  const initMolecules = useCallback((width: number, height: number) => {
    moleculesRef.current = []
    for (let i = 0; i < moleculeCount; i++) {
      moleculesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1.5,
        blinkSpeed: 0.01 + Math.random() * 0.02,
        blinkOffset: Math.random() * Math.PI * 2
      })
    }
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const isDark = theme === "dark"
    const mouse = mouseRef.current

    // Cycle de couleur global
    hueRef.current = (hueRef.current + 0.5) % 360
    const currentHue = hueRef.current

    // Couleurs de base
    const lineColor = isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(100, 116, 139, 0.08)"

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    const molecules = moleculesRef.current

    // Update et draw molecules
    molecules.forEach((mol, i) => {
      // Mouvement
      mol.x += mol.vx
      mol.y += mol.vy

      // Rebond sur les bords
      if (mol.x < 0 || mol.x > width) mol.vx *= -1
      if (mol.y < 0 || mol.y > height) mol.vy *= -1

      // Légère attraction vers la souris
      const dx = mouse.x - mol.x
      const dy = mouse.y - mol.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < mouseRadius && dist > 0) {
        mol.vx += (dx / dist) * 0.02
        mol.vy += (dy / dist) * 0.02

        // Limite vitesse
        const speed = Math.sqrt(mol.vx * mol.vx + mol.vy * mol.vy)
        if (speed > 1.5) {
          mol.vx = (mol.vx / speed) * 1.5
          mol.vy = (mol.vy / speed) * 1.5
        }
      }

      // Friction
      mol.vx *= 0.99
      mol.vy *= 0.99

      // Calcul de l'effet de clignotement (pulsation)
      const blink = (Math.sin(Date.now() * mol.blinkSpeed + mol.blinkOffset) + 1) / 2

      // La couleur du point est basée sur le cycle de couleur du site
      const opacity = isDark ? 0.3 + blink * 0.6 : 0.2 + blink * 0.6
      const color = `hsla(${currentHue}, 70%, ${isDark ? 60 : 50}%, ${opacity})`

      // Dessiner le point (molécule)
      ctx.beginPath()
      ctx.arc(mol.x, mol.y, mol.radius * (0.8 + blink * 0.4), 0, Math.PI * 2)
      ctx.fillStyle = color

      // Ajouter un petit glow
      if (blink > 0.7) {
        ctx.shadowBlur = 10 * blink
        ctx.shadowColor = `hsla(${currentHue}, 70%, 60%, ${blink * 0.5})`
      } else {
        ctx.shadowBlur = 0
      }

      ctx.fill()
      ctx.shadowBlur = 0 // Reset shadow for lines

      // Connexions entre molécules
      for (let j = i + 1; j < molecules.length; j++) {
        const mol2 = molecules[j]
        const dx2 = mol.x - mol2.x
        const dy2 = mol.y - mol2.y
        const distance = Math.sqrt(dx2 * dx2 + dy2 * dy2)

        if (distance < connectionDistance) {
          const lineOpacity = (1 - distance / connectionDistance) * 0.3
          ctx.beginPath()
          ctx.moveTo(mol.x, mol.y)
          ctx.lineTo(mol2.x, mol2.y)
          ctx.strokeStyle = isDark
            ? `hsla(${currentHue}, 30%, 70%, ${lineOpacity})`
            : `hsla(${currentHue}, 30%, 40%, ${lineOpacity})`
          ctx.lineWidth = 0.5 + lineOpacity * 1
          ctx.stroke()
        }
      }

      // Connexion avec la souris
      if (dist < mouseRadius) {
        const mouseOpacity = (1 - dist / mouseRadius) * 0.3
        ctx.beginPath()
        ctx.moveTo(mol.x, mol.y)
        ctx.lineTo(mouse.x, mouse.y)
        ctx.strokeStyle = `hsla(${currentHue}, 70%, 60%, ${mouseOpacity})`
        ctx.lineWidth = mouseOpacity * 2
        ctx.stroke()
      }
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [theme])

  useEffect(() => {
    if (typeof window === "undefined") return
    setIsMounted(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initMolecules(canvas.width, canvas.height)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [initMolecules, animate])

  if (!isMounted) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
