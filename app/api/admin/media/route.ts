import { del, list, put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

import { isAdminRequest } from "@/lib/admin-auth"
import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ blobs: [], configured: false })
  }

  try {
    const res = await list({
      limit: 100,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return NextResponse.json({
      configured: true,
      blobs: res.blobs.map((b) => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: new Date(b.uploadedAt).toISOString(),
      })),
    })
  } catch (err) {
    console.error("Admin media GET error:", err)
    return NextResponse.json({ blobs: [], configured: true })
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Vercel Blob non configuré" }, { status: 503 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const folder = String(formData.get("folder") || "portfolio").replace(/[^a-z0-9/_-]/gi, "")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Fichier trop lourd (5 Mo max)" }, { status: 400 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const blob = await put(`${folder}/${Date.now()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || undefined,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ ok: true, blob })
  } catch {
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Vercel Blob non configuré" }, { status: 503 })
  }
  try {
    const body = await request.json()
    const url = String(body?.url || "")
    if (!url.startsWith("https://")) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 })
    }
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
    if (hasDatabase()) {
      await ensureGamesSchema()
      const sql = getSql()
      await sql`UPDATE game_leaderboard SET avatar_url = NULL WHERE avatar_url = ${url}`
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 })
  }
}
