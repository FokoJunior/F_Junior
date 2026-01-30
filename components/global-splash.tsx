"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Import dynamique pour éviter les problèmes d'hydratation si SSR
const SplashScreen = dynamic(() => import("@/components/splash-screen"), {
    ssr: false,
})

export default function GlobalSplash() {
    const [showSplash, setShowSplash] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    if (!showSplash) return null

    return <SplashScreen onComplete={() => setShowSplash(false)} />
}
