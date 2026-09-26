"use client"

import Link from "next/link"
import { ArrowUp, ArrowUpRight } from "lucide-react"

import { useLanguage } from "@/components/language-provider"
import { Wordmark } from "@/components/navbar"
import { site } from "@/lib/site"

export default function SiteFooter() {
  const { t } = useLanguage()

  const columns = [
    {
      title: "Navigation",
      links: [
        { href: "/#about", label: t("about") },
        { href: "/projects", label: t("work") },
        { href: "/resume", label: t("resume") },
        { href: "/blog", label: t("blog") },
      ],
    },
    {
      title: "Social",
      links: [
        { href: site.socials.github, label: "GitHub", external: true },
        { href: site.socials.linkedin, label: "LinkedIn", external: true },
        { href: site.socials.twitter, label: "Twitter / X", external: true },
      ],
    },
    {
      title: t("contact"),
      links: [
        { href: `mailto:${site.email}`, label: site.email },
        { href: site.phoneHref, label: site.phone },
        { href: site.whatsapp, label: "WhatsApp", external: true },
        { href: site.cv, label: t("downloadCV"), download: true },
      ],
    },
  ]

  return (
    <footer className="no-print relative overflow-hidden border-t border-border">
      <div className="container grid gap-10 py-16 md:grid-cols-12">
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground md:col-span-4">
          {t("heroLead")}
        </p>
        {columns.map((col, i) => (
          <div key={col.title} className={i === columns.length - 1 ? "md:col-span-4" : "md:col-span-2"}>
            <p className="eyebrow mb-4">{col.title}</p>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((link: any) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 hover:text-primary"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ) : link.download ? (
                    <a href={link.href} download className="hover:text-primary">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="break-all hover:text-primary">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container">
        <p aria-hidden className="select-none pb-[0.14em] text-[21vw] leading-[0.8] tracking-tighter text-foreground lg:text-[19vw] 2xl:text-[16rem]">
          <Wordmark />
        </p>
      </div>

      <div className="container flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Foko Junior — FOKO TADJUIGE Benoît Junior (F_Junior). {t("allRightsReserved")}
        </p>
        <p>{t("designedBy")}</p>
        <a href="#top" className="inline-flex items-center gap-1.5 hover:text-foreground">
          {t("backToTop")}
          <ArrowUp className="h-3 w-3" />
        </a>
      </div>
    </footer>
  )
}
