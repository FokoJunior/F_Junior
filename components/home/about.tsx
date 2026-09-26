"use client"

import { useLanguage } from "@/components/language-provider"
import { tr } from "@/lib/i18n"
import { Reveal, SectionLabel } from "@/components/reveal"
import { experience } from "@/lib/resume"
import { site, stack } from "@/lib/site"

export function StackMarquee() {
  const items = [...stack, ...stack]
  return (
    <div className="overflow-hidden border-y border-border bg-foreground py-4 text-background" aria-label="Stack technique">
      <div className="animate-marquee flex w-max items-center gap-8 pr-8">
        {items.map((tech, i) => (
          <span
            key={i}
            className="flex items-center gap-8 font-serif text-2xl italic md:text-3xl"
            aria-hidden={i >= stack.length}
          >
            {tech}
            <span className="text-base not-italic text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function About() {
  const { t, language } = useLanguage()
  const latest = experience[0]

  const facts = [
    { label: t("studyLabel"), value: t("currentStudy") },
    { label: t("lastRole"), value: `${tr(latest.role, language)} — ${latest.company}` },
    { label: t("basedLabel"), value: t("locationValue") },
    { label: t("spokenLabel"), value: `${t("french")}, ${t("english")}` },
  ]

  return (
    <section id="about" className="container grid gap-10 py-24 md:grid-cols-12 md:py-36">
      <div className="md:col-span-3">
        <Reveal>
          <SectionLabel index="01">{t("aboutMe")}</SectionLabel>
        </Reveal>
      </div>

      <div className="md:col-span-9">
        <Reveal>
          <p className="font-serif text-3xl leading-[1.12] tracking-tight md:text-5xl lg:text-[3.4rem]">
            {t("aboutLead")}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 md:grid-cols-9 md:gap-12">
          <Reveal className="md:col-span-4">
            <figure className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-md bg-muted">
                <img
                  src={site.portrait}
                  alt={site.fullName}
                  loading="lazy"
                  className="h-full w-full object-cover object-[50%_18%] grayscale transition-[filter] duration-700 hover:grayscale-0"
                />
              </div>
              <figcaption className="eyebrow mt-3 flex justify-between">
                <span>{site.fullName}</span>
                <span>Douala</span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="flex flex-col justify-between gap-10 md:col-span-5">
            <Reveal delay={0.05} className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>{t("aboutBody1")}</p>
              <p>{t("aboutBody2")}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="grid grid-cols-1 border-t border-border sm:grid-cols-2">
                {facts.map((f) => (
                  <div key={f.label} className="border-b border-border py-4 sm:pr-6">
                    <dt className="eyebrow mb-1.5">{f.label}</dt>
                    <dd className="text-sm">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
