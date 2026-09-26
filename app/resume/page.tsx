import type { Metadata } from "next"

import ResumeView from "@/components/resume/resume-view"
import { SITE_URL, breadcrumb, jsonLdGraph, personId, personJsonLd } from "@/lib/seo"

const description =
  "CV de Foko Junior (Junior Benoît FOKO TADJUIGE, F_Junior) : développeur Full Stack · Mobile · IA, Master 2 Génie Logiciel à l'IUC de Douala. Expériences chez DanAid, Uniprice, Aigle Digital, Revolute Consulting et SyndaTech."

export const metadata: Metadata = {
  title: "CV — Foko Tadjuige Benoît Junior",
  description,
  alternates: { canonical: "/resume" },
  openGraph: { type: "profile", url: "/resume", title: "CV de Foko Junior (F_Junior)", description },
}

const jsonLd = jsonLdGraph(
  personJsonLd,
  {
    "@type": "ProfilePage",
    url: `${SITE_URL}/resume`,
    name: "CV — Foko Junior",
    description,
    mainEntity: { "@id": personId },
  },
  breadcrumb([
    { name: "Foko Junior", path: "/" },
    { name: "CV", path: "/resume" },
  ]),
)

export default function ResumePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <ResumeView />
    </>
  )
}
