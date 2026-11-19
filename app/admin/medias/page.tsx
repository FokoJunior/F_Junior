"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Copy, ExternalLink, Loader2, RefreshCw, Trash2, Upload } from "lucide-react"

import { useConfirm } from "@/components/confirm-provider"
import { cn } from "@/lib/utils"

interface BlobItem {
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

export default function AdminMediaPage() {
  const confirm = useConfirm()
  const [blobs, setBlobs] = useState<BlobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/media", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setBlobs(data.blobs || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "portfolio/media")
      const res = await fetch("/api/admin/media", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur upload")
        return
      }
      await load()
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (url: string) => {
    const ok = await confirm({
      title: "Supprimer ce média ?",
      description: "Ce fichier sera définitivement supprimé de Vercel Blob et retiré des profils qui l'utilisent.",
      confirmLabel: "Supprimer",
      variant: "danger",
    })
    if (!ok) return
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
    if (res.ok) load()
  }

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      window.setTimeout(() => setCopiedUrl(null), 1800)
    } catch {}
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Module Médias · Vercel Blob</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Bibliothèque ({blobs.length})</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} disabled={loading} className="btn btn-outline h-10 px-4 text-xs">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Actualiser
          </button>
          <label className="btn btn-solid h-10 cursor-pointer px-5 text-xs">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Uploader un média
            <input type="file" accept="image/*" onChange={handleUpload} className="sr-only" />
          </label>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {loading ? (
        <p className="eyebrow animate-pulse">Chargement des fichiers Vercel Blob…</p>
      ) : blobs.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
          Aucun fichier stocké dans Vercel Blob pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {blobs.map((b) => (
            <div key={b.url} className="overflow-hidden rounded-md border border-border bg-card">
              <div className="aspect-square w-full overflow-hidden bg-muted/40">
                <img src={b.url} alt={b.pathname} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate font-mono text-[11px] text-muted-foreground" title={b.pathname}>
                  {b.pathname}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">{fmtBytes(b.size)}</p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyUrl(b.url)}
                    className="btn btn-outline h-8 flex-1 px-2 text-xs"
                  >
                    {copiedUrl === b.url ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedUrl === b.url ? "Copié" : "URL"}
                  </button>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.url)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
