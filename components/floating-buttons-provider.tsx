"use client"

import type React from "react"
import { useState, useEffect } from "react"
import ChatButton from "@/components/chat-button"
import GoUpButton from "@/components/go-up-button"

export function FloatingButtonsProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <>{children}</>
    }

    return (
        <>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                <ChatButton />
            </div>
            <div className="fixed bottom-6 left-6 z-40">
                <GoUpButton />
            </div>
        </>
    )
}
