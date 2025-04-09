"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface ImageDistortionProps {
  src: string
  alt: string
  className?: string
  intensity?: number
}

export default function ImageDistortion({ src, alt, className = "", intensity = 0.05 }: ImageDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(springY, [0, dimensions.height], [intensity * 10, -intensity * 10])
  const rotateY = useTransform(springX, [0, dimensions.width], [-intensity * 10, intensity * 10])
  const scaleImage = useTransform(
    springY,
    [0, dimensions.height / 2, dimensions.height],
    [1 - intensity, 1 + intensity, 1 - intensity],
  )

  useEffect(() => {
    setIsMounted(true)

    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height })
    }

    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const { left, top } = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - left
      const mouseY = e.clientY - top

      setMousePosition({ x: mouseX, y: mouseY })
      x.set(mouseX)
      y.set(mouseY)
    }
  }

  const handleMouseLeave = () => {
    x.set(dimensions.width / 2)
    y.set(dimensions.height / 2)
  }

  // Don't render special effects on server
  if (!isMounted) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img src={src || "/placeholder.svg"} alt={alt} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale: scaleImage,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <img src={src || "/placeholder.svg"} alt={alt} className="w-full h-full object-cover" />

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 pointer-events-none"
          style={{
            backgroundPosition: `${(mousePosition.x / dimensions.width) * 100}% ${(mousePosition.y / dimensions.height) * 100}%`,
            backgroundSize: "200% 200%",
          }}
        />
      </motion.div>
    </motion.div>
  )
}
