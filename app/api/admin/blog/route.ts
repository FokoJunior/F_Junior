import { NextRequest, NextResponse } from "next/server"

import { isAdminRequest } from "@/lib/admin-auth"
import { posts as staticPosts } from "@/lib/blog"
import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  let dbPosts: Array<{
    id: number
    slug: string
    title: string
    category: string
    excerpt: string
    content: string
    published: boolean
    source: "neon"
    createdAt: string
  }> = []

  if (hasDatabase()) {
    try {
      await ensureGamesSchema()
      const sql = getSql()
      const rows = await sql`
        SELECT id, slug, title, category, excerpt, content, published, created_at
        FROM admin_posts
        ORDER BY created_at DESC
      `
      dbPosts = rows.map((r) => ({
        id: Number(r.id),
        slug: String(r.slug),
        title: String(r.title),
        category: String(r.category),
        excerpt: String(r.excerpt),
        content: String(r.content),
        published: Boolean(r.published),
        source: "neon",
        createdAt: new Date(r.created_at as string | Date).toISOString(),
      }))
    } catch (err) {
      console.error("Admin blog GET error:", err)
    }
  }

  const builtIn = staticPosts.map((p) => ({
    id: null,
    slug: p.slug,
    title: typeof p.title === "string" ? p.title : p.title.fr,
    category: String(p.category),
    excerpt: typeof p.excerpt === "string" ? p.excerpt : p.excerpt.fr,
    published: Boolean(p.content),
    source: "static" as const,
    createdAt: p.date || null,
  }))

  return NextResponse.json({
    dbPosts,
    staticPosts: builtIn,
    total: dbPosts.length + builtIn.length,
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
    const title = String(body?.title || "").trim().slice(0, 160)
    const excerpt = String(body?.excerpt || "").trim().slice(0, 400)
    const content = String(body?.content || "").trim()
    const category = String(body?.category || "Tech").trim().slice(0, 40)
    const slug = slugify(String(body?.slug || title))
    const published = body?.published !== false

    if (!title || !excerpt || !content || !slug) {
      return NextResponse.json({ error: "Titre, résumé et contenu requis" }, { status: 400 })
    }

    await ensureGamesSchema()
    const sql = getSql()
    const inserted = await sql`
      INSERT INTO admin_posts (slug, title, category, excerpt, content, published)
      VALUES (${slug}, ${title}, ${category}, ${excerpt}, ${content}, ${published})
      RETURNING id, slug, title
    `
    return NextResponse.json({ ok: true, post: inserted[0] })
  } catch (err: unknown) {
    const msg = err instanceof Error && err.message.includes("unique") ? "Ce slug existe déjà" : "Erreur création article"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Neon PostgreSQL non configuré" }, { status: 503 })
  }
  try {
    const body = await request.json()
    const id = Number(body?.id)
    const published = Boolean(body?.published)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }
    await ensureGamesSchema()
    const sql = getSql()
    await sql`UPDATE admin_posts SET published = ${published}, updated_at = NOW() WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 })
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
    await sql`DELETE FROM admin_posts WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 })
  }
}
