"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import PageHeader from "@/components/page-header"
import ProjectCover from "@/components/project-cover"
import { Reveal, RevealImage, SectionLabel } from "@/components/reveal"
import {
  archivedProjects,
  categoryLabels,
  mainProjects,
  prettyUrl,
  titleOf,
  type ProjectCategory,
} from "@/lib/projects"
import { tr } from "@/lib/i18n"

type Filter = "all" | ProjectCategory

export default function ProjectsIndex() {
  const { t, language } = useLanguage()
  const [filter, setFilter] = useState<Filter>("all")

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: t("all") },
    ...(Object.keys(categoryLabels) as ProjectCategory[]).map((c) => ({ value: c, label: tr(categoryLabels[c], language) })),
  ]
  const count = (f: Filter) => mainProjects.filter((p) => f === "all" || p.category === f).length
  const visible = mainProjects.filter((p) => filter === "all" || p.category === filter)

  return (
    <>
      <PageHeader
        back={{ href: "/", label: t("backToHome") }}
        eyebrow={`${t("index")} — ${mainProjects.length} ${t("projectsCount")}`}
        title={
          <>
            {t("work")}
            <span className="text-primary">.</span>
          </>
        }
        intro={t("projectsIntro")}
      >
        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label={t("category")}>
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              data-active={filter === f.value}
              aria-pressed={filter === f.value}
              className="chip"
            >
              {f.label}
              <span className="opacity-60">{count(f.value)}</span>
            </button>
          ))}
        </div>
      </PageHeader>

      <section className="container pb-24">
        <motion.ul layout className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => {
              const index = mainProjects.indexOf(project)
              return (
                <motion.li
                  layout
                  key={project.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link href={`/projects/${project.slug}`} className="group block" data-cursor={t("cursorView")}>
                    <RevealImage className="rounded-md">
                      <ProjectCover
                        project={project}
                        index={index}
                        className="aspect-[4/3] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </RevealImage>
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">
                          {String(index + 1).padStart(2, "0")} · {tr(categoryLabels[project.category], language)}
                          {project.context && ` · ${tr(project.context, language)}`}
                        </p>
                        <h2 className="mt-2 font-serif text-3xl leading-tight transition-colors group-hover:text-primary">
                          {titleOf(project, language)}
                        </h2>
                      </div>
                      <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border transition-all duration-300 group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {tr(project.description, language)}
                    </p>
                    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                      {project.tags.join(" · ")}
                      {project.links?.[0] && (
                        <span className="text-foreground">↗ {prettyUrl(project.links[0].href)}</span>
                      )}
                    </p>
                  </Link>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </motion.ul>
      </section>

      <section className="border-t border-border bg-card/60">
        <div className="container grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-3">
            <SectionLabel index="—">{t("archive")}</SectionLabel>
            <p className="mt-4 text-sm text-muted-foreground">{t("archiveIntro")}</p>
          </div>
          <ul className="border-t border-foreground/80 md:col-span-9">
            {archivedProjects.map((project, i) => (
              <Reveal as="li" key={project.slug} delay={Math.min(i, 6) * 0.02}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group grid grid-cols-12 items-baseline gap-3 border-b border-border py-4"
                  data-cursor={t("cursorView")}
                >
                  <span className="col-span-8 font-serif text-xl transition-colors group-hover:text-primary md:col-span-5 md:text-2xl">
                    {titleOf(project, language)}
                  </span>
                  <span className="eyebrow col-span-4 text-right md:col-span-2 md:text-left">
                    {tr(categoryLabels[project.category], language)}
                  </span>
                  <span className="hidden font-mono text-xs text-muted-foreground md:col-span-4 md:block">
                    {project.tags.slice(0, 3).join(" · ")}
                  </span>
                  <ArrowUpRight className="hidden h-4 w-4 justify-self-end text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary md:col-span-1 md:block" />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
