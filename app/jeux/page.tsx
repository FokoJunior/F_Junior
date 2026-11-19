import type { Metadata } from "next"

import GamesHub from "@/components/games/games-hub"
import { gamesList } from "@/lib/games"
import { SITE_URL, breadcrumb, jsonLdGraph, personId } from "@/lib/seo"

const description =
  "Mini-jeux interactifs sur le portfolio de Foko Junior (F_Junior) : Snake, 2048, Morpion IA (Minimax), Memory Dev et test de réflexes jouables directement dans le navigateur."

export const metadata: Metadata = {
  title: "Jeux",
  description,
  alternates: { canonical: "/jeux" },
  openGraph: {
    url: "/jeux",
    title: "Jeux — Foko Junior (F_Junior)",
    description,
  },
}

const jsonLd = jsonLdGraph(
  {
    "@type": "CollectionPage",
    url: `${SITE_URL}/jeux`,
    name: "Jeux — Foko Junior",
    description,
    author: { "@id": personId },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: gamesList.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/jeux#${g.id}`,
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
