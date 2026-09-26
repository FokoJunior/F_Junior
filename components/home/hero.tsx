"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowDownRight, ArrowRight, Download } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { experience } from "@/lib/resume"
import { site } from "@/lib/site"

function DoualaClock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Douala",
      }).format(new Date())
    setTime(format())
    const id = setInterval(() => setTime(format()), 15_000)
    return () => clearInterval(id)
  }, [])

  return <span className="tabular-nums">{time ?? "--:--"}</span>
}

export default function Hero() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] as const },
  })

  const stats = [
    { value: "20+", label: t("statProjects") },
    { value: String(experience.filter((e) => e.points.length > 0).length), label: t("statExp") },
    { value: "M2 GLSI", label: t("statStudy") },
  ]

  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col pt-16">
      <div className="container flex flex-1 flex-col">
        {/* Ligne de métadonnées */}
        <motion.div
          {...rise(0)}
          className="eyebrow flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border py-5"
        >
          <span className="inline-flex items-center gap-2 !text-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-blink absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t("availableForWork")}
          </span>
          <span className="hidden sm:inline">Portfolio — {new Date().getFullYear()}</span>
          <span>
            {t("basedIn")} · <DoualaClock />
          </span>
        </motion.div>

        {/* Nom */}
        <div className="flex flex-1 flex-col justify-center py-12 md:py-16">
          <h1 className="font-serif text-[clamp(3.5rem,13.5vw,13rem)] leading-[0.86] tracking-[-0.02em]">
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span {...rise(0.1)} className="block">
                Foko
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span {...rise(0.2)} className="flex items-baseline gap-[0.18em]">
                <span className="italic text-primary">Junior</span>
                <ArrowDownRight
                  aria-hidden
                  strokeWidth={1}
                  className="hidden h-[0.55em] w-[0.55em] shrink-0 text-foreground/80 md:block"
                />
              </motion.span>
            </span>
          </h1>

          <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:items-end">
            <motion.div {...rise(0.35)} className="md:col-span-6 lg:col-span-5">
              <p className="eyebrow mb-3">{t("heroRole")}</p>
              <p className="text-lg leading-relaxed text-foreground/80 md:text-xl">{t("heroLead")}</p>
            </motion.div>

            <motion.div
              {...rise(0.45)}
              className="flex flex-wrap gap-3 md:col-span-6 md:justify-end lg:col-span-7"
            >
              <Link href="/projects" className="btn btn-solid group">
                {t("viewMyWork")}
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href={site.cv} download className="btn btn-outline">
                <Download />
                {t("downloadCV")}
              </a>
            </motion.div>
          </div>
        </div>

        {/* Chiffres clés */}
        <motion.dl
          {...rise(0.55)}
          className="grid grid-cols-3 divide-x divide-border border-t border-border"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse px-3 py-5 first:pl-0 md:px-6 md:py-7">
              <dt className="eyebrow mt-1 !text-[0.62rem] md:!text-[0.7rem]">{s.label}</dt>
              <dd className="font-serif text-2xl md:text-5xl">{s.value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}
