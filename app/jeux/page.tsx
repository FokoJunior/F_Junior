import type { Metadata } from "next"

import GamesHub from "@/components/games/games-hub"
import { gamesList, type GameId } from "@/lib/games"
import { SITE_URL, breadcrumb, jsonLdGraph, personId } from "@/lib/seo"

const defaultDescription =
  `${gamesList.length} mini-jeux interactifs sur le portfolio de Foko Junior (F_Junior) : Échecs, Ludo, Snake, 2048, Puzzle Photo, Casse-Briques, Démineur, Dactylo Dev, Simon et 7 jeux Duo 1v1 en ligne.`

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ game?: string; room?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const room = params.room?.trim().toUpperCase()
  const gameId = params.game?.trim().toLowerCase() as GameId | undefined
  const game = gameId ? gamesList.find((g) => g.id === gameId) : undefined

  if (room) {
    const title = `Défi 1v1 · Salon ${room} — Jeux`
    const description = `Tu es invité dans le salon privé ${room} ! Rejoins la partie en direct sur le portfolio de Foko Junior (F_Junior).`
    const ogImage = `${SITE_URL}/api/og/games?room=${encodeURIComponent(room)}`
    return {
      title,
      description,
      alternates: { canonical: "/jeux" },
      openGraph: {
        type: "website",
        url: `${SITE_URL}/jeux?room=${encodeURIComponent(room)}`,
        title,
        description,
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    }
  }

  if (game) {
    const title = `${game.title.fr} — Jeux`
    const description = `${game.tagline.fr} · ${game.description.fr}`
    const ogImage = `${SITE_URL}/api/og/games?game=${encodeURIComponent(game.id)}`
    return {
      title,
      description,
      alternates: { canonical: `/jeux?game=${game.id}` },
      openGraph: {
        type: "website",
        url: `${SITE_URL}/jeux?game=${game.id}`,
        title: `${game.title.fr} — Foko Junior (F_Junior)`,
        description,
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${game.title.fr} — Foko Junior (F_Junior)`,
        description,
        images: [ogImage],
      },
    }
  }

  const ogImage = `${SITE_URL}/api/og/games`
  return {
    title: "Jeux",
    description: defaultDescription,
    alternates: { canonical: "/jeux" },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/jeux`,
      title: "Jeux — Foko Junior (F_Junior)",
      description: defaultDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Jeux — Foko Junior (F_Junior)" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Jeux — Foko Junior (F_Junior)",
      description: defaultDescription,
      images: [ogImage],
    },
  }
}

const jsonLd = jsonLdGraph(
  {
    "@type": "CollectionPage",
    url: `${SITE_URL}/jeux`,
    name: "Jeux — Foko Junior",
    description: defaultDescription,
    author: { "@id": personId },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: gamesList.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/jeux?game=${g.id}`,
        name: g.title.fr,
      })),
    },
  },
  breadcrumb([
    { name: "Foko Junior", path: "/" },
    { name: "Jeux", path: "/jeux" },
  ]),
)

export default function JeuxPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <GamesHub />
    </>
  )
}
