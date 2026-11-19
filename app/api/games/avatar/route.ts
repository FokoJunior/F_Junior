import crypto from "crypto"
import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

import { ensureGamesSchema, getSql, hasDatabase } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
}

function hashDevice(raw: string): string {
  const salt = process.env.LEADERBOARD_SALT || "fj-portfolio-games-v1"
  return crypto.createHash("sha256").update(`${salt}:dev:${raw}`).digest("hex").slice(0, 14)
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Vercel Blob non configuré" }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const rawDeviceId =
      (typeof formData.get("deviceId") === "string" ? (formData.get("deviceId") as string).trim() : "") ||
      request.cookies.get("fj_device_id")?.value?.trim() ||
      ""

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier image requis" }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({ error: "Format accepté : PNG, JPG, WebP ou GIF" }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image trop lourde (2 Mo max)" }, { status: 400 })
    }

    const deviceHash = rawDeviceId.length >= 8 ? hashDevice(rawDeviceId) : crypto.randomBytes(6).toString("hex")
    const pathname = `games/avatars/${deviceHash}-${Date.now()}.${ext}`

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // Sync avatar URL to existing Neon leaderboard entries for this device
    if (hasDatabase() && rawDeviceId.length >= 8) {
      try {
        await ensureGamesSchema()
        const sql = getSql()
        await sql`
          UPDATE game_leaderboard
          SET avatar_url = ${blob.url}
          WHERE device_hash = ${deviceHash}
        `
      } catch {
        // Non-blocking
      }
    }

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error("Avatar upload error:", err)
    return NextResponse.json({ error: "Échec de l'envoi de l'avatar" }, { status: 500 })
  }
}
