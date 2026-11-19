"use client"

import { useCallback, useEffect, useState } from "react"
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react"

interface PostRow {
  id: number | null
  slug: string
  title: string
  category: string
  excerpt: string
  published: boolean
  source: "neon" | "static"
  createdAt: string | null
}

export default function AdminBlogPage() {
  const [dbPosts, setDbPosts] = useState<PostRow[]>([])
  const [staticPosts, setStaticPosts] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // New post form
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Tech")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [published, setPublished] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/blog", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setDbPosts(data.dbPosts || [])
      setStaticPosts(data.staticPosts || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, excerpt, content, published }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur")
        return
      }
      setTitle("")
      setExcerpt("")
      setContent("")
      setShowForm(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async (id: number, next: boolean) => {
    const res = await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, published: next }),
    })
    if (res.ok) load()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cet article de Neon ?")) return
    const res = await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) load()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Module Blog</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">
            Articles ({dbPosts.length + staticPosts.length})
          </h1>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="btn btn-solid h-10 px-5 text-xs">
          <Plus className="h-4 w-4" />
          {showForm ? "Fermer" : "Nouvel article"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-4 rounded-md border border-primary/30 bg-card p-5 sm:p-6">
          <p className="eyebrow text-primary">Rédiger un article (Neon PostgreSQL)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="eyebrow mb-1.5 block">Titre *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex : Architecture Next.js 16 + Neon PostgreSQL"
                className="h-10 w-full rounded-md border border-input bg-background px-3.5 text-sm"
              />
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">Catégorie</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="eyebrow mb-1.5 block">Résumé *</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
              placeholder="Court résumé affiché sur la liste du blog…"
              className="h-10 w-full rounded-md border border-input bg-background px-3.5 text-sm"
            />
          </div>

          <div>
            <label className="eyebrow mb-1.5 block">Contenu (Markdown) *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              placeholder="## Introduction&#10;Rédigez votre article en Markdown…"
              className="w-full rounded-md border border-input bg-background p-3.5 font-mono text-sm"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publier immédiatement
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div>
            <button type="submit" disabled={saving} className="btn btn-solid h-10 px-6 text-xs">
              {saving ? "Publication…" : "Enregistrer l'article"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="eyebrow animate-pulse">Chargement des articles…</p>
      ) : (
        <div className="space-y-3">
          {[...dbPosts, ...staticPosts].map((post) => (
            <div
              key={`${post.source}-${post.slug}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      post.source === "neon"
                        ? "rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase text-primary"
                        : "rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground"
                    }
                  >
                    {post.source === "neon" ? "Neon DB" : "Statique"}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{post.category}</span>
                  <span
                    className={
                      post.published
                        ? "rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-600 dark:text-emerald-400"
                        : "rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] uppercase text-amber-600 dark:text-amber-400"
                    }
                  >
                    {post.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <h2 className="font-serif text-2xl leading-tight">{post.title}</h2>
                <p className="line-clamp-2 text-xs text-muted-foreground">{post.excerpt}</p>
              </div>

              {post.source === "neon" && post.id !== null && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => togglePublish(post.id!, !post.published)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    title={post.published ? "Passer en brouillon" : "Publier"}
                  >
                    {post.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id!)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
