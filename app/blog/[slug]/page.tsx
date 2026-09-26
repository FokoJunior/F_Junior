import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PostView from "@/components/blog/post-view"
import { getPost, posts } from "@/lib/blog"
import { SITE_URL, breadcrumb, jsonLdGraph, personId } from "@/lib/seo"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return posts.filter((p) => p.content).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: "Foko Junior (F_Junior)", url: SITE_URL }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      authors: ["Foko Junior"],
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post?.content) notFound()

  const jsonLd = jsonLdGraph(
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      inLanguage: "fr",
      keywords: post.tags.join(", "),
      url: `${SITE_URL}/blog/${post.slug}`,
      mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
      author: { "@type": "Person", "@id": personId, name: "Foko Junior", url: SITE_URL },
      publisher: { "@id": personId },
    },
    breadcrumb([
      { name: "Foko Junior", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <PostView slug={slug} />
    </>
  )
}
