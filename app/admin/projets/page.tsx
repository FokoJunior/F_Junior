"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink, Loader2, Plus, Search, Trash2, Upload } from "lucide-react"

import { useConfirm } from "@/components/confirm-provider"

interface ProjectRow {
  id: number | null
  slug: string
  title: string
  category: string
  year: string
  description: string
  tags: string[]
  liveUrl: string | null
  coverUrl: string | null
  featured: boolean
  source: "neon" | "static"
}

export default function AdminProjectsPage() {
  const confirm = useConfirm()
  const [dbProjects, setDbProjects] = useState<ProjectRow[]>([])
  const [staticProjects, setStaticProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)

  // New project form
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("web")
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [liveUrl, setLiveUrl] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [uploadingCover, setUploadingCover] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setDbProjects(data.dbProjects || [])
      setStaticProjects(data.staticProjects || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "portfolio/projects")
      const res = await fetch("/api/admin/media", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data.blob?.url) setCoverUrl(data.blob.url)
    } finally {
      setUploadingCover(false)
      e.target.value = ""
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, year, description, tags, liveUrl, coverUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur")
        return
      }
      setTitle("")
      setDescription("")
      setTags("")
      setLiveUrl("")
      setCoverUrl("")
      setShowForm(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: "Supprimer ce projet ?",
      description: "Ce projet sera définitivement supprimé de la base Neon PostgreSQL.",
      confirmLabel: "Supprimer",
      variant: "danger",
    })
    if (!ok) return
    const res = await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) load()
  }

  const all = [...dbProjects, ...staticProjects].filter((p) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    )
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Module Projets</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">
            Projets ({dbProjects.length + staticProjects.length})
          </h1>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="btn btn-solid h-10 px-5 text-xs">
          <Plus className="h-4 w-4" />
          {showForm ? "Fermer" : "Nouveau projet"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="space-y-4 rounded-md border border-primary/30 bg-card p-5 sm:p-6">
          <p className="eyebrow text-primary">Ajouter un projet dans Neon PostgreSQL</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="eyebrow mb-1.5 block">Titre *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex : NovaPay SaaS"
                className="h-10 w-full rounded-md border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="eyebrow mb-1.5 block">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                >
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                  <option value="ai">IA</option>
                  <option value="saas">SaaS</option>
                </select>
              </div>
              <div>
                <label className="eyebrow mb-1.5 block">Année</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="eyebrow mb-1.5 block">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Décrivez le projet, son architecture et ses résultats…"
              className="w-full rounded-md border border-input bg-background p-3.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow mb-1.5 block">Tags (séparés par virgule)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Next.js, TypeScript, Neon, Tailwind"
                className="h-10 w-full rounded-md border border-input bg-background px-3.5 text-sm"
              />
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">URL Live (optionnel)</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="h-10 w-full rounded-md border border-input bg-background px-3.5 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="btn btn-outline h-9 cursor-pointer px-4 text-xs">
              {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {coverUrl ? "Changer la couverture" : "Uploader une couverture (Blob)"}
              <input type="file" accept="image/*" onChange={handleUploadCover} className="sr-only" />
            </label>
            {coverUrl && (
              <img src={coverUrl} alt="Cover" className="h-10 w-16 rounded border border-border object-cover" />
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button type="submit" disabled={saving} className="btn btn-solid h-10 px-6 text-xs">
            {saving ? "Enregistrement…" : "Enregistrer le projet"}
          </button>
        </form>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrer par titre, catégorie ou tag…"
          className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Projects list */}
      {loading ? (
        <p className="eyebrow animate-pulse">Chargement des projets…</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {all.map((p) => (
            <div
              key={`${p.source}-${p.slug}`}
              className="flex items-start justify-between gap-4 rounded-md border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      p.source === "neon"
                        ? "rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase text-primary"
                        : "rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground"
                    }
                  >
                    {p.source === "neon" ? "Neon DB" : "Statique"}
                  </span>
                  <span className="font-mono text-[11px] uppercase text-muted-foreground">
                    {p.category} · {p.year}
                  </span>
                </div>
                <h2 className="font-serif text-2xl leading-tight">{p.title}</h2>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                {p.tags.length > 0 && (
                  <p className="font-mono text-[11px] text-muted-foreground">{p.tags.join(" · ")}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {p.liveUrl && (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    aria-label="Ouvrir le lien"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {p.source === "neon" && p.id !== null && (
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id!)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
