// Base de connaissances de l'assistant, générée à partir des données du site :
// elle reste synchronisée avec ce qui est affiché (projets, CV, compétences, contact).
import { posts } from "@/lib/blog"
import { categoryLabels, mainProjects, archivedProjects, prettyUrl } from "@/lib/projects"
import { certifications, education, experience, interests, profile } from "@/lib/resume"
import { SITE_URL, nameVariants } from "@/lib/seo"
import { site, skillGroups } from "@/lib/site"

const SKILL_LABELS: Record<string, string> = {
  skLanguages: "Langages",
  skFrameworks: "Frameworks",
  skAi: "IA & automatisation",
  skData: "Bases de données & ORM",
  skPayments: "Paiements & authentification",
  skDevops: "Outils & DevOps",
  skMethods: "Méthodologies",
}

function ageOn(date: Date) {
  const birth = new Date("2004-10-27")
  let age = date.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    date.getMonth() < birth.getMonth() || (date.getMonth() === birth.getMonth() && date.getDate() < birth.getDate())
  if (beforeBirthday) age--
  return age
}

export function buildKnowledge(now = new Date()) {
  const projects = mainProjects
    .map((p) => {
      const lines = [
        `### ${p.title} — [fiche](/projects/${p.slug})`,
        `- Catégorie : ${categoryLabels[p.category].fr}${p.context ? ` · Contexte : ${typeof p.context === "string" ? p.context : p.context.fr}` : ""}`,
        `- Description : ${p.description.fr}`,
        `- Technologies : ${p.tags.join(", ")}`,
      ]
      if (p.features?.length) lines.push(`- Fonctionnalités : ${p.features.map((f) => f.fr).join(" ; ")}`)
      if (p.links?.length)
        lines.push(`- Liens : ${p.links.map((l) => `[${typeof l.label === "string" ? l.label : l.label.fr}](${l.href})`).join(", ")}`)
      if (p.note) lines.push(`- Précision : ${p.note.fr}`)
      return lines.join("\n")
    })
    .join("\n\n")

  const archives = archivedProjects.map((p) => `${p.title} (${p.tags.join(", ")})`).join(" ; ")

  const jobs = experience
    .map(
      (e) =>
        `- **${e.role.fr}** — ${e.company} (${e.place.fr}), ${e.period.fr}${e.duration ? ` · ${e.duration.fr}` : ""}` +
        (e.points.length ? `\n  ${e.points.map((pt) => pt.fr).join(" ; ")}` : ""),
    )
    .join("\n")

  const schools = education
    .map(
      (e) =>
        `- ${e.title.fr} — ${typeof e.school === "string" ? e.school : e.school.fr}, ${e.period.fr}${e.mention ? ` (${e.mention.fr})` : ""}${e.current ? " — en cours" : ""}`,
    )
    .join("\n")

  const certs = certifications
    .map((c) => `- ${c.title} (${c.issuer})${c.inProgress ? " — en cours" : c.date ? ` — ${c.date}` : ""}`)
    .join("\n")

  const skills = skillGroups.map((g) => `- ${SKILL_LABELS[g.key] ?? g.key} : ${g.items.join(", ")}`).join("\n")

  const blog = posts
    .filter((p) => p.content)
    .map((p) => `- [${p.title.fr}](/blog/${p.slug})`)
    .join("\n")

  return `
## Identité
- Nom : Junior Benoît FOKO TADJUIGE — on le cherche aussi sous : ${nameVariants.join(", ")}
- Titre : ${site.role}
- Âge : ${ageOn(now)} ans (né le 27 octobre 2004)
- Ville : ${site.location}
- Statut : étudiant en Master 2 Génie Logiciel & Systèmes d'Information à l'IUC (Douala), depuis septembre 2026
- Disponibilité : ouvert aux opportunités (emploi, freelance, stage, collaborations techniques)

## Profil
${profile.fr}

## Contact
- Email : [${site.email}](mailto:${site.email})
- Téléphone : ${site.phone} — WhatsApp : [wa.me/237690713130](${site.whatsapp})
- GitHub : [github.com/FokoJunior](${site.socials.github}) (la plupart des dépôts sont privés)
- LinkedIn : [Foko Junior](${site.socials.linkedin})
- X (Twitter) : [@f_junior_2022](${site.socials.x})
- Formulaire : [section contact](/#contact) — CV PDF : [télécharger](${site.cv}) — CV en ligne : [page CV](/resume)
- Site : ${prettyUrl(SITE_URL)}

## Expériences professionnelles
${jobs}

## Formation
${schools}

## Certifications
${certs}

## Compétences
${skills}
- Langues parlées : français (courant), anglais (notions)
- Centres d'intérêt : ${interests.map((i) => i.fr).join(", ")}

## Projets principaux (${mainProjects.length})
${projects}

## Projets d'études / archives
${archives}

## Articles du blog
${blog}
`.trim()
}
