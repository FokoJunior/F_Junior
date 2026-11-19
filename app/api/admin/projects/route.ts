import { NextRequest, NextResponse } from "next/server"

import { isAdminRequest } from "@/lib/admin-auth"
import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"
import { coverOf, projects as staticProjects } from "@/lib/projects"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  let dbProjects: Array<{
    id: number
    slug: string
    title: string
    category: string
    year: string
    description: string
    tags: string[]
    liveUrl: string | null
    repoUrl: string | null
    coverUrl: string | null
    featured: boolean
    source: "neon"
    createdAt: string
  }> = []

  if (hasDatabase()) {
    try {
      await ensureGamesSchema()
      const sql = getSql()
      const rows = await sql`
        SELECT id, slug, title, category, year, description, tags, live_url, repo_url, cover_url, featured, created_at
        FROM admin_projects
        ORDER BY created_at DESC
      `
      dbProjects = rows.map((r) => ({
        id: Number(r.id),
        slug: String(r.slug),
        title: String(r.title),
        category: String(r.category),
        year: String(r.year),
        description: String(r.description),
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
        liveUrl: r.live_url ? String(r.live_url) : null,
        repoUrl: r.repo_url ? String(r.repo_url) : null,
        coverUrl: r.cover_url ? String(r.cover_url) : null,
        featured: Boolean(r.featured),
        source: "neon",
        createdAt: new Date(r.created_at as string | Date).toISOString(),
      }))
    } catch (err) {
      console.error("Admin projects GET error:", err)
    }
  }

  const builtIn = staticProjects.map((p) => ({
    id: null,
    slug: p.slug,
    title: String(p.title),
    category: p.category,
    year: "2025",
    description: typeof p.description === "string" ? p.description : p.description.fr,
    tags: p.tags,
    liveUrl: p.links?.[0]?.href ?? null,
    repoUrl: null,
    coverUrl: coverOf(p) ?? null,
    featured: Boolean(p.featured),
    source: "static" as const,
    createdAt: null,
  }))

  return NextResponse.json({
    dbProjects,
    staticProjects: builtIn,
    total: dbProjects.length + builtIn.length,
  })
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Neon PostgreSQL non configuré" }, { status: 503 })
  }

  try {
    const body = await request.json()
    const title = String(body?.title || "").trim().slice(0, 120)
    const description = String(body?.description || "").trim().slice(0, 1000)
    const category = String(body?.category || "web").trim().slice(0, 40)
    const year = String(body?.year || new Date().getFullYear()).trim().slice(0, 10)
    const slug = slugify(String(body?.slug || title))
    const tags = Array.isArray(body?.tags)
      ? body.tags.map((t: unknown) => String(t).trim()).filter(Boolean).slice(0, 10)
      : String(body?.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 10)
    const liveUrl = typeof body?.liveUrl === "string" && body.liveUrl.trim() ? body.liveUrl.trim() : null
    const repoUrl = typeof body?.repoUrl === "string" && body.repoUrl.trim() ? body.repoUrl.trim() : null
    const coverUrl = typeof body?.coverUrl === "string" && body.coverUrl.trim() ? body.coverUrl.trim() : null
    const featured = Boolean(body?.featured)

    if (!title || !description || !slug) {
      return NextResponse.json({ error: "Titre et description requis" }, { status: 400 })
    }

    await ensureGamesSchema()
    const sql = getSql()
    const inserted = await sql`
      INSERT INTO admin_projects (slug, title, category, year, description, tags, live_url, repo_url, cover_url, featured)
      VALUES (${slug}, ${title}, ${category}, ${year}, ${description}, ${JSON.stringify(tags)}::jsonb, ${liveUrl}, ${repoUrl}, ${coverUrl}, ${featured})
      RETURNING id, slug, title
    `
    return NextResponse.json({ ok: true, project: inserted[0] })
  } catch (err: unknown) {
    const msg = err instanceof Error && err.message.includes("unique") ? "Ce slug existe déjà" : "Erreur création projet"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Neon PostgreSQL non configuré" }, { status: 503 })
  }
  try {
    const body = await request.json()
    const id = Number(body?.id)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }
    await ensureGamesSchema()
    const sql = getSql()
    await sql`DELETE FROM admin_projects WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 })
  }
}
