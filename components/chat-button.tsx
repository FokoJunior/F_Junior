"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"

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
  const { t } = useLanguage()

  // Vérifier si le composant est monté côté client
  useEffect(() => {
    setIsMounted(true)

    // Initialiser les messages au montage du composant
    setMessages([
      {
        id: 1,
        text: "Bonjour ! Je suis l'assistant de F_Junior. Comment puis-je vous aider à découvrir son parcours ou ses projets aujourd'hui ?",
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

      const response = await chatWithOpenAI(apiMessages)

      if (response.error) {
        toast({
          title: "Erreur",
          description: response.error,
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
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-8 z-50 w-[90%] max-w-[400px]"
          >
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32&text=F_J" alt="Avatar" />
                    <AvatarFallback>F_J</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-sm">{t("chatWithMe")}</h3>
                    <p className="text-xs text-muted-foreground">F_Junior</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleChat}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted max-w-[80%] rounded-lg p-3">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-3 border-t">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Textarea
                    placeholder={t("typingMessage")}
                    className="min-h-[40px] resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                  <Button type="submit" size="icon" className="shrink-0">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 right-4 sm:right-8 z-50"
      >
        <Button onClick={toggleChat} size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Open chat</span>
        </Button>
      </motion.div>
    </>
  )
}
