"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowLeft, ExternalLink, Github, ChevronRight, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"
import { useRef, useState, useEffect } from "react"
import CursorParticles from "@/components/cursor-particles"
import ParallaxEffect from "@/components/parallax-effect"
import ImageDistortion from "@/components/image-distortion"
import AnimatedText from "@/components/animated-text"
import { useMobileDetector } from "@/components/mobile-detector"

const projects = [
  // Web Projects
  {
    id: 1,
    title: "Site E-commerce",
    description:
      "Un site e-commerce responsive construit avec Next.js et Tailwind CSS. Fonctionnalités incluant catalogue de produits, filtrage, panier et processus de paiement.",
    longDescription:
      "Cette plateforme e-commerce offre une expérience d'achat fluide avec des fonctionnalités comme la recherche de produits, le filtrage, l'authentification des utilisateurs, le panier d'achat et le paiement sécurisé. Le panneau d'administration permet une gestion facile des produits et le suivi des commandes.",
    features: [
      "Catalogue de produits responsive avec filtrage et tri",
      "Authentification utilisateur et gestion de compte",
      "Panier d'achat avec stockage persistant",
      "Processus de paiement avec intégration Stripe",
      "Tableau de bord administrateur pour la gestion des produits et commandes",
      "Système d'avis et de notation des produits",
    ],
    technologies: ["Next.js", "React", "Tailwind CSS", "API Integration", "Stripe", "MongoDB"],
    category: "Web App",
    images: [
      "/placeholder.svg?height=400&width=600&text=E-commerce+Homepage",
      "/placeholder.svg?height=400&width=600&text=E-commerce+Product+Page",
      "/placeholder.svg?height=400&width=600&text=E-commerce+Cart",
    ],
    demoLink: "#",
    codeLink: "#",
    slug: "ecommerce",
  },
  {
    id: 2,
    title: "Gestionnaire de Tâches",
    description:
      "Une application de gestion de tâches permettant aux utilisateurs de créer, organiser et suivre leurs tâches. Construite avec React et inclut des fonctionnalités comme le glisser-déposer et l'authentification.",
    longDescription:
      "Cette application de gestion de tâches aide les utilisateurs à organiser leur travail avec des fonctionnalités comme la création de tâches, la catégorisation, la définition de priorités, les dates d'échéance et le suivi de la progression. L'interface glisser-déposer facilite la gestion des étapes du flux de travail.",
    features: [
      "Création de tâches avec titre, description, priorité et date d'échéance",
      "Tableau Kanban avec fonctionnalité glisser-déposer",
      "Options de filtrage et de tri des tâches",
      "Authentification utilisateur et partage de tâches",
      "Suivi de progression et statistiques",
      "Notifications pour les échéances à venir",
    ],
    technologies: ["React", "Firebase", "React DnD", "CSS", "Authentication", "Cloud Functions"],
    category: "Web App",
    images: [
      "/placeholder.svg?height=400&width=600&text=Task+Manager+Dashboard",
      "/placeholder.svg?height=400&width=600&text=Task+Creation",
      "/placeholder.svg?height=400&width=600&text=Kanban+Board",
    ],
    demoLink: "#",
    codeLink: "#",
    slug: "task-manager",
  },
  {
    id: 3,
    title: "Application Météo",
    description:
      "Un tableau de bord météo qui affiche les conditions météorologiques actuelles et les prévisions pour plusieurs emplacements. Utilise une API météo et présente une interface propre et intuitive.",
    longDescription:
      "Ce tableau de bord météo fournit des informations météorologiques en temps réel et des prévisions pour n'importe quel emplacement. Les utilisateurs peuvent enregistrer des emplacements favoris, consulter des données météorologiques détaillées, notamment la température, l'humidité, la vitesse du vent, et voir des prévisions horaires et sur 7 jours.",
    features: [
      "Affichage des conditions météorologiques actuelles",
      "Prévisions horaires et sur 7 jours",
      "Recherche de localisation avec autocomplétion",
      "Emplacements favoris enregistrés",
      "Cartes météo avec différentes couches de données",
      "Alertes et notifications météo",
    ],
    technologies: ["JavaScript", "OpenWeather API", "Chart.js", "CSS", "Responsive Design", "Geolocation API"],
    category: "Web App",
    images: [
      "/placeholder.svg?height=400&width=600&text=Weather+Dashboard",
      "/placeholder.svg?height=400&width=600&text=Forecast+View",
      "/placeholder.svg?height=400&width=600&text=Weather+Map",
    ],
    demoLink: "#",
    codeLink: "#",
    slug: "weather",
  },
  {
    id: 4,
    title: "Site Portfolio",
    description:
      "Ce site portfolio présentant mes compétences et projets. Construit avec Next.js et Tailwind CSS, avec un design moderne et épuré.",
    longDescription:
      "Un site portfolio personnel conçu pour présenter mes compétences, projets et expérience professionnelle. Comprend un design responsive, un mode sombre, des animations et une fonctionnalité de formulaire de contact.",
    features: [
      "Design responsive pour tous les formats d'écran",
      "Bascule en mode sombre",
      "Transitions de page animées et éléments d'interface utilisateur",
      "Présentation de projets avec filtrage",
      "Formulaire de contact avec validation",
      "Section blog pour partager des idées",
    ],
    technologies: ["Next.js", "Tailwind CSS", "Framer Motion", "Responsive Design", "TypeScript", "Vercel"],
    category: "Web Design",
    images: [
      "/placeholder.svg?height=400&width=600&text=Portfolio+Homepage",
      "/placeholder.svg?height=400&width=600&text=Projects+Section",
      "/placeholder.svg?height=400&width=600&text=Contact+Form",
    ],
    demoLink: "#",
    codeLink: "#",
    slug: "portfolio",
  },
  {
    id: 5,
    title: "Application de Recherche de Recettes",
    description:
      "Une application de recherche de recettes qui permet aux utilisateurs de rechercher des recettes en fonction des ingrédients, des restrictions alimentaires et des types de repas.",
    longDescription:
      "Cette application de recherche de recettes aide les utilisateurs à découvrir de nouveaux repas en fonction des ingrédients disponibles, des préférences alimentaires et du temps de cuisson. Les fonctionnalités comprennent l'enregistrement de recettes, la planification de repas et les informations nutritionnelles.",
    features: [
      "Recherche de recettes par ingrédients, cuisine ou besoins diététiques",
      "Instructions de recette détaillées et listes d'ingrédients",
      "Affichage des informations nutritionnelles",
      "Enregistrement des recettes favorites",
      "Calendrier de planification de repas",
      "Génération de liste de courses",
    ],
    technologies: ["React", "Spoonacular API", "Styled Components", "LocalStorage", "Progressive Web App"],
    category: "Web App",
    images: [
      "/placeholder.svg?height=400&width=600&text=Recipe+Search",
      "/placeholder.svg?height=400&width=600&text=Recipe+Details",
      "/placeholder.svg?height=400&width=600&text=Meal+Planner",
    ],
    demoLink: "#",
    codeLink: "#",
    slug: "recipe-finder",
  },
  {
    id: 6,
    title: "Suivi des Finances Personnelles",
    description:
      "Une application de suivi financier qui aide les utilisateurs à gérer leurs revenus, dépenses et objectifs d'épargne.",
    longDescription:
      "Ce suivi des finances personnelles aide les utilisateurs à gérer leur argent avec des fonctionnalités pour suivre les revenus, les dépenses et les objectifs d'épargne. Comprend des visualisations des habitudes de dépenses, des outils de planification budgétaire et des informations financières.",
    features: [
      "Suivi des revenus et des dépenses avec catégories",
      "Création et surveillance de budget",
      "Objectifs d'épargne avec suivi de progression",
      "Visualisation des données avec graphiques",
      "Rapports financiers et informations",
      "Gestion des transactions récurrentes",
    ],
    technologies: ["React", "Chart.js", "Firebase", "Authentication", "Cloud Firestore", "Progressive Web App"],
    category: "Web App",
    images: [
      "/placeholder.svg?height=400&width=600&text=Finance+Dashboard",
      "/placeholder.svg?height=400&width=600&text=Expense+Tracking",
      "/placeholder.svg?height=400&width=600&text=Budget+Planning",
    ],
    demoLink: "#",
    codeLink: "#",
    slug: "finance-tracker",
  },
  // Nouveaux projets
  {
    id: 15,
    title: "Site Web Dynamique pour Synda Tech",
    description:
      "Un site web dynamique développé pour Synda Tech, comprenant un système de gestion de contenu personnalisé et un blog interactif.",
    longDescription:
      "Ce site web dynamique pour Synda Tech offre une présentation professionnelle de l'entreprise avec un système de gestion de contenu personnalisé permettant aux administrateurs de mettre à jour facilement le contenu. Il comprend également un blog interactif, un formulaire de contact, et une section portfolio pour présenter les projets de l'entreprise.",
    features: [
      "Système de gestion de contenu personnalisé",
      "Blog interactif avec commentaires",
      "Formulaire de contact avec validation",
      "Section portfolio pour présenter les projets",
      "Tableau de bord administrateur sécurisé",
      "Design responsive pour tous les appareils",
    ],
    technologies: ["PHP", "HTML", "CSS", "JavaScript", "MySQL", "Bootstrap"],
    category: "Web App",
    images: [
      "/placeholder.svg?height=400&width=600&text=Synda+Tech+Homepage",
      "/placeholder.svg?height=400&width=600&text=Synda+Tech+Blog",
      "/placeholder.svg?height=400&width=600&text=Synda+Tech+Admin",
    ],
    demoLink: "#",
    codeLink: "#",
    slug: "synda-tech",
  },
  {
    id: 16,
    title: "Site Web Vitrine pour Uniprice Dwash",
    description:
      "Un site web vitrine élégant pour Uniprice Dwash, présentant leurs services de lavage de voiture et permettant aux clients de prendre rendez-vous en ligne.",
    longDescription:
      "Ce site web vitrine pour Uniprice Dwash met en valeur les services de lavage de voiture de l'entreprise avec un design moderne et attrayant. Il comprend une présentation des différentes formules de lavage, une galerie de photos avant/après, un système de prise de rendez-vous en ligne, et des témoignages clients. Le site est entièrement responsive et optimisé pour les moteurs de recherche.",
    features: [
      "Design moderne et attrayant",
      "Présentation des services de lavage de voiture",
      "Galerie de photos avant/après",
      "Système de prise de rendez-vous en ligne",
      "Témoignages clients",
      "Optimisation pour les moteurs de recherche",
    ],
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap", "jQuery", "PHP"],
    category: "Web App",
    images: [
      "/placeholder.svg?height=400&width=600&text=Uniprice+Dwash+Homepage",
      "/placeholder.svg?height=400&width=600&text=Uniprice+Dwash+Services",
      "/placeholder.svg?height=400&width=600&text=Uniprice+Dwash+Booking",
    ],
    demoLink: "#",
    codeLink: "#",
    slug: "uniprice-dwash",
  },
]

