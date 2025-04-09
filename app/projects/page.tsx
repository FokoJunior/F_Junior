"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowLeft, ArrowRight, Github, ExternalLink, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/components/language-provider"
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
    tags: ["Next.js", "React", "Tailwind CSS", "API Integration"],
    category: "Web App",
    image: "https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio/ecommerce.png?raw=true",
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
    tags: ["React", "Firebase", "CSS", "Authentication"],
    category: "Web App",
    image: "https://www.bitrix24.fr/upload/optimizer/converted/upload/iblock/11b/fs1b13bn119sq7435idgrc8afjy1ktw4.jpg.webp?1740679071017",
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
    tags: ["JavaScript", "API", "CSS", "Responsive Design"],
    category: "Web App",
    image: "https://static.vecteezy.com/ti/vecteur-libre/p1/3774267-meteo-verifier-cartoon-smartphone-interface-vector-templates-set-winter-overcast-mobile-app-screen-page-day-and-dark-mode-design-forecast-ui-for-application-phone-display-avec-caractere-plat-vectoriel.jpg",
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
    tags: ["Next.js", "Tailwind CSS", "Responsive Design"],
    category: "Web App",
    image: "https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio/porfolio.png?raw=true",
    demoLink: "#",
    codeLink: "#",
    slug: "portfolio",
  },

  // Nouveaux projets
  {
    id: 15,
    title: "Site Web Dynamique pour Synda Tech",
    description:
      "Un site web dynamique développé pour Synda Tech, comprenant un système de gestion de contenu personnalisé et un blog interactif.",
    longDescription:
      "Ce site web dynamique pour Synda Tech offre une présentation professionnelle de l'entreprise avec un système de gestion de contenu personnalisé permettant aux administrateurs de mettre à jour facilement le contenu. Il comprend également un blog interactif, un formulaire de contact, et une section portfolio pour présenter les projets de l'entreprise.",
    tags: ["PHP", "HTML", "CSS", "JavaScript", "MySQL"],
    category: "Web App",
    image: "https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio/syndatech-website.png?raw=true",
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
    tags: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    category: "Web App",
    image: "https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio/Uniprice-website.png?raw=true",
    demoLink: "#",
    codeLink: "#",
    slug: "uniprice-dwash",
  },

  // PHP Projects
  {
    id: 5,
    title: "Application de Gestion de Stock",
    description:
      "Une application web complète pour la gestion de stock avec suivi des produits, inventaire et rapports.",
    longDescription:
      "Cette application web de gestion de stock permet aux entreprises de suivre leurs produits, gérer l'inventaire, et générer des rapports détaillés. Elle inclut des fonctionnalités comme la gestion des fournisseurs, le suivi des commandes et les alertes de stock bas.",
    tags: ["PHP", "MySQL", "Bootstrap", "JavaScript"],
    category: "PHP",
    image: "https://i.ytimg.com/vi/KD1SIZwu-fc/sddefault.jpg",
    demoLink: "#",
    codeLink: "#",
    slug: "gestion-stock",
  },
  {
    id: 6,
    title: "Application de Gestion de Vote",
    description:
      "Un système de vote en ligne sécurisé avec authentification des utilisateurs et résultats en temps réel.",
    longDescription:
      "Cette application de gestion de vote permet de créer et gérer des élections en ligne avec authentification sécurisée, prévention des votes multiples, et affichage des résultats en temps réel. Idéal pour les élections d'organisations, sondages et consultations.",
    tags: ["PHP", "MySQL", "AJAX", "Sécurité"],
    category: "PHP",
    image: "https://www.esri.com/content/dam/esrisites/en-us/industries/2021/state-and-local-government/elections/assets/elections-mgmt-card-arcgis-survey-123.jpg",
    demoLink: "#",
    codeLink: "#",
    slug: "gestion-vote",
  },
  {
    id: 7,
    title: "Blog Interactif",
    description:
      "Une plateforme de blog avec système de commentaires, partage sur réseaux sociaux et gestion de contenu.",
    longDescription:
      "Ce blog interactif offre une expérience utilisateur complète avec système de commentaires, partage sur réseaux sociaux, et un panneau d'administration pour la gestion de contenu. Les utilisateurs peuvent s'inscrire, commenter, et recevoir des notifications.",
    tags: ["PHP", "MySQL", "jQuery", "Responsive"],
    category: "PHP",
    image: "https://img.freepik.com/vecteurs-libre/illustration-publication-blog-plat-organique-personnes_23-2148955260.jpg",
    demoLink: "#",
    codeLink: "#",
    slug: "blog-interactif",
  },

  // Flutter Projects
  {
    id: 8,
    title: "J-M Expenses Tracker",
    description:
      "Application mobile de suivi des dépenses personnelles avec visualisation graphique et catégorisation.",
    longDescription:
      "J-M Expenses Tracker est une application mobile développée avec Flutter qui permet aux utilisateurs de suivre leurs dépenses quotidiennes, de les catégoriser et de visualiser leur budget à travers des graphiques interactifs. L'application offre également des rapports mensuels et des conseils d'économie.",
    tags: ["Flutter", "Dart", "Firebase", "Charts"],
    category: "Mobile",
    image: "https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio/tracker.png?raw=true",
    demoLink: "#",
    codeLink: "#",
    slug: "jm-expenses-tracker",
  },
  {
    id: 9,
    title: "Test de Personnalité",
    description:
      "Application mobile proposant différents tests de personnalité avec résultats détaillés et partageables.",
    longDescription:
      "Cette application de test de personnalité offre une variété de questionnaires psychologiques validés scientifiquement. Les utilisateurs peuvent découvrir leur type de personnalité, leurs forces et faiblesses, et partager leurs résultats sur les réseaux sociaux.",
    tags: ["Flutter", "Dart", "State Management", "Animations"],
    category: "Mobile",
    image: "https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio/test_personnalite.png?raw=true",
    demoLink: "#",
    codeLink: "#",
    slug: "test-personnalite",
  },
  {
    id: 10,
    title: "Application de Quiz",
    description: "Application de quiz interactive avec différentes catégories, niveaux de difficulté et classements.",
    longDescription:
      "Cette application de quiz propose des milliers de questions dans diverses catégories comme la science, l'histoire, la culture générale et plus encore. Les utilisateurs peuvent jouer en mode solo ou multijoueur, gagner des points et grimper dans le classement global.",
    tags: ["Flutter", "Dart", "API", "Animations"],
    category: "Mobile",
    image: "https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio/quiz.png?raw=true",
    demoLink: "#",
    codeLink: "#",
    slug: "quiz-app",
  },

  // Python Projects
  {
    id: 11,
    title: "Reconnaissance Faciale",
    description: "Programme Python de reconnaissance faciale utilisant OpenCV et des algorithmes de deep learning.",
    longDescription:
      "Ce programme de reconnaissance faciale utilise des techniques avancées de vision par ordinateur et d'apprentissage profond pour détecter et identifier des visages en temps réel. Il peut être utilisé pour la sécurité, le contrôle d'accès ou l'analyse de foule.",
    tags: ["Python", "OpenCV", "Deep Learning", "TensorFlow"],
    category: "Python",
    image: "https://hans-associes.fr/wp-content/uploads/2025/01/k4_14741506.jpg",
    demoLink: "#",
    codeLink: "#", 
    slug: "reconnaissance-faciale",
  },
  {
    id: 12,
    title: "Parcours de Graphes DFS et BFS",
    description: "Implémentation des algorithmes de parcours de graphes en profondeur (DFS) et en largeur (BFS).",
    longDescription:
      "Ce projet implémente les algorithmes fondamentaux de parcours de graphes : Depth-First Search (DFS) et Breadth-First Search (BFS). Il inclut une visualisation graphique des parcours et peut être appliqué à divers problèmes comme la recherche de chemin, la détection de cycles, et l'analyse de réseaux.",
    tags: ["Python", "Algorithmes", "Visualisation", "Matplotlib"],
    category: "Python",
    image: "https://raw.githubusercontent.com/Daytron/graph-bfs-dfs-gui/master/screenshots/screenshot1.png",
    demoLink: "#",
    codeLink: "#",
    slug: "dfs-bfs",
  },
  {
    id: 13,
    title: "Chatbot Telegram",
    description:
      "Un chatbot Telegram intelligent utilisant le traitement du langage naturel pour répondre aux utilisateurs.",
    longDescription:
      "Ce chatbot Telegram utilise des techniques avancées de traitement du langage naturel pour comprendre et répondre aux messages des utilisateurs. Il peut fournir des informations, répondre à des questions, et même apprendre de nouvelles réponses au fil du temps.",
    tags: ["Python", "NLP", "API Telegram", "Machine Learning"],
    category: "Python",
    image: "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/207441761/original/aaf3c0f3c869463f18b04ff9c8d547f261e04445/make-a-telegram-bot-using-python.png",
    demoLink: "#",
    codeLink: "#",
    slug: "chatbot-telegram",
  },
  {
    id: 14,
    title: "Récupération de Mots de Passe WiFi",
    description: "Programme d'analyse des réseaux WiFi et récupération des mots de passe enregistrés sur le système.",
    longDescription:
      "Cet outil d'analyse WiFi permet de scanner les réseaux disponibles et de récupérer les mots de passe enregistrés sur le système. Il est conçu à des fins éducatives et de sécurité, pour aider les utilisateurs à comprendre les vulnérabilités des réseaux sans fil.",
    tags: ["Python", "Sécurité", "Réseaux", "Analyse"],
    category: "Python",
    image: "https://thepythoncode.com/media/articles/wifi-scanner-in-python-using-scapy.jpg",
    demoLink: "#",
    codeLink: "#",
    slug: "wifi-password",
  },
]

