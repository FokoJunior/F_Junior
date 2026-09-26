"use client"

import { useLanguage } from "@/components/language-provider"
import { tr } from "@/lib/i18n"
import { categoryLabels, coverOf, prettyUrl, titleOf, type Project } from "@/lib/projects"
import { cn } from "@/lib/utils"

const tones = [
  "bg-foreground text-background",
  "bg-primary text-primary-foreground",
  "bg-muted text-foreground",
]

/** Visuel d'un projet : sa capture principale si elle existe, sinon une couverture typographique. */
export default function ProjectCover({
  project,
  index = 0,
  className,
  size = "md",
}: {
  project: Project
  index?: number
  className?: string
  size?: "md" | "lg"
}) {
  const { language } = useLanguage()
  const cover = coverOf(project)

  if (cover) {
    return (
      <div className={cn("overflow-hidden bg-muted", className)}>
        <img src={cover} alt={titleOf(project, language)} loading="lazy" className="h-full w-full object-cover object-top" />
      </div>
    )
  }

  const firstLink = project.links?.[0]?.href
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex flex-col justify-between overflow-hidden p-5 md:p-7",
        tones[index % tones.length],
        className,
      )}
    >
      <div className="flex items-start justify-between font-mono text-[0.65rem] uppercase tracking-[0.14em] opacity-70">
        <span>{tr(categoryLabels[project.category], language)}</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <p
        className={cn(
          "font-serif leading-[0.9] tracking-tight",
          size === "lg" ? "text-[clamp(3rem,9vw,8rem)]" : "text-4xl md:text-5xl",
        )}
      >
        {titleOf(project, language)}
      </p>
      <div className="flex items-end justify-between gap-4 font-mono text-[0.65rem] opacity-70">
        <span className="truncate">{project.tags.join(" · ")}</span>
        {firstLink && <span className="shrink-0">{prettyUrl(firstLink)}</span>}
      </div>
    </div>
  )
}
