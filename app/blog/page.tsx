import type { Metadata } from "next"

import BlogIndex from "@/components/blog/blog-index"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Blog de Foko Junior (F_Junior) : articles et tutoriels sur le développement web, React, CSS, Next.js et TypeScript.",
  alternates: { canonical: "/blog" },
}

export default function BlogPage() {
  return <BlogIndex />
}
