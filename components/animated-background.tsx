"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useMobileDetector } from "./mobile-detector"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  hue: number
  connections: number[]
  opacity: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hueRotation, setHueRotation] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const [isMounted, setIsMounted] = useState(false)
  const isMobile = useMobileDetector()

  // Ajuster les paramètres en fonction de l'appareil
  const maxConnections = isMobile ? 2 : 3 // Moins de connexions
  const connectionDistance = isMobile ? 80 : 100 // Distance plus courte
  const particleOpacity = isMobile ? 0.5 : 0.3 // Plus opaque sur mobile
  const lineOpacity = isMobile ? 0.3 : 0.1 // Lignes plus visibles sur mobile
  const particleSize = { min: 0.5, max: 0.7 } // Particules plus petites

  // Recalcule les dimensions du canvas lorsque la fenêtre est redimensionnée
  const handleResize = () => {
    if (canvasRef.current && typeof window !== "undefined") {
      const canvas = canvasRef.current
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setDimensions({ width: window.innerWidth, height: window.innerHeight })

      // Réinitialiser les particules avec les nouvelles dimensions
      initParticles()
    }
  }

  // Suivi de la position de la souris
  const handleMouseMove = (event: MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY })
    setHasInteracted(true)

    // Créer des particules supplémentaires autour du curseur (moins fréquemment)
    if (Math.random() > 0.95) {
      addParticleAtPosition(event.clientX, event.clientY)
    }
  }

  // Ajoute une nouvelle particule à une position spécifique
  const addParticleAtPosition = (x: number, y: number) => {
    if (!canvasRef.current) return

    const newParticle: Particle = {
      x,
      y,
      size: Math.random() * (particleSize.max - particleSize.min) + particleSize.min, // Taille entre min et max
      speedX: (Math.random() - 0.5) * 0.5, // Vitesse réduite
      speedY: (Math.random() - 0.5) * 0.5, // Vitesse réduite
      hue: Math.random() * 60 + hueRotation,
      connections: [], // Stocke les indices des particules connectées
      opacity: Math.random() * 0.3 + particleOpacity, // Opacité variable
    }

    particlesRef.current.push(newParticle)

    // Limiter le nombre total de particules pour les performances
    const maxParticles = isMobile ? 60 : 100 // Moins de particules
    if (particlesRef.current.length > maxParticles) {
      particlesRef.current.shift()
    }
  }

  // Initialiser les particules
  const initParticles = () => {
    if (!canvasRef.current) return

    particlesRef.current = []
    const canvas = canvasRef.current
    // Moins de particules pour une animation plus subtile
    const particleCount = isMobile
      ? Math.min(Math.floor((canvas.width * canvas.height) / 40000), 40)
      : Math.min(Math.floor((canvas.width * canvas.height) / 25000), 70)

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height

      const particle: Particle = {
        x,
        y,
        size: Math.random() * (particleSize.max - particleSize.min) + particleSize.min, // Taille entre min et max
        speedX: (Math.random() - 0.5) * 0.5, // Vitesse réduite
        speedY: (Math.random() - 0.5) * 0.5, // Vitesse réduite
        hue: Math.random() * 60 + hueRotation,
        connections: [], // Stocke les indices des particules connectées
        opacity: Math.random() * 0.3 + particleOpacity, // Opacité variable
      }

      particlesRef.current.push(particle)
    }

    // Établir les connexions initiales
    updateConnections()
  }

  // Mettre à jour les connexions entre particules
  const updateConnections = () => {
    const particles = particlesRef.current

    // Réinitialiser toutes les connexions
    for (let i = 0; i < particles.length; i++) {
      particles[i].connections = []
    }

    // Établir de nouvelles connexions
    for (let i = 0; i < particles.length; i++) {
      const distances: { index: number; distance: number }[] = []

      // Calculer la distance avec toutes les autres particules
      for (let j = 0; j < particles.length; j++) {
        if (i !== j) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            distances.push({ index: j, distance })
          }
        }
      }

      // Trier par distance et prendre les plus proches
      distances.sort((a, b) => a.distance - b.distance)
      particles[i].connections = distances.slice(0, maxConnections).map((d) => d.index)
    }
  }

  // Dessiner les connexions entre les particules
  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i]

      // Dessiner les connexions de cette particule
      for (const connectedIndex of particle.connections) {
        const connectedParticle = particles[connectedIndex]
        const dx = particle.x - connectedParticle.x
        const dy = particle.y - connectedParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Opacité basée sur la distance
        const opacity = lineOpacity * (1 - distance / connectionDistance)

        // Couleur qui change avec le temps
        const connectionHue = (particle.hue + connectedParticle.hue) / 2

        ctx.beginPath()
        ctx.strokeStyle = `hsla(${connectionHue}, 70%, 60%, ${opacity})`
        ctx.lineWidth = 0.3 // Lignes plus fines
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(connectedParticle.x, connectedParticle.y)
        ctx.stroke()
      }
    }

    // Dessiner des connexions avec la souris si l'interaction a eu lieu
    if (hasInteracted) {
      for (let i = 0; i < particles.length; i++) {
        const dx = particles[i].x - mousePosition.x
        const dy = particles[i].y - mousePosition.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance * 0.7) {
          // Réduire la distance pour les connexions avec la souris
          const opacity = lineOpacity * 2 * (1 - distance / (connectionDistance * 0.7))

          ctx.beginPath()
          ctx.strokeStyle = `hsla(${particles[i].hue}, 80%, 60%, ${opacity})`
          ctx.lineWidth = 0.5 // Lignes légèrement plus épaisses pour les connexions avec la souris
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mousePosition.x, mousePosition.y)
          ctx.stroke()
        }
      }
    }
  }

  // Mettre à jour et dessiner les particules
  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current
    const time = Date.now() * 0.0005 // Temps pour l'effet de "balade" (plus lent)

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // Mise à jour de la position avec effet de "balade" plus naturel et sinusoïdal
      p.x += p.speedX + Math.sin(time + i * 0.3) * 0.3
      p.y += p.speedY + Math.cos(time + i * 0.5) * 0.3

      // Rebond sur les bords
      if (p.x < 0 || p.x > dimensions.width) p.speedX *= -1
      if (p.y < 0 || p.y > dimensions.height) p.speedY *= -1

      // Mise à jour de la couleur
      p.hue = (p.hue + 0.05) % 360 // Changement de couleur plus lent

      // Dessiner la particule
      ctx.beginPath()
      ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.opacity})`
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()

      // Effet de brillance plus subtil
      ctx.beginPath()
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
      gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.opacity * 0.3})`)
      gradient.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`)

      ctx.fillStyle = gradient
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Fonction d'animation principale
  const animate = () => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Effacer le canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Rotation de la teinte pour effet arc-en-ciel
    setHueRotation((prev) => (prev + 0.1) % 360) // Rotation plus lente

    // Mettre à jour les connexions périodiquement
    if (Math.random() > 0.98) {
      updateConnections()
    }

    // Dessiner les connexions
    drawConnections(ctx)

    // Mettre à jour et dessiner les particules
    updateAndDrawParticles(ctx)

    // Continuer l'animation
    animationRef.current = requestAnimationFrame(animate)
  }

  // Initialisation après le montage du composant
  useEffect(() => {
    if (typeof window === "undefined") return

    setIsMounted(true)

    // Initialiser les dimensions
    handleResize()

    // Ajouter les écouteurs d'événements
    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    // Démarrer l'animation
    animate()

    // Nettoyage lors du démontage
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationRef.current)
    }
  }, []) // Les dépendances vides signifient que cela ne s'exécute qu'une fois après le montage

  // Effet pour réagir aux changements de dimensions
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initParticles()
    }
  }, [dimensions])

  // Ne pas rendre sur le serveur
  if (!isMounted) return null

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: isMobile ? 0.3 : 0.15 }} // Animation plus subtile
      transition={{ duration: 1 }}
    />
  )
}
