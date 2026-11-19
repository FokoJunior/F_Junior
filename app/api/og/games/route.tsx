import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

import { gameCategoryLabels, gamesList, type GameId } from "@/lib/games"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const gameParam = request.nextUrl.searchParams.get("game")?.trim().toLowerCase() as GameId | undefined
  const roomParam = request.nextUrl.searchParams.get("room")?.trim().toUpperCase() || null

  const game = gameParam ? gamesList.find((g) => g.id === gameParam) : undefined

  let bgDataUrl = ""
  try {
    const img = await readFile(join(process.cwd(), "public", "games-banner.jpg"))
    bgDataUrl = `data:image/jpeg;base64,${img.toString("base64")}`
  } catch {}

  const badge = roomParam
    ? `DÉFI 1V1 EN LIGNE · SALON ${roomParam}`
    : game
      ? `${gameCategoryLabels[game.category].fr.toUpperCase()} · ${game.tagline.fr.toUpperCase()}`
      : `PLAYGROUND · ${gamesList.length} JEUX SOLO & DUO 1V1`

  const title = roomParam
    ? `Salon ${roomParam}`
    : game
      ? game.title.fr
      : "Jeux"

  const subtitle = roomParam
    ? "Tu es invité à un duel 1v1 en direct ! Ouvre le lien pour rejoindre la partie immédiatement."
    : game
      ? game.description.fr
      : "Échecs, Ludo, Snake, 2048, Puzzle Photo, Puissance 4, Chifoumi, Quiz Dev & plus — avec classement en direct."

  const cta = roomParam ? "REJOINDRE LE DUEL →" : game ? `JOUER À ${game.title.fr.toUpperCase()} →` : "JOUER MAINTENANT →"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "1200px",
          height: "630px",
          background: "#0c1018",
          color: "#f8fafc",
          overflow: "hidden",
        }}
      >
        {bgDataUrl && (
          <img
            src={bgDataUrl}
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
              objectPosition: "right center",
            }}
          />
        )}

        {/* Dark editorial left-to-right gradient scrim */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(11,15,23,0.96) 0%, rgba(11,15,23,0.86) 52%, rgba(11,15,23,0.35) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "56px 68px",
          }}
        >
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: 22, letterSpacing: 3, color: "#94a3b8" }}>
              <div style={{ width: 12, height: 12, borderRadius: 999, background: "#3b82f6" }} />
              <span>F_JUNIOR · FJUNIOR.TCHOOP237.COM</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid rgba(96,165,250,0.45)",
                background: "rgba(37,99,235,0.18)",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 16,
                letterSpacing: 2,
                color: "#93c5fd",
              }}
            >
              {badge}
            </div>
          </div>

          {/* Center Title & Description */}
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "740px" }}>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: 108, lineHeight: 0.95, letterSpacing: -3, fontWeight: 700 }}>
              <span>{title}</span>
              <span style={{ color: "#3b82f6" }}>.</span>
            </div>
            <div style={{ marginTop: 24, fontSize: 27, lineHeight: 1.4, color: "#cbd5e1" }}>
              {subtitle}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 20, color: "#94a3b8" }}>
              <span>{gamesList.length} jeux gratuits</span>
              <span>·</span>
              <span>Solo & Duo 1v1</span>
              <span>·</span>
              <span>Classement en direct</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                color: "#0b0f17",
                borderRadius: 999,
                padding: "14px 28px",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 1.5,
              }}
            >
              {cta}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
