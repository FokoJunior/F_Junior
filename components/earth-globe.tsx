"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useMobileDetector } from "./mobile-detector"

export default function EarthGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useMobileDetector()

  useEffect(() => {
    setIsMounted(true)

    // Utiliser une approche simple avec une image statique
    if (containerRef.current) {
      try {
        // Nettoyer le contenu précédent
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }

        // Créer un conteneur pour le globe
        const globeContainer = document.createElement("div")
        globeContainer.className = "relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden"

        // Ajouter l'image du globe
        const img = document.createElement("img")
        img.src =
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Mercator-projection.jpg/1200px-Mercator-projection.jpg"
        img.alt = "Carte du monde"
        img.className = "w-full h-full object-cover"
        img.onload = () => setIsLoaded(true)
        img.onerror = () => {
          // En cas d'erreur, utiliser une image de secours
          img.src = "/placeholder.svg?height=500&width=1000&text=World+Map"
          setIsLoaded(true)
        }

        // Ajouter le conteneur d'image
        globeContainer.appendChild(img)

        // Définir les villes à afficher
        const cities = [
          { name: "Paris", top: "35%", left: "48%", color: "blue" },
          { name: "New York", top: "38%", left: "25%", color: "green" },
          { name: "Tokyo", top: "40%", left: "82%", color: "red" },
          { name: "Sydney", top: "65%", left: "85%", color: "purple" },
          { name: "Moscow", top: "32%", left: "57%", color: "orange" },
          { name: "Nairobi", top: "58%", left: "52%", color: "pink" },
          { name: "Douala", top: "55%", left: "47%", color: "yellow" },
        ]

        // Ajouter les points pour chaque ville
        cities.forEach((city) => {
          // Créer le point
          const point = document.createElement("div")
          point.className = "absolute w-3 h-3 rounded-full animate-pulse"
          point.style.top = city.top
          point.style.left = city.left
          point.style.backgroundColor = city.color
          point.style.transform = "translate(-50%, -50%)"

          // Créer l'étiquette
          const label = document.createElement("div")
          label.className = "absolute text-xs font-medium bg-white/80 dark:bg-black/80 px-1 py-0.5 rounded shadow-sm"
          label.style.top = `calc(${city.top} - 15px)`
          label.style.left = city.left
          label.style.transform = "translateX(-50%)"
          label.textContent = city.name

          // Ajouter au conteneur
          globeContainer.appendChild(point)
          globeContainer.appendChild(label)
        })

        // Ajouter des lignes de connexion entre les villes
        for (let i = 0; i < cities.length; i++) {
          for (let j = i + 1; j < cities.length; j++) {
            const line = document.createElement("div")
            line.className = "absolute bg-primary/30 dark:bg-primary/20"
            line.style.height = "1px"
            line.style.transformOrigin = "0 0"

            // Calculer la position et la rotation de la ligne
            const x1 = Number.parseFloat(cities[i].left) / 100
            const y1 = Number.parseFloat(cities[i].top) / 100
            const x2 = Number.parseFloat(cities[j].left) / 100
            const y2 = Number.parseFloat(cities[j].top) / 100

            const length = Math.sqrt(Math.pow((x2 - x1) * 100, 2) + Math.pow((y2 - y1) * 100, 2))
            const angle = Math.atan2((y2 - y1) * 100, (x2 - x1) * 100) * (180 / Math.PI)

            line.style.width = `${length}%`
            line.style.left = `${x1 * 100}%`
            line.style.top = `${y1 * 100}%`
            line.style.transform = `rotate(${angle}deg)`

            globeContainer.appendChild(line)
          }
        }

        // Ajouter un titre
        const title = document.createElement("div")
        title.className =
          "absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/80 dark:bg-black/80 px-3 py-1 rounded-full text-sm font-medium shadow-md"
        title.textContent = "Présence Mondiale"

        globeContainer.appendChild(title)
        containerRef.current.appendChild(globeContainer)
      } catch (error) {
        console.error("Error loading globe:", error)

        // Afficher un message d'erreur
        if (containerRef.current) {
          const errorMsg = document.createElement("div")
          errorMsg.className = "flex items-center justify-center h-full bg-muted text-center p-4"
          errorMsg.innerHTML = `
            <div>
              <p class="font-medium mb-2">Présence Mondiale</p>
              <p class="text-sm text-muted-foreground">Notre réseau s'étend à travers le monde entier</p>
            </div>
          `
          containerRef.current.appendChild(errorMsg)
          setIsLoaded(true)
        }
      }
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <motion.div
      ref={containerRef}
      className="w-full h-[500px] rounded-xl relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1 }}
    />
  )
}
