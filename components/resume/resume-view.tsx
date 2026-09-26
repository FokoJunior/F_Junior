"use client"

import type React from "react"
import { Download, Printer } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { tr } from "@/lib/i18n"
import PageHeader from "@/components/page-header"
import { Reveal } from "@/components/reveal"
import { certifications, education, experience, interests, profile, spokenLanguages } from "@/lib/resume"
import { site, skillGroups } from "@/lib/site"

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="break-inside-avoid">
      <h2 className="eyebrow mb-5 border-t border-foreground/80 pt-4 !text-foreground">{title}</h2>
      {children}
    </Reveal>
  )
}

export default function ResumeView() {
  const { t, language } = useLanguage()

  const contact = [
    { label: t("email"), value: site.email, href: `mailto:${site.email}` },
    { label: t("phone"), value: site.phone, href: site.phoneHref },
    { label: "WhatsApp", value: "+237 690 713 130", href: site.whatsapp },
    { label: "GitHub", value: "github.com/FokoJunior", href: site.socials.github },
    { label: t("location"), value: t("locationValue") },
  ]

  return (
    <>
      <PageHeader
        back={{ href: "/", label: t("backToHome") }}
        eyebrow={`${t("cvEyebrow")} — 2026`}
        title={
          <>
            Junior Benoît
            <br />
            <span className="italic text-primary">Foko Tadjuige</span>
          </>
        }
        intro={t("resumeIntro")}
      >
        <div className="no-print mt-10 flex flex-wrap gap-3">
          <a href={site.cv} download className="btn btn-solid">
            <Download />
            {t("downloadCV")} (PDF)
          </a>
          <button type="button" onClick={() => window.print()} className="btn btn-outline">
            <Printer />
            {t("print")}
          </button>
        </div>
      </PageHeader>

      <div className="container grid gap-14 pb-24 lg:grid-cols-12">
        {/* Colonne latérale */}
        <aside className="space-y-12 lg:col-span-4">
          <Reveal>
            <div className="aspect-[4/5] max-w-xs overflow-hidden rounded-md bg-muted">
              <img
                src={site.portrait}
                alt={site.fullName}
                className="h-full w-full object-cover object-[50%_18%]"
              />
            </div>
            <p className="mt-4 font-serif text-2xl">{t("heroRole")}</p>
          </Reveal>

          <Block title={t("resume_contact")}>
            <dl className="space-y-3 text-sm">
              {contact.map((c) => (
                <div key={c.label} className="grid grid-cols-3 gap-3">
                  <dt className="eyebrow pt-0.5">{c.label}</dt>
                  <dd className="col-span-2 break-all">
                    {c.href ? (
                      <a href={c.href} className="hover:text-primary">
                        {c.value}
                      </a>
                    ) : (
                      c.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Block>

          <Block title={t("resume_languages")}>
            <ul className="space-y-4">
              {spokenLanguages.map((l) => (
                <li key={l.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{t(l.name)}</span>
                    <span className="font-mono text-xs text-muted-foreground">{t(l.level)}</span>
                  </div>
                  <div className="h-px w-full bg-border">
                    <div className="h-px bg-foreground" style={{ width: `${l.value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Block>

          <Block title={t("technicalSkills")}>
            <dl className="space-y-4">
              {skillGroups.map((g) => (
                <div key={g.key}>
                  <dt className="mb-1 text-sm font-medium">{t(g.key)}</dt>
                  <dd className="font-mono text-xs leading-relaxed text-muted-foreground">{g.items.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </Block>

          <Block title={t("interests")}>
            <p className="text-sm">{interests.map((i) => tr(i, language)).join(" · ")}</p>
          </Block>
        </aside>

        {/* Contenu principal */}
        <div className="space-y-16 lg:col-span-8">
          <Block title={t("profile")}>
            <p className="font-serif text-2xl leading-snug md:text-3xl">{tr(profile, language)}</p>
          </Block>

          <Block title={t("workExperience")}>
            <ol className="relative space-y-10 border-l border-border pl-6 md:pl-8">
              {experience.map((job, i) => (
                <li key={`${job.company}-${job.period.fr}`} className="relative break-inside-avoid">
                  <span
                    className={`absolute -left-[1.84rem] top-2 h-2.5 w-2.5 rounded-full border-2 border-background md:-left-[2.34rem] ${
                      i === 0 ? "bg-primary" : "bg-foreground/40"
                    }`}
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="font-serif text-2xl leading-tight">
                      {tr(job.role, language)} <span className="text-muted-foreground">— {job.company}</span>
                    </h3>
                    <p className="shrink-0 font-mono text-xs text-muted-foreground">{tr(job.period, language)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tr(job.place, language)}
                    {job.duration && ` · ${tr(job.duration, language)}`}
                  </p>
                  {job.points.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm leading-relaxed">
                      {job.points.map((p) => (
                        <li key={p.fr} className="flex gap-3">
                          <span className="mt-[0.7em] h-px w-3 shrink-0 bg-primary" />
                          {tr(p, language)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </Block>

          <Block title={t("education")}>
            <ul className="border-t border-border">
              {education.map((e) => (
                <li key={e.title.fr} className="grid gap-2 border-b border-border py-5 sm:grid-cols-12 sm:gap-6">
                  <p className="font-mono text-xs text-muted-foreground sm:col-span-3">{tr(e.period, language)}</p>
                  <div className="sm:col-span-9">
                    <h3 className="flex flex-wrap items-center gap-3 font-medium">
                      {tr(e.title, language)}
                      {e.current && (
                        <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-primary-foreground">
                          {t("inProgress")}
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tr(e.school, language)}
                      {e.mention && ` · ${tr(e.mention, language)}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Block>

          <Block title={t("certifications")}>
            <ul className="grid gap-px border border-border bg-border sm:grid-cols-3">
              {certifications.map((c) => (
                <li key={c.title} className="bg-background p-5">
                  <p className="eyebrow">{c.inProgress ? t("inProgress") : c.date}</p>
                  <p className="mt-3 font-serif text-xl leading-tight">{c.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.issuer}</p>
                </li>
              ))}
            </ul>
          </Block>
        </div>
      </div>
    </>
  )
}
