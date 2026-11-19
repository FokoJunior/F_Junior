import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const alt = "Jeux — Foko Junior (F_Junior) · 15 mini-jeux Solo & Duo 1v1"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function JeuxOpengraphImage() {
  let bgDataUrl = ""
  try {
    const img = await readFile(join(process.cwd(), "public", "games-banner.jpg"))
    bgDataUrl = `data:image/jpeg;base64,${img.toString("base64")}`
  } catch {}

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
            style={{ position: "absolute", inset: 0, width: "1200px", height: "630px", objectFit: "cover", objectPosition: "right center" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(11,15,23,0.96) 0%, rgba(11,15,23,0.85) 52%, rgba(11,15,23,0.35) 100%)",
          }}
        />
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, letterSpacing: 3, color: "#94a3b8" }}>
              <div style={{ width: 12, height: 12, borderRadius: 999, background: "#3b82f6" }} />
              <span>F_JUNIOR · PLAYGROUND</span>
            </div>
            <div
              style={{
                display: "flex",
                border: "1px solid rgba(96,165,250,0.45)",
                background: "rgba(37,99,235,0.18)",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 16,
                letterSpacing: 2,
                color: "#93c5fd",
              }}
            >
              15 JEUX SOLO & DUO 1V1
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: "740px" }}>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: 118, lineHeight: 0.95, letterSpacing: -3, fontWeight: 700 }}>
              <span>Jeux</span>
              <span style={{ color: "#3b82f6" }}>.</span>
            </div>
            <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.4, color: "#cbd5e1" }}>
              Snake, 2048, Puzzle Photo, Casse-Briques, Puissance 4, Chifoumi, Quiz Dev &amp; duels 1v1 en ligne.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: 20, color: "#94a3b8" }}>
              Foko Junior · Classement en direct · Partage de salons 1v1
            </div>
            <div
              style={{
                display: "flex",
                background: "#ffffff",
                color: "#0b0f17",
                borderRadius: 999,
                padding: "14px 28px",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 1.5,
              }}
            >
              JOUER MAINTENANT →
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
