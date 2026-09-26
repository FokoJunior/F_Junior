"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"

/** Défilement fluide (Lenis). Inactif si l'utilisateur préfère réduire les animations. */
export default function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
      // Laisse défiler nativement les zones qui ont leur propre scroll (chat, menus)
      prevent: (node) => !!node.closest("[data-lenis-prevent], [role='dialog'], [data-radix-popper-content-wrapper]"),
    })
    ;(window as any).__lenis = lenis

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      delete (window as any).__lenis
    }
  }, [])

  // Nouvelle page : on repart en haut (sauf ancre)
  useEffect(() => {
    if (window.location.hash) return
    const lenis = (window as any).__lenis as Lenis | undefined
    if (lenis) lenis.scrollTo(0, { immediate: true })
  }, [pathname])

  return null
}
