"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function PageLoader() {
    return (
        <div className="fixed inset-0 z-[50] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="relative mb-8"
            >
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Image
                    src="/logo.png"
                    alt="Chargement..."
                    width={100}
                    height={100}
                    className="relative z-10 object-contain"
                />
            </motion.div>

            {/* Barre de chargement indéterminée */}
            <div className="w-48 h-1 bg-muted overflow-hidden rounded-full relative">
                <motion.div
                    className="h-full bg-primary absolute top-0 bottom-0"
                    initial={{ left: "-100%", width: "50%" }}
                    animate={{ left: "100%" }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
            </div>
        </div>
    )
}
