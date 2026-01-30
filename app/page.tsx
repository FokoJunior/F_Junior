"use client"

import type React from "react"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import {
  ArrowRight,
  Github,
  Mail,
  MapPin,
  Phone,
  Download,
  ChevronDown,
  Code,
  Sparkles,
  Zap,
  Terminal,
  ExternalLink,
} from "lucide-react"
import { motion, useAnimation, AnimatePresence, useScroll, useTransform } from "framer-motion"
import dynamic from "next/dynamic"
import { Linkedin, Twitter, Heart, Coffee } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { useMobileDetector } from "@/components/mobile-detector"
import AnimatedHeroSvg from "@/components/animated-hero-svg"
import RobotAnimation from "@/components/robot-animation"
import CodeDemo from "@/components/code-demo"

// Importer dynamiquement les composants qui utilisent des APIs browser


const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted rounded-xl animate-pulse" />,
})

const ChatButton = dynamic(() => import("@/components/chat-button"), {
  ssr: false,
})



export default function Home() {
  const { toast } = useToast()
  const { t } = useLanguage()
  const controls = useAnimation()
  const [currentAnimation, setCurrentAnimation] = useState(0)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [primaryHue, setPrimaryHue] = useState(0)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const [projectFilter, setProjectFilter] = useState<"all" | "web" | "mobile" | "ai">("all")
  const mainRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"],
  })
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ["5%", "100%"])
  const isMobile = useMobileDetector()

  const animations = [
    {
      scale: [1, 1.05, 1],
      transition: { duration: 2 },
    },
    {
      y: [0, -10, 0],
      transition: { duration: 2 },
    },
    {
      rotate: [0, 5, 0, -5, 0],
      transition: { duration: 2 },
    },
    {
      opacity: [1, 0.7, 1],
      transition: { duration: 2 },
    },
  ]

  useEffect(() => {
    setIsMounted(true)

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

    animationRef.current = setInterval(() => {
      controls.start(animations[currentAnimation])
      setCurrentAnimation((prev) => (prev + 1) % animations.length)
    }, 2000)

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
      clearInterval(colorInterval)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [controls, currentAnimation, animations])

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: t("messageSent"),
      description: t("messageConfirmation"),
    })
  }

  const handleDownloadCV = () => {
    try {
      // URL vers le fichier CV (à remplacer par l'URL réelle)
      const cvUrl = "/CV_FOKO_JUNIOR.pdf"

      // Solution compatible mobile
      window.open(cvUrl, "_blank")

      toast({
        title: "Téléchargement démarré",
        description: "Votre téléchargement a commencé.",
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

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

  // Afficher un contenu minimal pendant le chargement côté client
  if (!isMounted) return null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "FOKO TADJUIGE B. JUNIOR",
      "alternateName": "F_Junior",
      "jobTitle": "Développeur Full Stack & Ingénieur IA",
      "url": "https://fokojunior.com",
      "sameAs": [
        "https://github.com/FokoJunior",
        "https://linkedin.com/in/fokojunior",
        "https://twitter.com/FokoJunior"
      ],
      "knowsAbout": [
        "Développement Web",
        "React",
        "Next.js",
        "Intelligence Artificielle",
        "Machine Learning",
        "Python",
        "Génie Logiciel"
      ]
    }
  }

  return (
    <div className="flex min-h-screen flex-col relative" ref={mainRef}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Barre de progression */}
      <motion.div
        className="fixed top-0 left-0 h-1 z-50"
        style={{
          width: progressBarWidth,
          backgroundColor: `hsl(${primaryHue}, 70%, 50%)`,
          opacity: isMobile ? 1 : 0.8,
          boxShadow: `0 0 10px hsl(${primaryHue}, 70%, 50%)`,
        }}
      />


      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section id="home" className="container py-16 md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <Badge className="text-sm animate-pulse neo-brutalism-badge">{t("availableForWork")}</Badge>
              <motion.h1 className="text-3xl md:text-5xl lg:text-6xl font-bold neon-text" animate={controls}>
                {t("hi")}, <span className="text-primary text-glow">{t("nickname")}</span>
              </motion.h1>
              <div className="h-8 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentAnimation}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-lg md:text-xl text-muted-foreground"
                  >
                    {t("titles")[currentAnimation % t("titles").length]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="text-base md:text-lg text-muted-foreground max-w-[600px] mt-2">{t("shortBio")}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <Link href="#projects">
                  <Button
                    className="group neo-brutalism-button"
                    style={
                      {
                        backgroundColor: `hsl(${primaryHue}, 70%, 50%)`,
                        "--glow-color": `hsl(${primaryHue}, 70%, 50%)`,
                      } as React.CSSProperties
                    }
                  >
                    {t("viewMyWork")}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button
                    variant="outline"
                    className="hover:bg-primary/10 transition-colors neo-brutalism-button-outline"
                  >
                    {t("contactMe")}
                  </Button>
                </Link>
                <Button variant="secondary" className="group neo-brutalism-button-secondary" onClick={handleDownloadCV}>
                  {t("downloadCV")}
                  <Download className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
                </Button>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden md:block h-[500px] w-full"
            >
              <AnimatedHeroSvg
                imageUrl="https://img.freepik.com/photos-gratuite/vue-3d-garcon-utilisation-ordinateur-portable_23-2150709886.jpg"
                primaryHue={primaryHue}
              />
            </motion.div>

          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="container py-16 md:py-24 border-t">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="order-1 md:order-1"
            >
              <div className="relative rounded-lg shadow-lg overflow-hidden group neo-brutalism-image">
                <img
                  src="https://img.freepik.com/photos-gratuite/vue-3d-garcon-utilisation-ordinateur-portable_23-2150709886.jpg"
                  alt="FOKO TADJUIGE B. JUNIOR"
                  className="w-full h-auto rounded-lg transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 w-full">
                    <h3 className="text-white text-xl font-bold">{t("name")}</h3>
                    <p className="text-white/80">{t("nickname")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="order-2 md:order-2"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 neon-text">{t("aboutMe")}</h2>
              <p className="text-muted-foreground mb-4">{t("aboutMeP1")}</p>
              <p className="text-muted-foreground mb-4">{t("aboutMeP2")}</p>
              <p className="text-muted-foreground">{t("aboutMeP3")}</p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 neo-brutalism-card p-2 rounded-md transition-all">
                  <Phone className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                  <a href="tel:+237690713130" className="hover:text-primary transition-colors">
                    +237 690-713-130
                  </a>
                </div>
                <div className="flex items-center gap-2 neo-brutalism-card p-2 rounded-md transition-all">
                  <Mail className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                  <a href="mailto:benitojunior2022@gmail.com" className="hover:text-primary transition-colors">
                    benitojunior2022@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2 neo-brutalism-card p-2 rounded-md transition-all">
                  <MapPin className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                  <span>Douala - Logpom, Cameroun</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                <Button variant="outline" className="group neo-brutalism-button-outline" onClick={handleDownloadCV}>
                  {t("downloadCV")}
                  <Download className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
                </Button>
                <Link href="https://github.com/FokoJunior" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="group neo-brutalism-button-outline">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Code Demo Section */}
        <section id="code-demo" className="container py-16 md:py-24 border-t">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center neon-text"
          >
            <Terminal className="inline-block mr-2 mb-1" /> Code en Action
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="neo-brutalism-terminal h-[600px] md:h-[700px]"
          >
            <CodeDemo primaryHue={primaryHue} />
          </motion.div>

          <div className="mt-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="https://github.com/FokoJunior" target="_blank" rel="noopener noreferrer">
                <Button
                  className="neo-brutalism-button"
                  style={{
                    backgroundColor: `hsl(${primaryHue}, 70%, 50%)`,
                  }}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Voir plus de code sur GitHub
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="container py-16 md:py-24 border-t">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center neon-text"
          >
            {t("mySkills")}
          </motion.h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            <motion.div variants={item}>
              <SkillCard
                title={t("frontendDev")}
                description={t("frontendDesc")}
                skills={["HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind CSS", "Vue.js"]}
                primaryHue={primaryHue}
                icon={<Code />}
              />
            </motion.div>
            <motion.div variants={item}>
              <SkillCard
                title={t("backendDev")}
                description={t("backendDesc")}
                skills={["Node.js", "Express", "Python", "Django", "PHP", "Laravel", "MySQL"]}
                primaryHue={primaryHue}
                icon={<Zap />}
              />
            </motion.div>
            <motion.div variants={item}>
              <SkillCard
                title={t("mobileDev")}
                description={t("mobileDesc")}
                skills={["React Native", "Flutter", "Android", "iOS", "Firebase"]}
                primaryHue={primaryHue}
                icon={<Phone />}
              />
            </motion.div>
            <motion.div variants={item}>
              <SkillCard
                title={t("aiMl")}
                description={t("aiMlDesc")}
                skills={["Python", "TensorFlow", "PyTorch", "Scikit-learn", "NLP", "Computer Vision"]}
                primaryHue={primaryHue}
                icon={<Sparkles />}
              />
            </motion.div>
            <motion.div variants={item}>
              <SkillCard
                title={t("tools")}
                description={t("toolsDesc")}
                skills={["Git", "GitHub", "VS Code", "Docker", "Agile", "Figma"]}
                primaryHue={primaryHue}
                icon={<Github />}
              />
            </motion.div>
            <motion.div variants={item}>
              <SkillCard
                title={t("languages")}
                description={t("languagesDesc")}
                skills={[`${t("french")} (${t("fluent")})`, `${t("english")} (${t("beginner")})`]}
                primaryHue={primaryHue}
                icon={<Mail />}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="container py-16 md:py-24 border-t">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center neon-text">{t("myProjects")}</h2>
            <div className="flex justify-center mb-8 md:mb-12">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={projectFilter === "all" ? "default" : "outline"}
                  className="transition-colors"
                  style={projectFilter === "all" ? { backgroundColor: `hsl(${primaryHue}, 70%, 50%)` } : { borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                  onClick={() => setProjectFilter("all")}
                >
                  {t("all")}
                </Button>
                <Button
                  variant={projectFilter === "web" ? "default" : "ghost"}
                  className="transition-colors"
                  style={projectFilter === "web" ? { backgroundColor: `hsl(${primaryHue}, 70%, 50%)` } : {}}
                  onClick={() => setProjectFilter("web")}
                >
                  {t("webApps")}
                </Button>
                <Button
                  variant={projectFilter === "mobile" ? "default" : "ghost"}
                  className="transition-colors"
                  style={projectFilter === "mobile" ? { backgroundColor: `hsl(${primaryHue}, 70%, 50%)` } : {}}
                  onClick={() => setProjectFilter("mobile")}
                >
                  {t("mobileApps")}
                </Button>
                <Button
                  variant={projectFilter === "ai" ? "default" : "ghost"}
                  className="transition-colors"
                  style={projectFilter === "ai" ? { backgroundColor: `hsl(${primaryHue}, 70%, 50%)` } : {}}
                  onClick={() => setProjectFilter("ai")}
                >
                  {t("aiProjects")}
                </Button>
              </div>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {(projectFilter === "all" || projectFilter === "web") && (
                <motion.div variants={item}>
                  <ProjectCard
                    title={t("ecommerceTitle")}
                    description={t("ecommerceDesc")}
                    tags={["Next.js", "React", "Tailwind CSS", "API"]}
                    image="https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio/ecommerce.png?raw=true"
                    demoLink="#"
                    codeLink="https://github.com/FokoJunior"
                    detailsLink="/projects/ecommerce"
                    primaryHue={primaryHue}
                  />
                </motion.div>
              )}
              {(projectFilter === "all" || projectFilter === "web") && (
                <motion.div variants={item}>
                  <ProjectCard
                    title={t("taskManagerTitle")}
                    description={t("taskManagerDesc")}
                    tags={["React", "Firebase", "CSS", "Auth"]}
                    image="https://img.freepik.com/vecteurs-libre/application-gestion-taches_52683-44675.jpg"
                    demoLink="#"
                    codeLink="https://github.com/FokoJunior"
                    detailsLink="/projects/task-manager"
                    primaryHue={primaryHue}
                  />
                </motion.div>
              )}
              {(projectFilter === "all" || projectFilter === "web") && (
                <motion.div variants={item}>
                  <ProjectCard
                    title={t("weatherAppTitle")}
                    description={t("weatherAppDesc")}
                    tags={["JavaScript", "API", "CSS", "Responsive"]}
                    image="https://static.vecteezy.com/ti/vecteur-libre/p1/3774267-meteo-verifier-cartoon-smartphone-interface-vector-templates-set-winter-overcast-mobile-app-screen-page-day-and-dark-mode-design-forecast-ui-for-application-phone-display-avec-caractere-plat-vectoriel.jpg"
                    demoLink="#"
                    codeLink="https://github.com/FokoJunior"
                    detailsLink="/projects/weather"
                    primaryHue={primaryHue}
                  />
                </motion.div>
              )}
              {(projectFilter === "all" || projectFilter === "web") && (
                <motion.div variants={item}>
                  <ProjectCard
                    title={t("portfolioTitle")}
                    description={t("portfolioDesc")}
                    tags={["Next.js", "Tailwind CSS", "Responsive"]}
                    image="https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio/porfolio.png?raw=true"
                    demoLink="#"
                    codeLink="https://github.com/FokoJunior"
                    detailsLink="/projects/portfolio"
                    primaryHue={primaryHue}
                  />
                </motion.div>
              )}
              {(projectFilter === "all" || projectFilter === "mobile") && (
                <motion.div variants={item}>
                  <ProjectCard
                    title={t("mobileAppTitle")}
                    description={t("mobileAppDesc")}
                    tags={["React Native", "Firebase", "Redux"]}
                    image="https://media.istockphoto.com/id/1471383309/vector/laptop-silver-mockup-with-tablet-blank-screens.jpg?s=612x612&w=0&k=20&c=pgNCZDAV63qeCAq2HgjEKEEkOvabkFkl63qd_hZ9CoY="
                    demoLink="#"
                    codeLink="https://github.com/FokoJunior"
                    detailsLink="/projects/mobile-app"
                    primaryHue={primaryHue}
                  />
                </motion.div>
              )}
              {(projectFilter === "all" || projectFilter === "ai") && (
                <motion.div variants={item}>
                  <ProjectCard
                    title={t("aiProjectTitle")}
                    description={t("aiProjectDesc")}
                    tags={["Python", "TensorFlow", "NLP", "ML"]}
                    image="https://media.istockphoto.com/id/1471383309/vector/laptop-silver-mockup-with-tablet-blank-screens.jpg?s=612x612&w=0&k=20&c=pgNCZDAV63qeCAq2HgjEKEEkOvabkFkl63qd_hZ9CoY="
                    demoLink="#"
                    codeLink="https://github.com/FokoJunior"
                    detailsLink="/projects/ai-project"
                    primaryHue={primaryHue}
                  />
                </motion.div>
              )}
            </motion.div>
            <div className="flex justify-center mt-8 md:mt-12">
              <Link href="/projects">
                <Button
                  variant="outline"
                  className="group neo-brutalism-button-outline"
                  style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                >
                  {t("viewAllProjects")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Map Section */}
        <section id="map" className="container py-16 md:py-24 border-t">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center neon-text">{t("location")}</h2>
            <div className="h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden shadow-lg neo-brutalism-map">
              {isMounted && <Map location="Douala Logpom, Cameroun" />}
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="container py-16 md:py-24 border-t">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 neon-text">{t("getInTouch")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("contactDesc")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="neo-brutalism-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-4 neon-text">{t("contactInfo")}</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 group neo-brutalism-card-inner p-2 rounded-md transition-all">
                    <div
                      className="p-3 rounded-full group-hover:bg-primary/20 transition-colors"
                      style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.1)` }}
                    >
                      <Phone
                        className="h-5 w-5 group-hover:scale-110 transition-transform"
                        style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("phone")}</p>
                      <a
                        href="tel:+237690713130"
                        className="font-medium hover:text-primary transition-colors"
                        style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}
                      >
                        +237 690-713-130
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group neo-brutalism-card-inner p-2 rounded-md transition-all">
                    <div
                      className="p-3 rounded-full group-hover:bg-primary/20 transition-colors"
                      style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.1)` }}
                    >
                      <Mail
                        className="h-5 w-5 group-hover:scale-110 transition-transform"
                        style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("email")}</p>
                      <a
                        href="mailto:benitojunior2022@gmail.com"
                        className="font-medium hover:text-primary transition-colors"
                        style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}
                      >
                        benitojunior2022@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group neo-brutalism-card-inner p-2 rounded-md transition-all">
                    <div
                      className="p-3 rounded-full group-hover:bg-primary/20 transition-colors"
                      style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.1)` }}
                    >
                      <Github
                        className="h-5 w-5 group-hover:scale-110 transition-transform"
                        style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">GitHub</p>
                      <a
                        href="https://github.com/FokoJunior"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary transition-colors"
                        style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}
                      >
                        github.com/FokoJunior
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group neo-brutalism-card-inner p-2 rounded-md transition-all">
                    <div
                      className="p-3 rounded-full group-hover:bg-primary/20 transition-colors"
                      style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.1)` }}
                    >
                      <MapPin
                        className="h-5 w-5 group-hover:scale-110 transition-transform"
                        style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("location")}</p>
                      <span className="font-medium">Douala - Logpom, Cameroun</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ContactForm onSubmit={handleContactSubmit} primaryHue={primaryHue} />
            </motion.div>
          </motion.div>
        </section>

        {/* Robot Animation Section */}
        <section className="container py-16 md:py-24 border-t">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center neon-text">Mon Assistant Robot</h2>
            <div className="h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg neo-brutalism-terminal">
              {isMounted && <RobotAnimation primaryHue={primaryHue} />}
            </div>
          </motion.div>
        </section>
      </main>
      <footer className="border-t py-12 relative z-10 bg-background/90 backdrop-blur-sm">
        <div className="container">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}>
                F_Junior
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Étudiant en Master 1 Génie Logiciel et Systèmes d'Information, passionné par le développement web, mobile et l'intelligence artificielle.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Douala, Cameroun</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Navigation</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#home" className="text-muted-foreground hover:text-primary transition-colors">{t("home")}</Link></li>
                <li><Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">{t("about")}</Link></li>
                <li><Link href="#skills" className="text-muted-foreground hover:text-primary transition-colors">{t("skills")}</Link></li>
                <li><Link href="#projects" className="text-muted-foreground hover:text-primary transition-colors">{t("projects")}</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">{t("blog")}</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Contact</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:benitojunior2022@gmail.com" className="hover:text-primary transition-colors">
                    benitojunior2022@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+237 690 713 130</span>
                </li>
              </ul>
              <Link href="/CV_FOKO_JUNIOR.pdf" target="_blank">
                <Button
                  size="sm"
                  className="mt-2"
                  style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger CV
                </Button>
              </Link>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Réseaux sociaux</h3>
              <div className="flex gap-3">
                <Link href="https://github.com/FokoJunior" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-primary/10 transition-colors"
                    style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                  >
                    <Github className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="https://linkedin.com/in/fokojunior" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-primary/10 transition-colors"
                    style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                  >
                    <Linkedin className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="https://twitter.com/FokoJunior" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-primary/10 transition-colors"
                    style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                  >
                    <Twitter className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="mailto:benitojunior2022@gmail.com">
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-primary/10 transition-colors"
                    style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                  >
                    <Mail className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                © {new Date().getFullYear()} {t("nickname")}. {t("allRightsReserved")}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                By F_Junior.
              </p>
            </div>
          </div>
        </div>
      </footer>
      {isMounted && <ChatButton />}
    </div>
  )
}

