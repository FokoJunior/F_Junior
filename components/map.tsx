"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion, useAnimation } from "framer-motion"

interface MapProps {
  location: string
}

export default function Map({ location }: MapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [markerPosition, setMarkerPosition] = useState({ x: 50, y: 50 })
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  useEffect(() => {
    setIsMounted(true)

    // Animation d'entrée
    // Ajouter cette détection dans le useEffect
    const isMobile = window.innerWidth < 768

    // Ajuster les animations pour mobile
    if (isMobile) {
      // Simplifier les animations sur mobile
      controls.start({
        scale: 1,
        opacity: 1,
        transition: { duration: 0.5 },
      })
    } else {
      controls.start({
        scale: [0.95, 1],
        opacity: [0, 1],
        transition: { duration: 0.8, ease: "easeOut" },
      })
    }

    // Simuler un chargement de carte
    const timer = setTimeout(() => {
      setIsLoaded(true)

      // Animer le marqueur après chargement
      setTimeout(() => {
        controls.start({
          y: [50, 0],
          opacity: [0, 1],
          transition: { duration: 0.5, ease: "backOut" },
        })
      }, 500)
    }, 1000)

    return () => clearTimeout(timer)
  }, [controls])

  // Gérer le mouvement du marqueur
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mapContainerRef.current || !isHovered) return

    const rect = mapContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Limiter le mouvement du marqueur
    setMarkerPosition({
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    })
  }

  if (!isMounted) {
    return <div className="w-full h-full bg-muted rounded-xl" />
  }

  return (
    <motion.div
      className="w-full h-full rounded-xl overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={controls}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.5 }}
      ref={mapContainerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Iframe Google Maps */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15919.204619844697!2d9.7342878!3d4.0894498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10610de9b78c5ab5%3A0x5e57b8d5b2a4e1d3!2sLogpom%2C%20Douala%2C%20Cameroon!5e0!3m2!1sen!2sus!4v1710842400000!5m2!1sen!2sus"
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: "0.75rem" }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setIsLoaded(true)}
        className={`${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
      />

      {/* Overlay d'effet */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Effet de lueur aux bords */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/20 via-transparent to-primary/20 opacity-50" />

        {/* Effet de pulsation au centre */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/30"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Marqueur principal */}
        <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10" animate={controls}>
          <div className="relative">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <motion.div
              className="absolute inset-0 bg-primary rounded-full"
              animate={{
                scale: [1, 2],
                opacity: [0.7, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />
          </div>
        </motion.div>

        {/* Marqueur interactif qui suit la souris */}
        {isHovered && (
          <motion.div
            className="absolute w-4 h-4 bg-secondary/70 rounded-full z-10"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              left: `${markerPosition.x}%`,
              top: `${markerPosition.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              className="absolute inset-0 bg-secondary rounded-full"
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Écran de chargement */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-xl">
          <div className="text-center">
            <motion.div
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <p className="font-medium">Chargement de la carte...</p>
            <p className="text-sm text-muted-foreground mt-2">{location}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
