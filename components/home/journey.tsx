"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { tr } from "@/lib/i18n"
import { Emphasis, Reveal, SectionLabel } from "@/components/reveal"
import { experience } from "@/lib/resume"

export default function Journey() {
  const { t, language } = useLanguage()
  const roles = experience.filter((e) => e.points.length > 0)

  return (
    <section id="journey" className="border-y border-border bg-card/60">
      <div className="container py-24 md:py-36">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Reveal>
              <SectionLabel index="04">{t("journey")}</SectionLabel>
            </Reveal>
          </div>
          <Reveal className="flex flex-col gap-6 md:col-span-9 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-2xl font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl">
              <Emphasis text={t("journeyHeadline")} />
            </h2>
            <Link href="/resume" className="btn btn-outline group shrink-0">
              {t("fullResume")}
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <ol className="mt-16 border-t border-foreground/80">
          {roles.map((job, i) => (
            <Reveal
              as="li"
              key={`${job.company}-${job.period.fr}`}
              delay={i * 0.03}
              className="grid gap-3 border-b border-border py-7 md:grid-cols-12 md:gap-6"
            >
              <div className="md:col-span-3">
                <p className="font-mono text-xs text-muted-foreground">{tr(job.period, language)}</p>
                {job.duration && <p className="mt-1 font-mono text-xs text-muted-foreground/70">{tr(job.duration, language)}</p>}
              </div>
              <div className="md:col-span-4">
                <h3 className="font-serif text-2xl leading-tight md:text-3xl">{job.company}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tr(job.role, language)} · {tr(job.place, language)}
                </p>
              </div>
              <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/80 md:col-span-5">
                {job.points.map((point) => (
                  <li key={point.fr} className="flex gap-3">
                    <span className="mt-[0.7em] h-px w-3 shrink-0 bg-primary" />
                    {tr(point, language)}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