export default function ProjectDetailPage() {
  const { t } = useLanguage()
  const params = useParams()
  const slug = params.slug as string
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1])
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0])
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ["5%", "100%"])

  // Real-time color change effect
  const [primaryHue, setPrimaryHue] = useState(0)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const isMobile = useMobileDetector()

  useEffect(() => {
    const interval = setInterval(() => {
      setPrimaryHue((prev) => (prev + 1) % 360)
    }, 50)

    // Masquer l'indicateur de défilement après un certain défilement
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      clearInterval(interval)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const project = projects.find((p) => p.slug === slug)

  if (!project) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Projet non trouvé</h1>
        <p className="text-muted-foreground mb-8">Le projet que vous recherchez n'existe pas.</p>
        <Link href="/projects">
          <Button>Retour aux projets</Button>
        </Link>
      </div>
    )
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const featureItem = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  }

  return (
    <div className="min-h-screen" ref={ref}>
      <CursorParticles count={20} color={`hsl(${primaryHue}, 70%, 50%)`} />

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50"
        style={{
          width: progressBarWidth,
          backgroundColor: `hsl(${primaryHue}, 70%, 50%)`,
          opacity: isMobile ? 1 : 0.8, // Plus visible sur mobile
        }}
      />

      <motion.div
        className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: showScrollIndicator ? 1 : 0, y: showScrollIndicator ? 0 : 20 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          className="flex flex-col items-center"
        >
          <p className="text-sm text-muted-foreground mb-2">Défilez pour découvrir</p>
          <ChevronDown className="h-6 w-6" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
        </motion.div>
      </motion.div>

      <div className="container px-4 sm:px-6 py-8 md:py-12">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/projects">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <AnimatedText text="Retour aux projets" type="wave" delay={0.05} />
            </Button>
          </Link>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={project.demoLink}>
                <Button
                  variant="outline"
                  className="group"
                  style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Démo
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={project.codeLink}>
                <Button
                  variant="outline"
                  className="group"
                  style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Code
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div style={{ opacity, scale, y }} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <motion.h1
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ color: `hsl(${primaryHue}, 50%, 50%)` }}
            >
              <AnimatedText text={project.title} type="typewriter" delay={0.03} />
            </motion.h1>
            <motion.div
              className="flex flex-wrap gap-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {project.technologies.map((tech: string, index: number) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 3 : -3 }}
                >
                  <Badge
                    variant="secondary"
                    className="animate-pulse"
                    style={{
                      backgroundColor: `hsl(${(primaryHue + index * 30) % 360}, 70%, 50%, 0.2)`,
                      color: `hsl(${(primaryHue + index * 30) % 360}, 70%, 50%)`,
                    }}
                  >
                    {tech}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
            <motion.p
              className="text-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {project.longDescription}
            </motion.p>
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: `hsl(${primaryHue}, 50%, 50%)` }}>
                Fonctionnalités
              </h2>
              <motion.ul className="space-y-2" variants={container} initial="hidden" animate="show">
                {project.features.map((feature: string, index: number) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    variants={featureItem}
                    custom={index}
                    whileHover={{ x: 5, color: `hsl(${primaryHue}, 70%, 50%)` }}
                  >
                    <ChevronRight
                      className="h-5 w-5 mr-2 flex-shrink-0"
                      style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}
                    />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
          <div>
            <ParallaxEffect intensity={0.05}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
              >
                <ImageDistortion
                  src={project.images[0] || "/placeholder.svg"}
                  alt={project.title}
                  className="rounded-lg overflow-hidden shadow-lg"
                />
              </motion.div>
            </ParallaxEffect>
          </div>
        </motion.div>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: `hsl(${primaryHue}, 50%, 50%)` }}>
            Galerie du projet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.images.map((image: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="rounded-lg overflow-hidden shadow-md"
                whileHover={{
                  scale: 1.05,
                  rotate: index % 2 === 0 ? 2 : -2,
                  boxShadow: `0 10px 25px -5px hsla(${primaryHue}, 70%, 50%, 0.3)`,
                }}
              >
                <ImageDistortion
                  src={image || "/placeholder.svg"}
                  alt={`${project.title} screenshot ${index + 1}`}
                  className="w-full h-auto"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link href={project.demoLink}>
              <Button size="lg" className="group" style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}>
                <ExternalLink className="mr-2 h-5 w-5" />
                Voir la démo
                <motion.span
                  className="ml-1 opacity-0 group-hover:opacity-100"
                  initial={{ x: -5 }}
                  whileHover={{ x: 0 }}
                >
                  →
                </motion.span>
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link href={project.codeLink}>
              <Button
                variant="outline"
                size="lg"
                className="group"
                style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)`, color: `hsl(${primaryHue}, 70%, 50%)` }}
              >
                <Github className="mr-2 h-5 w-5" />
                Voir le code source
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
