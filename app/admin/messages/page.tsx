"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Mail, MailOpen, RefreshCw, Reply, Trash2 } from "lucide-react"

import { useConfirm } from "@/components/confirm-provider"
import { cn } from "@/lib/utils"

interface ContactMsg {
  id: number
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function AdminMessagesPage() {
  const confirm = useConfirm()
  const [messages, setMessages] = useState<ContactMsg[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleRead = async (id: number, read: boolean) => {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    })
    if (res.ok) load()
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: "Supprimer ce message ?",
      description: "Le message sera définitivement supprimé de votre boîte de réception.",
      confirmLabel: "Supprimer",
      variant: "danger",
    })
    if (!ok) return
    const res = await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) load()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Module Messages</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Boîte de réception ({messages.length})</h1>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn btn-outline h-9 px-4 text-xs">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Actualiser
        </button>
      </div>

      {loading ? (
        <p className="eyebrow animate-pulse">Chargement des messages…</p>
      ) : messages.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 p-10 text-center">
          <Mail className="mx-auto h-7 w-7 text-primary/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            Aucun message enregistré pour le moment. Les messages envoyés depuis le formulaire de contact apparaîtront automatiquement ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded-md border p-5 transition-colors",
                msg.read ? "border-border bg-card/60" : "border-primary/40 bg-card",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!msg.read && (
                      <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] uppercase text-primary-foreground">
                        Nouveau
                      </span>
                    )}
                    <h2 className="font-serif text-2xl leading-tight">{msg.subject}</h2>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    De <strong className="text-foreground">{msg.name}</strong> ({msg.email}) · {fmtDate(msg.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                    className="btn btn-outline h-8 px-3 text-xs"
                  >
                    <Reply className="h-3.5 w-3.5" />
                    Répondre
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleRead(msg.id, !msg.read)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    title={msg.read ? "Marquer non lu" : "Marquer lu"}
                  >
                    {msg.read ? <MailOpen className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-md border border-border/60 bg-background p-4 text-sm leading-relaxed text-foreground/90">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
