import type { Metadata } from "next"
import { notFound } from "next/navigation"

import ProjectDetail from "@/components/projects/project-detail"
import { coverOf, getProject, projects, shotsOf } from "@/lib/projects"
import { SITE_URL, breadcrumb, jsonLdGraph, personId } from "@/lib/seo"

type Props = { params: Promise<{ slug: string }> }

const abs = (src: string) => (src.startsWith("http") ? src : `${SITE_URL}${src}`)

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug)
  if (!project) return {}
  const cover = coverOf(project)
  const title = `${project.title} — projet de Foko Junior`
  const images = cover ? [{ url: abs(cover), alt: project.title }] : undefined
  return {
    title,
    description: project.description.fr,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: "article", url: `/projects/${project.slug}`, title, description: project.description.fr, images },
    twitter: { card: "summary_large_image", title, description: project.description.fr, images: cover ? [abs(cover)] : undefined },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const url = `${SITE_URL}/projects/${project.slug}`
  const jsonLd = jsonLdGraph(
    {
      "@type": project.category === "mobile" ? "MobileApplication" : "WebApplication",
      name: project.title,
      url: project.links?.[0]?.href ?? url,
      description: project.description.fr,
      applicationCategory: project.category === "ai" ? "DeveloperApplication" : "BusinessApplication",
      operatingSystem: project.category === "mobile" ? "Android, iOS" : "Web",
      keywords: project.tags.join(", "),
      image: shotsOf(project).map((s) => abs(s.src)),
      creator: { "@id": personId },
      author: { "@id": personId },
      mainEntityOfPage: url,
    },
    breadcrumb([
      { name: "Foko Junior", path: "/" },
      { name: "Projets", path: "/projects" },
      { name: project.title, path: `/projects/${project.slug}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <ProjectDetail slug={slug} />
    </>
  )
}
