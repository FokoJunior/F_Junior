"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ArrowUpRight, Gamepad2 } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import Magnetic from "@/components/motion/magnetic"
import { tr, type T } from "@/lib/i18n"

const copy = {
  eyebrow: {
    fr: "Erreur 404 · Page introuvable",
    en: "Error 404 · Page not found",
    de: "Fehler 404 · Seite nicht gefunden",
    zh: "错误 404 · 页面未找到",
  },
  status: {
    fr: "Route hors-piste",
    en: "Off the map",
    de: "Abseits der Route",
    zh: "迷路了",
  },
  heading: {
    fr: "Cette page s'est volatilisée.",
    en: "This page has vanished.",
    de: "Diese Seite ist verschwunden.",
    zh: "此页面已不存在。",
  },
  description: {
    fr: "Le lien que vous avez suivi n'existe plus ou a changé d'adresse. Retournez à l'accueil, explorez mes projets, ou profitez-en pour faire une petite partie.",
    en: "The link you followed no longer exists or has moved. Head back home, explore my projects, or take a quick break with a mini-game.",
    de: "Der Link existiert nicht mehr oder wurde verschoben. Kehre zur Startseite zurück, entdecke meine Projekte oder mach eine kurze Spielpause.",
    zh: "你访问的链接已失效或已迁移。你可以返回首页、浏览我的项目，或者顺便玩一局小游戏。",
  },
  home: {
    fr: "Retour à l'accueil",
    en: "Back to home",
    de: "Zur Startseite",
    zh: "返回首页",
  },
  projects: {
    fr: "Voir les projets",
    en: "View projects",
    de: "Projekte ansehen",
    zh: "查看项目",
  },
  play: {
    fr: "Faire une partie",
    en: "Play a game",
    de: "Ein Spiel spielen",
    zh: "玩个小游戏",
  },
  quickNav: {
    fr: "Destinations rapides",
    en: "Quick links",
    de: "Schnellzugriff",
    zh: "快速导航",
  },
} satisfies Record<string, T>

export default function NotFoundView() {
  const { t, language } = useLanguage()
  const reduce = useReducedMotion()

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, delay, ease: [0.2, 0.8, 0.2, 1] as const },
  })

  const quickLinks = [
    { href: "/", label: t("home"), num: "01" },
    { href: "/projects", label: t("work"), num: "02" },
    { href: "/resume", label: t("resume"), num: "03" },
    { href: "/blog", label: t("blog"), num: "04" },
    { href: "/jeux", label: t("games"), num: "05" },
  ]

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-between pt-28 pb-16 md:pt-36">
      <div className="container flex flex-1 flex-col justify-between gap-14">
        {/* Top metadata line */}
        <motion.div
          {...rise(0)}
          className="eyebrow flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5"
        >
          <span className="inline-flex items-center gap-2 !text-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-blink absolute inline-flex h-full w-full rounded-full bg-primary" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {tr(copy.eyebrow, language)}
          </span>
          <span>{tr(copy.status, language)}</span>
        </motion.div>

        {/* Main 404 hero */}
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <motion.div {...rise(0.1)} className="md:col-span-7">
            <p
              aria-hidden
              className="select-none font-serif text-[clamp(6.5rem,24vw,17rem)] leading-[0.8] tracking-[-0.03em]"
            >
              4
              <motion.span
                className="inline-block italic text-primary"
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                0
              </motion.span>
              4<span className="text-primary">.</span>
            </p>
          </motion.div>

          <motion.div {...rise(0.2)} className="space-y-5 md:col-span-5 md:pb-3">
            <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
              {tr(copy.heading, language)}
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              {tr(copy.description, language)}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Magnetic>
                <Link href="/" className="btn btn-solid group">
                  <ArrowLeft className="transition-transform group-hover:-translate-x-1" />
                  {tr(copy.home, language)}
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/jeux" className="btn btn-outline">
                  <Gamepad2 />
                  {tr(copy.play, language)}
                </Link>
              </Magnetic>
            </div>
          </motion.div>
        </div>

        {/* Quick links footer */}
        <motion.div {...rise(0.3)} className="border-t border-border pt-8">
          <p className="eyebrow mb-4">{tr(copy.quickNav, language)}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-md border border-border bg-card/60 px-4 py-3 transition-colors hover:border-primary hover:bg-card"
              >
                <div>
                  <span className="block font-mono text-[0.65rem] text-primary">{item.num}</span>
                  <span className="font-serif text-xl">{item.label}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
