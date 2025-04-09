"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"

interface RobotAnimationProps {
  primaryHue?: number
}

export default function RobotAnimation({ primaryHue = 0 }: RobotAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const controls = useAnimation()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Animation initiale
    controls.start({
      y: [0, -10, 0],
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 3,
        ease: "easeInOut",
      },
    })

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setMousePosition({
        x: (x / rect.width) * 2 - 1,
        y: -((y / rect.height) * 2 - 1),
      })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [controls])

  // Calculer les couleurs basées sur la teinte primaire
  const primaryColor = `hsl(${primaryHue}, 70%, 50%)`
  const secondaryColor = `hsl(${(primaryHue + 60) % 360}, 70%, 50%)`
  const tertiaryColor = `hsl(${(primaryHue + 180) % 360}, 70%, 50%)`
  const glowColor = `hsl(${primaryHue}, 70%, 60%)`

  // Calculer la rotation du robot en fonction de la position de la souris
  const rotateX = isHovering ? mousePosition.y * 15 : 0
  const rotateY = isHovering ? mousePosition.x * 15 : 0

  if (!isMounted) return null

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Fond avec effet de grille */}
      <div
        className="absolute inset-0 grid-bg"
        style={{
          backgroundImage: `radial-gradient(circle, ${primaryColor}10 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      {/* Cercles lumineux en arrière-plan */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-20 blur-xl"
        style={{ backgroundColor: primaryColor }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 4,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-40 h-40 rounded-full opacity-20 blur-xl"
        style={{ backgroundColor: secondaryColor, left: "30%", top: "20%" }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 5,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute w-32 h-32 rounded-full opacity-20 blur-xl"
        style={{ backgroundColor: tertiaryColor, right: "25%", bottom: "15%" }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 6,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Robot principal */}
      <motion.div
        className="relative z-10"
        animate={controls}
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          style={{
            rotateX: rotateX,
            rotateY: rotateY,
            transition: { type: "spring", stiffness: 300, damping: 30 },
          }}
          className="robot-container"
        >
          {/* Corps du robot */}
          <svg width="240" height="280" viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ombre */}
            <ellipse cx="120" cy="260" rx="60" ry="10" fill="rgba(0,0,0,0.2)" />

            {/* Jambes */}
            <motion.g
              animate={{
                y: [0, 5, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <rect x="85" y="180" width="20" height="60" rx="10" fill={secondaryColor} />
              <rect x="135" y="180" width="20" height="60" rx="10" fill={secondaryColor} />
              <rect x="80" y="230" width="30" height="10" rx="5" fill={tertiaryColor} />
              <rect x="130" y="230" width="30" height="10" rx="5" fill={tertiaryColor} />
            </motion.g>

            {/* Corps */}
            <motion.g
              animate={{
                rotate: isHovering ? [0, -2, 2, 0] : 0,
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                ease: "easeInOut",
              }}
              style={{ originX: "50%", originY: "50%" }}
            >
              <rect x="70" y="100" width="100" height="90" rx="20" fill={primaryColor} />
              <rect x="90" y="130" width="60" height="30" rx="5" fill="rgba(255,255,255,0.2)" />

              {/* Motif sur le corps */}
              <motion.g
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  ease: "easeInOut",
                }}
              >
                <circle cx="110" cy="120" r="5" fill="rgba(255,255,255,0.8)" />
                <circle cx="130" cy="120" r="5" fill="rgba(255,255,255,0.8)" />
                <rect x="100" y="145" width="40" height="5" rx="2.5" fill="rgba(255,255,255,0.8)" />
              </motion.g>
            </motion.g>

            {/* Bras */}
            <motion.g
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                ease: "easeInOut",
              }}
              style={{ originX: "70px", originY: "110px" }}
            >
              <rect x="40" y="110" width="30" height="15" rx="7.5" fill={secondaryColor} />
              <circle cx="40" cy="117.5" r="10" fill={tertiaryColor} />
            </motion.g>

            <motion.g
              animate={{
                rotate: [0, -5, 0, 5, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                ease: "easeInOut",
                delay: 0.5,
              }}
              style={{ originX: "170px", originY: "110px" }}
            >
              <rect x="170" y="110" width="30" height="15" rx="7.5" fill={secondaryColor} />
              <circle cx="200" cy="117.5" r="10" fill={tertiaryColor} />
            </motion.g>

            {/* Tête */}
            <motion.g
              animate={{
                y: [0, -5, 0],
                rotate: isHovering ? [0, mousePosition.x * 5, 0] : 0,
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
              }}
            >
              <rect x="85" y="50" width="70" height="60" rx="15" fill={primaryColor} />

              {/* Yeux */}
              <motion.g
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                <circle cx="105" cy="75" r="10" fill="rgba(255,255,255,0.9)" />
                <circle cx="135" cy="75" r="10" fill="rgba(255,255,255,0.9)" />

                <motion.circle
                  cx={105 + mousePosition.x * 3}
                  cy={75 + mousePosition.y * 3}
                  r="5"
                  fill={tertiaryColor}
                />
                <motion.circle
                  cx={135 + mousePosition.x * 3}
                  cy={75 + mousePosition.y * 3}
                  r="5"
                  fill={tertiaryColor}
                />
              </motion.g>

              {/* Antennes */}
              <motion.g
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                  ease: "easeInOut",
                }}
                style={{ originX: "95px", originY: "50px" }}
              >
                <rect x="95" y="30" width="5" height="20" fill={secondaryColor} />
                <circle cx="97.5" cy="25" r="5" fill={tertiaryColor} />
              </motion.g>

              <motion.g
                animate={{
                  rotate: [0, -5, 0, 5, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                style={{ originX: "140px", originY: "50px" }}
              >
                <rect x="140" y="30" width="5" height="20" fill={secondaryColor} />
                <circle cx="142.5" cy="25" r="5" fill={tertiaryColor} />
              </motion.g>
            </motion.g>
          </svg>

          {/* Effet de lueur sous le robot */}
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-10 blur-xl opacity-30"
            style={{ backgroundColor: glowColor }}
          ></div>
        </motion.div>
      </motion.div>

      {/* Particules flottantes */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.6,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3 + Math.random() * 3,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Lignes de code qui flottent */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`code-${i}`}
          className="absolute px-3 py-1 rounded-md text-xs font-mono"
          style={{
            backgroundColor: "rgba(0,0,0,0.1)",
            color: i % 2 === 0 ? primaryColor : tertiaryColor,
            left: `${10 + Math.random() * 70}%`,
            top: `${10 + Math.random() * 70}%`,
            opacity: 0.7,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 5 + Math.random() * 3,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        >
          {i % 2 === 0 ? "{ code: true }" : "<Robot />"}
        </motion.div>
      ))}
    </div>
  )
}
