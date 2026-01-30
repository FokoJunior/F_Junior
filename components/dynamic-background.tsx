"use client"

import dynamic from "next/dynamic"

const AnimatedBackground = dynamic(() => import("@/components/animated-background"), {
    ssr: false,
})

export default function DynamicBackground() {
    return <AnimatedBackground />
}
