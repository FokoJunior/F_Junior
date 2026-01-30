"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(onComplete, 500) // Petit délai avant de masquer
                    return 100
                }
                return prev + 2 // Vitesse de chargement
            })
        }, 30) // Fréquence de mise à jour

        return () => clearInterval(timer)
    }, [onComplete])

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative mb-8"
            >
                {/* Effet de lueur derrière le logo */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />

                <Image
                    src="/logo.png"
                    alt="F_Junior Logo"
                    width={150}
                    height={150}
                    className="relative z-10 object-contain"
                    priority
                />
            </motion.div>

            {/* Barre de progression stylisée */}
            <div className="w-64 h-1 bg-muted overflow-hidden rounded-full relative">
                <motion.div
                    className="h-full bg-primary absolute left-0 top-0"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                />
                {/* Effet visuel de scan qui passe sur la barre */}
                <motion.div
                    className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{ left: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
            </div>

            <motion.p
                className="mt-4 text-sm text-muted-foreground font-mono"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                {progress}%
            </motion.p>
        </div>
    )
}
