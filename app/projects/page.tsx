import type { Metadata } from "next"

import ProjectsIndex from "@/components/projects/projects-index"
import { mainProjects } from "@/lib/projects"
import { SITE_URL, breadcrumb, jsonLdGraph, personId } from "@/lib/seo"

const description =
  "Projets de Foko Junior (F_Junior) : SaaS, applications mobiles Flutter, e-commerce, plateformes web et IA — TCHOOP237, Oystr, FermeConnect, Stock Junior, DanAid, JudgeX, AquaSafe et plus."

export const metadata: Metadata = {
  title: "Projets",
  description,
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects", title: "Projets de Foko Junior (F_Junior)", description },
}

const jsonLd = jsonLdGraph(
  {
    "@type": "CollectionPage",
    url: `${SITE_URL}/projects`,
    name: "Projets de Foko Junior",
    description,
    author: { "@id": personId },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: mainProjects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/projects/${p.slug}`,
        name: p.title,
      })),
    },
  },
  breadcrumb([
    { name: "Foko Junior", path: "/" },
    { name: "Projets", path: "/projects" },
  ]),
)

export default function ProjectsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <ProjectsIndex />
    </>
  )
}
