"use client"

import { useLanguage } from "@/components/language-provider"
import { Emphasis, Reveal, SectionLabel } from "@/components/reveal"
import { skillGroups } from "@/lib/site"

export default function Skills() {
  const { t } = useLanguage()

  return (
    <section id="skills" className="container py-24 md:py-36">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <Reveal>
            <SectionLabel index="02">{t("mySkills")}</SectionLabel>
          </Reveal>
        </div>
        <Reveal className="md:col-span-9">
          <h2 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl">
            <Emphasis text={t("skillsHeadline")} />
          </h2>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((group, i) => (
          <Reveal
            key={group.key}
            delay={(i % 4) * 0.05}
            className="group flex flex-col bg-background p-6 transition-colors hover:bg-card md:p-8"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span className="h-2 w-2 rounded-full bg-border transition-colors group-hover:bg-primary" />
            </div>
            <h3 className="mt-8 font-serif text-[1.7rem] leading-tight">{t(group.key)}</h3>
            <ul className="mt-6 space-y-1.5 font-mono text-xs text-muted-foreground">
              {group.items.map((item) => (
                <li key={item} className="transition-colors group-hover:text-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
        <div className="hidden flex-col justify-end bg-foreground p-6 text-background md:p-8 lg:flex">
          <p className="font-serif text-[1.7rem] italic leading-tight">+ 20</p>
          <p className="eyebrow mt-2 !text-background/60">{t("statProjects")}</p>
        </div>
      </div>
    </section>
  )
}
