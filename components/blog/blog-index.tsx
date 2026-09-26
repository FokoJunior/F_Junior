"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Search } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { tr } from "@/lib/i18n"
import PageHeader from "@/components/page-header"
import { Reveal } from "@/components/reveal"
import { blogCategories, posts, type Post } from "@/lib/blog"
import { cn } from "@/lib/utils"

function PostRow({ post, index }: { post: Post; index: number }) {
  const { t, language } = useLanguage()
  const published = !!post.content

  const inner = (
    <>
      <span className="font-mono text-xs text-muted-foreground md:col-span-2">{tr(post.date, language)}</span>
      <span className="md:col-span-6">
        <span
          className={cn(
            "block font-serif text-2xl leading-tight md:text-3xl",
            published && "transition-colors group-hover:text-primary",
          )}
        >
          {tr(post.title, language)}
        </span>
        <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{tr(post.excerpt, language)}</span>
      </span>
      <span className="eyebrow md:col-span-2">{post.category}</span>
      <span className="flex items-center justify-between gap-3 font-mono text-xs text-muted-foreground md:col-span-2 md:justify-end">
        {post.readTime} {t("minRead")}
        {published ? (
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        ) : (
          <span className="rounded-full border border-border px-2 py-0.5 uppercase tracking-wider">{t("comingSoon")}</span>
        )}
      </span>
    </>
  )

  const cls = "group grid gap-3 border-b border-border py-7 md:grid-cols-12 md:items-baseline md:gap-6"

  return (
    <Reveal as="li" delay={Math.min(index, 6) * 0.03}>
      {published ? (
        <Link href={`/blog/${post.slug}`} className={cls} data-cursor={t("cursorRead")}>
          {inner}
        </Link>
      ) : (
        <div className={cn(cls, "opacity-60")} aria-disabled>
          {inner}
        </div>
      )}
    </Reveal>
  )
}

export default function BlogIndex() {
  const { t, language } = useLanguage()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts
      .filter((p) => !category || p.category === category)
      .filter(
        (p) =>
          !q ||
          tr(p.title, language).toLowerCase().includes(q) ||
          tr(p.excerpt, language).toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
      .sort((a, b) => Number(!!b.content) - Number(!!a.content))
  }, [query, category, language])

  return (
    <>
      <PageHeader
        back={{ href: "/", label: t("backToHome") }}
        eyebrow={`${posts.length} ${t("articlesCount")}`}
        title={
          <>
            Blog<span className="text-primary">.</span>
          </>
        }
        intro={t("blogSubtitle")}
      >
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="group">
            <button type="button" className="chip" data-active={!category} onClick={() => setCategory(null)}>
              {t("all")}
            </button>
            {blogCategories.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                data-active={category === c}
                aria-pressed={category === c}
                onClick={() => setCategory(category === c ? null : c)}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="relative block w-full md:max-w-xs">
            <span className="sr-only">{t("searchArticles")}</span>
            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchArticles")}
              className="w-full border-0 border-b border-input bg-transparent py-2 pl-7 text-base outline-none md:text-sm transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
          </label>
        </div>
      </PageHeader>

      <section className="container pb-24">
        {filtered.length > 0 ? (
          <ul className="border-t border-foreground/80">
            {filtered.map((post, i) => (
              <PostRow key={post.slug} post={post} index={i} />
            ))}
          </ul>
        ) : (
          <p className="border-t border-border py-16 text-center text-muted-foreground">{t("noResults")}</p>
        )}
      </section>
    </>
  )
}
