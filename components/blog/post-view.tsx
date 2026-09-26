"use client"

import Link from "next/link"
import { ArrowRight, Link2 } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { tr } from "@/lib/i18n"
import PageHeader from "@/components/page-header"
import { Reveal } from "@/components/reveal"
import { useToast } from "@/hooks/use-toast"
import { getPost, posts } from "@/lib/blog"
import { site } from "@/lib/site"

export default function PostView({ slug }: { slug: string }) {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const post = getPost(slug)!

  const related = posts
    .filter((p) => p.slug !== post.slug && p.content)
    .filter((p) => p.category === post.category || p.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 2)
  const others = related.length ? related : posts.filter((p) => p.slug !== post.slug && p.content).slice(0, 2)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: t("linkCopied") })
    } catch {}
  }

  return (
    <article>
      <PageHeader
        back={{ href: "/blog", label: t("backToBlog") }}
        eyebrow={`${post.category} · ${tr(post.date, language)} · ${post.readTime} ${t("minRead")}`}
        title={<span className="block max-w-5xl text-[clamp(2.5rem,7vw,6.5rem)]">{tr(post.title, language)}</span>}
        intro={tr(post.excerpt, language)}
      />

      <div className="container grid gap-12 pb-20 md:grid-cols-12">
        <aside className="md:col-span-3">
          <div className="space-y-6 border-t border-foreground/80 pt-4 md:sticky md:top-24">
            <div>
              <p className="eyebrow mb-1">{t("writtenBy")}</p>
              <p className="text-sm">{site.nickname}</p>
            </div>
            <div>
              <p className="eyebrow mb-2">{t("tags")}</p>
              <ul className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.7rem]">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={copyLink} className="chip">
              <Link2 className="h-3 w-3" />
              {t("share")}
            </button>
          </div>
        </aside>

        <Reveal className="md:col-span-8 md:col-start-5">
          <div
            lang={language}
            className="article-content max-w-[68ch]"
            dangerouslySetInnerHTML={{ __html: tr(post.content, language) }}
          />
        </Reveal>
      </div>

      {others.length > 0 && (
        <section className="border-t border-border bg-card/60">
          <div className="container py-16 md:py-20">
            <p className="eyebrow mb-8">{t("relatedPosts")}</p>
            <ul className="grid gap-px border border-border bg-border md:grid-cols-2">
              {others.map((p) => (
                <li key={p.slug} className="bg-background">
                  <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col justify-between gap-8 p-7 md:p-9">
                    <div>
                      <p className="eyebrow">
                        {p.category} · {tr(p.date, language)}
                      </p>
                      <p className="mt-3 font-serif text-3xl leading-tight transition-colors group-hover:text-primary">
                        {tr(p.title, language)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm">
                      {t("readMore")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}
