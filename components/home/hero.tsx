"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowDownRight, ArrowRight, Download } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import CountUp from "@/components/motion/count-up"
import Magnetic from "@/components/motion/magnetic"
import { SplitText } from "@/components/reveal"
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
  const sectionRef = useRef<HTMLElement>(null)
  // Parallaxe douce : le nom monte moins vite que la page et s'estompe
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "28%"])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.15])

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
    <section ref={sectionRef} id="home" className="relative flex min-h-[100svh] flex-col pt-16">
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
          <span className="hidden sm:inline">{t("portfolioLabel")} — {new Date().getFullYear()}</span>
          <span>
            {t("basedIn")} · <DoualaClock />
          </span>
        </motion.div>

        {/* Nom */}
        <div className="flex flex-1 flex-col justify-center py-12 md:py-16">
          <motion.h1
            style={{ y: titleY, opacity: titleOpacity }}
            className="font-serif text-[clamp(3.5rem,13.5vw,13rem)] leading-[0.86] tracking-[-0.02em]"
          >
            <span className="block">
              <SplitText text="Foko" delay={0.15} animateOnMount />
            </span>
            <span className="flex items-baseline gap-[0.18em]">
              <SplitText text="Junior" delay={0.35} animateOnMount className="italic text-primary" />
              <motion.span
                initial={reduce ? false : { opacity: 0, x: -20, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 1, delay: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                className="hidden md:block"
              >
                <ArrowDownRight aria-hidden strokeWidth={1} className="h-[0.55em] w-[0.55em] shrink-0 text-foreground/80" />
              </motion.span>
            </span>
          </motion.h1>

          <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:items-end">
            <motion.div {...rise(0.35)} className="md:col-span-6 lg:col-span-5">
              <p className="eyebrow mb-3">{t("heroRole")}</p>
              <p className="text-lg leading-relaxed text-foreground/80 md:text-xl">{t("heroLead")}</p>
            </motion.div>

            <motion.div
              {...rise(0.45)}
              className="flex flex-wrap gap-3 md:col-span-6 md:justify-end lg:col-span-7"
            >
              <Magnetic>
                <Link href="/projects" className="btn btn-solid group">
                  {t("viewMyWork")}
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Magnetic>
                <a href={site.cv} download className="btn btn-outline">
                  <Download />
                  {t("downloadCV")}
                </a>
              </Magnetic>
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
              <dd className="font-serif text-2xl md:text-5xl">
                <CountUp value={s.value} />
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}
