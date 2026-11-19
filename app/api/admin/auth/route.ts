import { NextRequest, NextResponse } from "next/server"

import {
  ADMIN_COOKIE_NAME,
  authenticateAdmin,
  createSessionToken,
  getAdminSession,
  isAdminConfigured,
  updateAdminCredentials,
} from "@/lib/admin-auth"
import { hasDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = getAdminSession(request)
  return NextResponse.json({
    configured: isAdminConfigured(),
    authenticated: session.authenticated,
    email: session.email ?? null,
    storage: hasDatabase() ? "neon" : "env",
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body?.email === "string" ? body.email : ""
    const password = typeof body?.password === "string" ? body.password : ""

    const auth = await authenticateAdmin(email, password)
    if (!auth.ok || !auth.email) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    const token = createSessionToken(auth.email)
    const res = NextResponse.json({ authenticated: true, email: auth.email })
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    })
    return res
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = getAdminSession(request)
  if (!session.authenticated || !session.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : ""
    const newEmail = typeof body?.newEmail === "string" ? body.newEmail : undefined
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : undefined

    const result = await updateAdminCredentials({
      currentEmail: session.email,
      currentPassword,
      newEmail,
      newPassword,
    })

    if (!result.ok || !result.email) {
      return NextResponse.json({ error: result.error || "Mise à jour impossible" }, { status: 400 })
    }

    const token = createSessionToken(result.email)
    const res = NextResponse.json({ ok: true, email: result.email })
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    })
    return res
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false })
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return res
}
