"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import ChatMarkdown from "@/components/chat-markdown"

import { chatWithOpenAI } from "@/lib/openai-action"

type Message = {
  id: number
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()
  const { t, language } = useLanguage()

  // Vérifier si le composant est monté côté client
  useEffect(() => {
    setIsMounted(true)

    // Initialiser les messages au montage du composant
    setMessages([
      {
        id: 1,
        text: "",
        sender: "assistant",
        timestamp: new Date(),
      },
    ])
  }, [])

  // Ne pas rendre le composant côté serveur
  if (!isMounted) return null

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || isLoading) return

    const userMessageText = message.trim()

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    try {
      // Préparer l'historique pour OpenAI
      const apiMessages = messages.map(msg => ({
        role: msg.sender === "user" ? "user" as const : "assistant" as const,
        content: msg.text
      }))

      // Ajouter le nouveau message à l'historique pour l'envoi
      apiMessages.push({
        role: "user",
        content: userMessageText
      })

      const response = await chatWithOpenAI(apiMessages, language)

      if (response.error) {
        toast({
          title: t("errorTitle"),
          description: t("chatUnavailable"),
          variant: "destructive"
        })
      } else if (response.text) {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          text: response.text,
          sender: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: t("errorTitle"),
        description: t("chatError"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="no-print">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label={t("chatWithMe")}
            className="fixed bottom-24 right-4 z-50 flex w-[calc(100%-2rem)] max-w-[420px] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl sm:right-6"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground font-serif text-lg text-background">
                  F
                </span>
                <div>
                  <p className="text-sm font-medium">{t("chatWithMe")}</p>
                  <p className="eyebrow flex items-center gap-1.5 !text-[0.62rem]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t("assistantName")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleChat}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t("close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex h-[min(440px,60vh)] flex-col gap-3 overflow-y-auto p-4" aria-live="polite" data-lenis-prevent>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
                      msg.sender === "user" ? "rounded-br-sm bg-foreground text-background" : "rounded-bl-sm bg-muted"
                    }`}
                  >
                    {msg.sender === "assistant" ? (
                      <ChatMarkdown>{msg.id === 1 ? t("chatWelcome") : msg.text}</ChatMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    )}
                    <p className="mt-1 font-mono text-[0.6rem] opacity-60">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-end gap-2 border-t border-border p-3">
              <textarea
                rows={1}
                placeholder={t("typingMessage")}
                className="max-h-28 min-h-[40px] flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base outline-none md:text-sm placeholder:text-muted-foreground focus:border-foreground"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">{t("send")}</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={toggleChat}
        aria-expanded={isOpen}
        aria-label={isOpen ? t("close") : t("chatWithMe")}
        className="fixed bottom-5 right-4 z-50 flex h-14 items-center gap-2 rounded-full bg-foreground pl-4 pr-5 text-background shadow-xl transition-colors hover:bg-primary hover:text-primary-foreground sm:right-6"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden text-sm font-medium sm:inline">{isOpen ? t("close") : t("chatLabel")}</span>
      </motion.button>
    </div>
  )
}
