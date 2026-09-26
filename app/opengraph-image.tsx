import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const alt = "Foko Junior (F_Junior) — Développeur Full Stack · Mobile · IA à Douala"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const portrait = await readFile(join(process.cwd(), "public", "portrait.jpg"))
  const src = `data:image/jpeg;base64,${portrait.toString("base64")}`

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f6f3ec", color: "#171614" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "64px 56px 56px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, letterSpacing: 4, color: "#6b665e" }}>
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#10b981" }} />
            FJUNIOR.TCHOOP237.COM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 132, lineHeight: 0.95, letterSpacing: -4 }}>Foko</div>
            <div style={{ fontSize: 132, lineHeight: 0.95, letterSpacing: -4, color: "#d6461a", fontStyle: "italic" }}>Junior</div>
            <div style={{ marginTop: 28, fontSize: 30, color: "#3b3833" }}>Développeur Full Stack · Mobile · IA</div>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#6b665e" }}>
            FOKO TADJUIGE Benoît Junior · F_Junior · Douala, Cameroun
          </div>
        </div>
        <img src={src} width={420} height={630} style={{ objectFit: "cover", objectPosition: "50% 18%" }} />
      </div>
    ),
    size,
  )
}
