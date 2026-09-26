import Hero from "@/components/home/hero"
import About, { StackMarquee } from "@/components/home/about"
import Skills from "@/components/home/skills"
import Work from "@/components/home/work"
import Journey from "@/components/home/journey"
import Contact from "@/components/home/contact"
import { SITE_URL, defaultDescription, jsonLdGraph, personId, personJsonLd, websiteJsonLd } from "@/lib/seo"

const jsonLd = jsonLdGraph(personJsonLd, websiteJsonLd, {
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profile`,
  url: SITE_URL,
  name: "Foko Junior (F_Junior) — Portfolio",
  description: defaultDescription,
  inLanguage: "fr",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  mainEntity: { "@id": personId },
})

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Hero />
      <StackMarquee />
      <About />
      <Skills />
      <Work />
      <Journey />
      <Contact />
    </>
  )
}
