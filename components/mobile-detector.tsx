"use client"

import { useEffect, useState } from "react"

export function useMobileDetector() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Vérifier au chargement
    checkMobile()

    // Vérifier au redimensionnement
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return isMobile
}
