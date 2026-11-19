import crypto from "crypto"
import type { NextRequest } from "next/server"

import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"

export const ADMIN_COOKIE_NAME = "fj_admin_session"
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

const DEFAULT_ADMIN_EMAIL = "benitojunior2022@gmail.com"
const DEFAULT_ADMIN_PASSWORD = "FJunior@2026!"

function getDefaultEmail(): string {
  return (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase()
}

function getDefaultPassword(): string {
  return (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD).trim()
}

function getSessionSecret(): string {
  const db = process.env.DATABASE_URL || ""
  const fallback = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
  return crypto.createHash("sha256").update(`fj-admin-session-key:${db}:${fallback}`).digest("hex")
}

/** Hash password with scrypt + 16-byte random salt. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const derived = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${derived}`
}

/** Constant-time verification of password against stored scrypt hash. */
export function verifyPasswordHash(password: string, storedHash: string): boolean {
  const [salt, keyHex] = storedHash.split(":")
  if (!salt || !keyHex) return false
  try {
    const derived = crypto.scryptSync(password, salt, 64)
    const expected = Buffer.from(keyHex, "hex")
    if (derived.length !== expected.length) return false
    return crypto.timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

/** Ensure at least one admin account exists in Neon (seeds default account once). */
export async function ensureDefaultAdmin(): Promise<void> {
  if (!hasDatabase()) return
  await ensureGamesSchema()
  const sql = getSql()
  const countRows = await sql`SELECT COUNT(*)::int AS total FROM admin_users`
  const total = Number(countRows[0]?.total ?? 0)
  if (total === 0) {
    const email = getDefaultEmail()
    const passwordHash = hashPassword(getDefaultPassword())
    await sql`
      INSERT INTO admin_users (email, password_hash)
      VALUES (${email}, ${passwordHash})
      ON CONFLICT (email) DO NOTHING
    `
  }
}

export function isAdminConfigured(): boolean {
  return getDefaultEmail().length > 0 && getDefaultPassword().length >= 4
}

export async function authenticateAdmin(
  emailInput: string,
  passwordInput: string,
): Promise<{ ok: boolean; email?: string }> {
  const email = emailInput.trim().toLowerCase()
  if (!email || !passwordInput) return { ok: false }

  if (hasDatabase()) {
    try {
      await ensureDefaultAdmin()
      const sql = getSql()
      const rows = await sql`
        SELECT email, password_hash
        FROM admin_users
        WHERE LOWER(email) = ${email}
        LIMIT 1
      `
      if (rows.length === 0) return { ok: false }
      const ok = verifyPasswordHash(passwordInput, String(rows[0].password_hash))
      return ok ? { ok: true, email: String(rows[0].email) } : { ok: false }
    } catch (err) {
      console.error("Neon authenticateAdmin error:", err)
    }
  }

  // Fallback to env/default if database is unavailable
  const expectedEmail = getDefaultEmail()
  const expectedPassword = getDefaultPassword()
  const emailMatch = crypto.timingSafeEqual(
    crypto.createHash("sha256").update(email).digest(),
    crypto.createHash("sha256").update(expectedEmail).digest(),
  )
  const pwdMatch = crypto.timingSafeEqual(
    crypto.createHash("sha256").update(passwordInput).digest(),
    crypto.createHash("sha256").update(expectedPassword).digest(),
  )
  return emailMatch && pwdMatch ? { ok: true, email: expectedEmail } : { ok: false }
}

export async function updateAdminCredentials(params: {
  currentEmail: string
  currentPassword: string
  newEmail?: string
  newPassword?: string
}): Promise<{ ok: boolean; email?: string; error?: string }> {
  if (!hasDatabase()) {
    return { ok: false, error: "Neon PostgreSQL requis pour modifier les identifiants." }
  }

  await ensureDefaultAdmin()
  const sql = getSql()
  const normalizedCurrent = params.currentEmail.trim().toLowerCase()
  const rows = await sql`
    SELECT id, email, password_hash
    FROM admin_users
    WHERE LOWER(email) = ${normalizedCurrent}
    LIMIT 1
  `
  if (rows.length === 0) {
    return { ok: false, error: "Compte administrateur introuvable." }
  }

  const admin = rows[0]
  if (!verifyPasswordHash(params.currentPassword, String(admin.password_hash))) {
    return { ok: false, error: "Mot de passe actuel incorrect." }
  }

  const nextEmail = params.newEmail?.trim().toLowerCase() || String(admin.email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
    return { ok: false, error: "Adresse email invalide." }
  }

  let nextHash = String(admin.password_hash)
  if (params.newPassword && params.newPassword.length > 0) {
    if (params.newPassword.length < 6) {
      return { ok: false, error: "Le nouveau mot de passe doit contenir au moins 6 caractères." }
    }
    nextHash = hashPassword(params.newPassword)
  }

  await sql`
    UPDATE admin_users
    SET email = ${nextEmail}, password_hash = ${nextHash}, updated_at = NOW()
    WHERE id = ${Number(admin.id)}
  `

  return { ok: true, email: nextEmail }
}

export function createSessionToken(email: string): string {
  const exp = Date.now() + SESSION_TTL_MS
  const nonce = crypto.randomBytes(10).toString("hex")
  const emailB64 = Buffer.from(email.trim().toLowerCase(), "utf8").toString("base64url")
  const payload = `${exp}.${nonce}.${emailB64}`
  const sig = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex")
  return `${payload}.${sig}`
}

export function verifySessionToken(token: string | undefined): { valid: boolean; email?: string } {
  if (!token || !isAdminConfigured()) return { valid: false }
  const parts = token.split(".")
  if (parts.length !== 4) return { valid: false }
  const [expStr, nonce, emailB64, sig] = parts
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || Date.now() > exp) return { valid: false }

  const payload = `${expStr}.${nonce}.${emailB64}`
  const expectedSig = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex")
  try {
    const valid = crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))
    if (!valid) return { valid: false }
    const email = Buffer.from(emailB64, "base64url").toString("utf8")
    return { valid: true, email }
  } catch {
    return { valid: false }
  }
}

export function getAdminSession(request: NextRequest): { authenticated: boolean; email?: string } {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  const res = verifySessionToken(token)
  return res.valid ? { authenticated: true, email: res.email } : { authenticated: false }
}

export function isAdminRequest(request: NextRequest): boolean {
  return getAdminSession(request).authenticated
}