export default function ProjectsPage() {
  const { t } = useLanguage()
  const [primaryHue, setPrimaryHue] = useState(0)
  const mainRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"],
  })
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ["5%", "100%"])
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const isMobile = useMobileDetector()

  useEffect(() => {
    // Real-time color change effect
    const colorInterval = setInterval(() => {
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
      clearInterval(colorInterval)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen" ref={mainRef}>
      <motion.div
        className="fixed top-0 left-0 h-1 z-50"
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <Link href="/">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Button>
          </Link>
          <motion.h1
            className="text-2xl md:text-3xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ color: `hsl(${primaryHue}, 50%, 50%)` }}
          >
            Mes Projets
          </motion.h1>
        </div>

        <Tabs defaultValue="all" className="mb-6 md:mb-8">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 max-w-3xl mx-auto">
            <TabsTrigger value="all" className="relative overflow-hidden group">
              Tous
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
              />
            </TabsTrigger>
            <TabsTrigger value="web-app" className="relative overflow-hidden group">
              Applications Web
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
              />
            </TabsTrigger>
            <TabsTrigger value="mobile" className="relative overflow-hidden group">
              Applications Mobile
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
              />
            </TabsTrigger>
            <TabsTrigger value="python" className="relative overflow-hidden group">
              Python
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
              />
            </TabsTrigger>
            <TabsTrigger value="php" className="relative overflow-hidden group">
              PHP
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
              />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8"
            >
              {projects.map((project) => (
                <motion.div key={project.id} variants={item}>
                  <ProjectCard project={project} primaryHue={primaryHue} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="web-app">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8"
            >
              {projects
                .filter((project) => project.category === "Web App")
                .map((project) => (
                  <motion.div key={project.id} variants={item}>
                    <ProjectCard project={project} primaryHue={primaryHue} />
                  </motion.div>
                ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="mobile">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8"
            >
              {projects
                .filter((project) => project.category === "Mobile")
                .map((project) => (
                  <motion.div key={project.id} variants={item}>
                    <ProjectCard project={project} primaryHue={primaryHue} />
                  </motion.div>
                ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="python">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8"
            >
              {projects
                .filter((project) => project.category === "Python")
                .map((project) => (
                  <motion.div key={project.id} variants={item}>
                    <ProjectCard project={project} primaryHue={primaryHue} />
                  </motion.div>
                ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="php">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8"
            >
              {projects
                .filter((project) => project.category === "PHP")
                .map((project) => (
                  <motion.div key={project.id} variants={item}>
                    <ProjectCard project={project} primaryHue={primaryHue} />
                  </motion.div>
                ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ProjectCard({ project, primaryHue }: { project: any; primaryHue: number }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full group hover:border-primary/50">
      <div className="aspect-video bg-muted overflow-hidden">
        <motion.img
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <CardHeader>
        <CardTitle className="transition-colors" style={{ color: `hsl(${primaryHue}, 50%, 50%)` }}>
          {project.title}
        </CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag: string) => (
            <Badge
              key={tag}
              variant="secondary"
              className="hover:bg-primary/20 transition-colors"
              style={{ borderColor: `hsl(${primaryHue}, 70%, 30%)` }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Link href={project.demoLink} className="flex-1">
          <Button
            variant="default"
            className="w-full group text-sm"
            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
          >
            <ExternalLink className="mr-1 h-4 w-4" />
            Démo
            <motion.span className="ml-1 opacity-0 group-hover:opacity-100" initial={{ x: -5 }} whileHover={{ x: 0 }}>
              →
            </motion.span>
          </Button>
        </Link>
        <Link href={project.codeLink} className="flex-1">
          <Button variant="outline" className="w-full group text-sm">
            <Github className="mr-1 h-4 w-4" />
            Code
          </Button>
        </Link>
        <Link href={`/projects/${project.slug}`} className="flex-1">
          <Button variant="ghost" className="w-full group text-sm">
            Détails
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
