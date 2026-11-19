"use client"

import { useEffect, useState } from "react"
import { Database, ShieldCheck } from "lucide-react"

import { useAdminSession } from "@/components/admin/admin-shell"
import { cn } from "@/lib/utils"

export default function AdminSecurityPage() {
  const { adminEmail, authStorage, setAdminEmail } = useAdminSession()
  const [newEmail, setNewEmail] = useState(adminEmail)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  useEffect(() => {
    if (adminEmail) setNewEmail(adminEmail)
  }, [adminEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    if (newPassword && newPassword !== confirmPassword) {
      setFeedback({ type: "err", text: "Les deux nouveaux mots de passe ne correspondent pas." })
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setFeedback({ type: "err", text: json.error || "Erreur lors de la mise à jour." })
        return
      }
      if (json.email) setAdminEmail(json.email)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setFeedback({
        type: "ok",
        text: "Identifiants mis à jour dans Neon PostgreSQL (mot de passe hashé avec scrypt).",
      })
    } catch {
      setFeedback({ type: "err", text: "Erreur réseau." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="eyebrow text-primary">Module Sécurité</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Compte administrateur</h1>
      </div>

      <div className="rounded-md border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <p className="eyebrow">Connecté en tant que</p>
            <p className="mt-1 font-serif text-2xl">{adminEmail || "Administrateur"}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
            <Database className="h-3 w-3" />
            {authStorage === "neon" ? "Neon PostgreSQL · scrypt" : "Env local"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="eyebrow mb-1.5 block">Email administrateur</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="eyebrow mb-1.5 block">Mot de passe actuel (requis)</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow mb-1.5 block">Nouveau mot de passe (optionnel)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                placeholder="6 caractères min."
                className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">Confirmer</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                placeholder="Répétez le mot de passe"
                className="h-11 w-full rounded-md border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {feedback && (
            <p
              className={cn(
                "rounded-md border px-3.5 py-2.5 text-xs",
                feedback.type === "ok"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              {feedback.text}
            </p>
          )}

          <button type="submit" disabled={saving} className="btn btn-solid w-full sm:w-auto">
            <ShieldCheck className="h-4 w-4" />
            {saving ? "Enregistrement…" : "Mettre à jour dans Neon"}
          </button>
        </form>
      </div>
    </div>
  )
}
