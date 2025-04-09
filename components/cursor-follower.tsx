"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function CursorFollower() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove)
      document.body.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove)
        document.body.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [isVisible])

  // Ne pas rendre sur le serveur ou les appareils mobiles
  if (!isMounted) return null

  // Vérifier les appareils mobiles uniquement côté client
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
  if (isMobile) return null

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-primary pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          mass: 0.5,
        }}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-50"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 500,
          mass: 0.2,
        }}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </>
  )
}
