import { NextRequest, NextResponse } from "next/server"

import { isAdminRequest } from "@/lib/admin-auth"
import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ messages: [], unreadCount: 0 })
  }

  try {
    await ensureGamesSchema()
    const sql = getSql()
    const rows = await sql`
      SELECT id, name, email, subject, message, read, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 100
    `
    const messages = rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      subject: String(r.subject),
      message: String(r.message),
      read: Boolean(r.read),
      createdAt: new Date(r.created_at as string | Date).toISOString(),
    }))
    return NextResponse.json({
      messages,
      unreadCount: messages.filter((m) => !m.read).length,
    })
  } catch (err) {
    console.error("Admin messages GET error:", err)
    return NextResponse.json({ messages: [], unreadCount: 0 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Neon non configuré" }, { status: 503 })
  }
  try {
    const body = await request.json()
    const id = Number(body?.id)
    const read = Boolean(body?.read)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }
    await ensureGamesSchema()
    const sql = getSql()
    await sql`UPDATE contact_messages SET read = ${read} WHERE id = ${id}`
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
    return NextResponse.json({ error: "Neon non configuré" }, { status: 503 })
  }
  try {
    const body = await request.json()
    const id = Number(body?.id)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }
    await ensureGamesSchema()
    const sql = getSql()
    await sql`DELETE FROM contact_messages WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 })
  }
}