function SkillCard({
  title,
  description,
  skills,
  primaryHue,
  icon,
}: {
  title: string
  description: string
  skills: string[]
  primaryHue: number
  icon?: React.ReactNode
}) {
  return (
    <Card
      className="hover:shadow-lg transition-shadow h-full neo-brutalism-card"
      style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon && (
            <div className="p-2 rounded-md" style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.1)` }}>
              <div style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}>{icon}</div>
            </div>
          )}
          <CardTitle className="neon-text">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="hover:bg-primary/20 transition-colors neo-brutalism-badge"
              style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectCard({
  title,
  description,
  tags,
  image,
  demoLink,
  codeLink,
  detailsLink,
  primaryHue,
}: {
  title: string
  description: string
  tags: string[]
  image: string
  demoLink: string
  codeLink: string
  detailsLink: string
  primaryHue: number
}) {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 h-full group neo-brutalism-card"
      style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
    >
      <div className="aspect-video bg-muted overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="group-hover:text-primary transition-colors neon-text">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="hover:bg-primary/20 transition-colors neo-brutalism-badge"
              style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Link href={demoLink} className="flex-1">
          <Button
            variant="default"
            className="w-full group text-sm neo-brutalism-button"
            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
          >
            Demo
            <ArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Button>
        </Link>
        <Link href={codeLink} className="flex-1">
          <Button variant="outline" className="w-full group text-sm neo-brutalism-button-outline">
            <Github className="mr-1 h-3 w-3" />
            Code
          </Button>
        </Link>
        <Link href={detailsLink} className="flex-1">
          <Button variant="ghost" className="w-full group text-sm neo-brutalism-button-ghost">
            Détails
            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function ContactForm({ onSubmit, primaryHue }: { onSubmit: (e: React.FormEvent) => void; primaryHue: number }) {
  const { t } = useLanguage()

  return (
    <Card
      className="hover:shadow-lg transition-shadow neo-brutalism-card"
      style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
    >
      <CardHeader>
        <CardTitle className="neon-text">{t("sendMessage")}</CardTitle>
        <CardDescription>{t("fillForm")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t("name")}
              </label>
              <input
                id="name"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors neo-brutalism-input"
                placeholder={t("yourName")}
                style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors neo-brutalism-input"
                placeholder={t("yourEmail")}
                style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="subject" className="text-sm font-medium">
              {t("subject")}
            </label>
            <input
              id="subject"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors neo-brutalism-input"
              placeholder={t("messageSubject")}
              style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">
              {t("message")}
            </label>
            <textarea
              id="message"
              required
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors neo-brutalism-input"
              placeholder={t("yourMessage")}
              style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
            />
          </div>
          <Button
            type="submit"
            className="w-full group neo-brutalism-button"
            style={
              {
                backgroundColor: `hsl(${primaryHue}, 70%, 50%)`,
                "--glow-color": `hsl(${primaryHue}, 70%, 50%)`,
              } as React.CSSProperties
            }
          >
            {t("sendMessage")}
            <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
