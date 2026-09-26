import type { MetadataRoute } from "next"

import { posts } from "@/lib/blog"
import { coverOf, projects, shotsOf } from "@/lib/projects"
import { SITE_URL } from "@/lib/seo"

const abs = (src: string) => (src.startsWith("http") ? src : `${SITE_URL}${src}`)

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1, images: [`${SITE_URL}/portrait.jpg`] },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.9, images: [`${SITE_URL}/portrait.jpg`] },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...projects.map((p) => {
      const shots = shotsOf(p).map((s) => abs(s.src))
      const cover = coverOf(p)
      return {
        url: `${SITE_URL}/projects/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: p.archive ? 0.4 : p.featured ? 0.8 : 0.7,
        images: shots.length ? shots : cover ? [abs(cover)] : undefined,
      }
    }),
    ...posts
      .filter((p) => p.content)
      .map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: now,
        changeFrequency: "yearly" as const,
        priority: 0.5,
      })),
  ]
}
