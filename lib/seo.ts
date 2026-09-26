import { education } from "@/lib/resume"
import { site } from "@/lib/site"

/** URL principale (canonique). Surchargeable via NEXT_PUBLIC_SITE_URL ; le miroir fjunior.uniprice.com y renvoie. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://fjunior.tchoop237.com").replace(/\/$/, "")

/** Toutes les façons dont on cherche F_Junior : elles figurent dans les métadonnées et les données structurées. */
export const nameVariants = [
  "Foko Junior",
  "FOKO TADJUIGE Benoît Junior",
  "Foko Tadjuige Benoit Junior",
  "Junior Benoît FOKO TADJUIGE",
  "FOKO TADJUIGE B. JUNIOR",
  "Foko Tadjuige B. Junior",
  "F_Junior",
  "F Junior",
  "FokoJunior",
]

export const defaultTitle = "Foko Junior (F_Junior) — Développeur Full Stack · Mobile · IA à Douala"

export const defaultDescription =
  "Portfolio officiel de Foko Junior — FOKO TADJUIGE Benoît Junior, alias F_Junior : développeur Full Stack, Mobile (Flutter) et IA à Douala, Cameroun. Étudiant en Master 2 Génie Logiciel à l'IUC. Projets : TCHOOP237, Oystr, FermeConnect, DanAid, JudgeX, Stock Junior."

export const keywords = [
  ...nameVariants,
  "Foko Junior développeur",
  "Foko Junior Douala",
  "Foko Junior portfolio",
  "F_Junior portfolio",
  "Foko Tadjuige",
  "développeur Full Stack Douala",
  "développeur Full Stack Cameroun",
  "développeur Next.js Cameroun",
  "développeur Flutter Cameroun",
  "développeur mobile Douala",
  "développeur IA Cameroun",
  "freelance développeur web Cameroun",
  "Génie Logiciel IUC",
  "TypeScript",
  "Next.js",
  "React",
  "Flutter",
  "Intelligence Artificielle",
  "TCHOOP237",
  "Oystr",
  "FermeConnect",
  "DanAid",
  "JudgeX",
]

export const personId = `${SITE_URL}/#person`
export const websiteId = `${SITE_URL}/#website`

export const personJsonLd = {
  "@type": "Person",
  "@id": personId,
  name: "Foko Junior",
  alternateName: nameVariants.filter((n) => n !== "Foko Junior"),
  givenName: "Junior Benoît",
  familyName: "FOKO TADJUIGE",
  additionalName: "Benoît",
  jobTitle: "Développeur Full Stack · Mobile · IA",
  description: defaultDescription,
  url: SITE_URL,
  image: `${SITE_URL}${site.portrait}`,
  email: `mailto:${site.email}`,
  telephone: "+237690713130",
  birthDate: "2004-10-27",
  nationality: { "@type": "Country", name: "Cameroun" },
  address: { "@type": "PostalAddress", addressLocality: "Douala", addressRegion: "Littoral", addressCountry: "CM" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Institut Universitaire de la Côte (IUC)", address: "Douala, Cameroun" },
    { "@type": "CollegeOrUniversity", name: "Université Adventiste Cosendaï", address: "Douala, Cameroun" },
    { "@type": "CollegeOrUniversity", name: "JFN HUI", address: "Douala, Cameroun" },
  ],
  hasCredential: education.map((e) => ({ "@type": "EducationalOccupationalCredential", name: e.title.fr })),
  knowsLanguage: ["fr", "en"],
  knowsAbout: [
    "TypeScript", "JavaScript", "Next.js", "React", "Node.js", "Express.js", "Flutter", "Dart", "Python", "PHP",
    "PostgreSQL", "Supabase", "Prisma", "Stripe", "Docker", "Intelligence Artificielle", "Agents IA",
    "Génie Logiciel", "Développement mobile", "Développement web",
  ],
  sameAs: [...Object.values(site.socials), site.whatsapp],
}

export const websiteJsonLd = {
  "@type": "WebSite",
  "@id": websiteId,
  url: SITE_URL,
  name: "Foko Junior — Portfolio",
  alternateName: ["F_Junior", "Foko Tadjuige B. Junior", "FOKO TADJUIGE Benoît Junior"],
  inLanguage: ["fr", "en", "de", "zh"],
  author: { "@id": personId },
  publisher: { "@id": personId },
}

export function jsonLdGraph(...nodes: object[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes })
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}
