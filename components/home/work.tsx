"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { Emphasis, Reveal, SectionLabel } from "@/components/reveal"
import ProjectCover from "@/components/project-cover"
import { tr } from "@/lib/i18n"
import { categoryLabels, featuredProjects, mainProjects, titleOf } from "@/lib/projects"

export default function Work() {
  const { t, language } = useLanguage()
  const listRef = useRef<HTMLUListElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  // Aperçu flottant qui suit le curseur (desktop uniquement)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 30 })
  const sy = useSpring(y, { stiffness: 300, damping: 30 })

  const onMove = (e: React.MouseEvent) => {
    const rect = listRef.current?.getBoundingClientRect()
    if (!rect) return
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
  }

  return (
    <section id="projects" className="container py-24 md:py-36">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <Reveal>
            <SectionLabel index="03">{t("selectedWork")}</SectionLabel>
          </Reveal>
        </div>
        <Reveal className="flex flex-col gap-6 md:col-span-9 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl">
            <Emphasis text={t("workHeadline")} />
          </h2>
          <Link href="/projects" className="btn btn-outline group shrink-0">
            {t("viewAllProjects")} ({mainProjects.length})
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <ul
        ref={listRef}
        onMouseMove={onMove}
        onMouseLeave={() => setHovered(null)}
        className="relative mt-16 border-t border-foreground/80"
      >
        {featuredProjects.map((project, i) => (
          <Reveal as="li" key={project.slug} delay={i * 0.04}>
            <Link
              href={`/projects/${project.slug}`}
              onMouseEnter={() => setHovered(i)}
              data-cursor={t("cursorView")}
              className="group grid grid-cols-12 items-center gap-4 border-b border-border py-6 transition-colors md:py-8"
            >
              <span className="col-span-2 font-mono text-xs text-muted-foreground md:col-span-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="col-span-10 font-serif text-3xl leading-tight transition-[transform,color] duration-500 group-hover:translate-x-2 group-hover:text-primary md:col-span-6 md:text-5xl">
                {titleOf(project, language)}
              </span>
              <span className="eyebrow col-span-5 col-start-3 md:col-span-2 md:col-start-auto">
                {tr(categoryLabels[project.category], language)}
                {project.context && (
                  <span className="hidden normal-case tracking-normal md:block">{tr(project.context, language)}</span>
                )}
              </span>
              <span className="hidden font-mono text-xs text-muted-foreground md:col-span-2 md:block">
                {project.tags.slice(0, 2).join(" · ")}
              </span>
              <span className="col-span-5 flex justify-end md:col-span-1">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-border transition-all duration-300 group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </span>
            </Link>
          </Reveal>
        ))}

        <AnimatePresence>
          {hovered !== null && (
            <motion.div
              key="preview"
              aria-hidden
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              style={{ left: sx, top: sy }}
              className="pointer-events-none absolute z-10 hidden h-56 w-80 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md shadow-2xl [@media(hover:hover)]:lg:block"
            >
              <ProjectCover project={featuredProjects[hovered]} index={hovered} className="h-full w-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </ul>
    </section>
  )
}
