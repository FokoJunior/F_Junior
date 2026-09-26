"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"
import PageHeader from "@/components/page-header"
import ProjectCover from "@/components/project-cover"
import { Reveal } from "@/components/reveal"
import { tr } from "@/lib/i18n"
import { categoryLabels, getProject, mainProjects, projects, shotsOf } from "@/lib/projects"

export default function ProjectDetail({ slug }: { slug: string }) {
  const { t, language } = useLanguage()
  const project = getProject(slug)!
  const list = project.archive ? projects : mainProjects
  const index = list.indexOf(project)
  const next = list[(index + 1) % list.length]
  const shots = shotsOf(project)
  const desktop = shots.filter((s) => !s.mobile)
  const mobile = shots.filter((s) => s.mobile)
  const [open, setOpen] = useState<number | null>(null)

  const meta = [
    { label: t("category"), value: tr(categoryLabels[project.category], language) },
    ...(project.context ? [{ label: t("context"), value: tr(project.context, language) }] : []),
    { label: t("stack"), value: project.tags.join(", ") },
  ]

  const openShot = open !== null ? shots[open] : null
  const step = (d: number) => setOpen((i) => (i === null ? i : (i + d + shots.length) % shots.length))

  return (
    <article>
      <PageHeader
        back={{ href: "/projects", label: t("backToProjects") }}
        eyebrow={`${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`}
        title={project.title}
        intro={tr(project.description, language)}
      >
        {project.links && project.links.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-3">
            {project.links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn group ${i === 0 ? "btn-solid" : "btn-outline"}`}
              >
                {i === 0 && `${t("visitSite")} — `}
                {tr(link.label, language)}
                <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        )}
      </PageHeader>

      <div className="container">
        {/* Visuel principal */}
        <Reveal>
          {desktop[0] ? (
            <button
              type="button"
              onClick={() => setOpen(shots.indexOf(desktop[0]))}
              className="block w-full overflow-hidden rounded-md border border-border bg-muted"
              aria-label={`${project.title} — 1`}
            >
              <img src={desktop[0].src} alt={`${project.title} — capture 1`} className="w-full" />
            </button>
          ) : (
            <ProjectCover
              project={project}
              index={index}
              size="lg"
              className="mx-auto aspect-[16/10] w-full rounded-md md:aspect-[21/9] [&_img]:object-contain"
            />
          )}
        </Reveal>

        <div className="grid gap-12 py-16 md:grid-cols-12 md:py-24">
          <Reveal className="md:col-span-4">
            <dl className="border-t border-foreground/80">
              {meta.map((m) => (
                <div key={m.label} className="grid grid-cols-3 gap-4 border-b border-border py-4">
                  <dt className="eyebrow pt-0.5">{m.label}</dt>
                  <dd className="col-span-2 text-sm">{m.value}</dd>
                </div>
              ))}
              {project.links && project.links.length > 0 && (
                <div className="grid grid-cols-3 gap-4 border-b border-border py-4">
                  <dt className="eyebrow pt-0.5">{t("links")}</dt>
                  <dd className="col-span-2 space-y-1 text-sm">
                    {project.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        {tr(link.label, language)}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>

          <div className="space-y-14 md:col-span-7 md:col-start-6">
            <Reveal>
              <p className="eyebrow mb-4">{t("overview")}</p>
              <p className="font-serif text-2xl leading-snug md:text-3xl">{tr(project.description, language)}</p>
              {project.note && (
                <p className="mt-6 border-l-2 border-primary pl-4 text-sm text-muted-foreground">
                  {tr(project.note, language)}
                </p>
              )}
            </Reveal>

            {project.features && project.features.length > 0 && (
              <Reveal>
                <p className="eyebrow mb-4">{t("features")}</p>
                <ol className="border-t border-border">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex gap-6 border-b border-border py-4">
                      <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                      <span>{tr(feature, language)}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}
          </div>
        </div>

        {/* Galerie */}
        {shots.length > 1 && (
          <section className="pb-20 md:pb-28">
            <p className="eyebrow mb-6 border-t border-foreground/80 pt-4 !text-foreground">
              {t("projectGallery")} · {shots.length}
            </p>
            {desktop.length > 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                {desktop.slice(1).map((shot) => (
                  <Reveal key={shot.src}>
                    <button
                      type="button"
                      onClick={() => setOpen(shots.indexOf(shot))}
                      className="group block w-full overflow-hidden rounded-md border border-border bg-muted"
                    >
                      <img
                        src={shot.src}
                        alt={`${project.title} — capture ${shots.indexOf(shot) + 1}`}
                        loading="lazy"
                        className="w-full transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    </button>
                  </Reveal>
                ))}
              </div>
            )}
            {mobile.length > 0 && (
              <div className="mt-10 flex flex-wrap justify-center gap-6 rounded-md bg-card p-6 md:gap-10 md:p-12">
                {mobile.map((shot) => (
                  <Reveal key={shot.src}>
                    <button
                      type="button"
                      onClick={() => setOpen(shots.indexOf(shot))}
                      className="block w-[200px] overflow-hidden rounded-[1.6rem] border-[6px] border-foreground bg-foreground shadow-xl md:w-[240px]"
                    >
                      <img
                        src={shot.src}
                        alt={`${project.title} — mobile`}
                        loading="lazy"
                        className="w-full rounded-[1.1rem]"
                      />
                    </button>
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-[min(96vw,1400px)] border-none bg-transparent p-0 shadow-none [&>button]:hidden">
          <DialogTitle className="sr-only">{project.title}</DialogTitle>
          {openShot && (
            <div className="relative">
              <img
                src={openShot.src}
                alt={project.title}
                className={`mx-auto max-h-[85vh] rounded-md ${openShot.mobile ? "w-auto" : "w-full object-contain"}`}
              />
              <div className="mt-3 flex items-center justify-center gap-3 text-white">
                <button type="button" onClick={() => step(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-black/60" aria-label={t("prev")}>
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs">
                  {(open ?? 0) + 1} / {shots.length}
                </span>
                <button type="button" onClick={() => step(1)} className="grid h-10 w-10 place-items-center rounded-full bg-black/60" aria-label={t("next")}>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setOpen(null)} className="grid h-10 w-10 place-items-center rounded-full bg-black/60" aria-label={t("close")}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Link href={`/projects/${next.slug}`} className="group block border-t border-border">
        <div className="container flex items-end justify-between gap-6 py-14 md:py-20">
          <div>
            <p className="eyebrow mb-3">{t("nextProject")}</p>
            <p className="font-serif text-4xl leading-none transition-colors group-hover:text-primary md:text-7xl">
              {next.title}
            </p>
          </div>
          <ArrowRight className="h-8 w-8 shrink-0 transition-transform group-hover:translate-x-2 md:h-12 md:w-12" strokeWidth={1} />
        </div>
      </Link>
    </article>
  )
}
