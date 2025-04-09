"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ArrowLeft,
  Download,
  Github,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  Heart,
  ChevronDown,
  ExternalLink,
  Star,
  Calendar,
  User,
  Zap,
  Laptop,
  Terminal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"
import { useRef, useState, useEffect } from "react"
import CursorParticles from "@/components/cursor-particles"
import ParallaxEffect from "@/components/parallax-effect"
import ImageDistortion from "@/components/image-distortion"
import AnimatedText from "@/components/animated-text"
import { useToast } from "@/hooks/use-toast"
import { useMobileDetector } from "@/components/mobile-detector"

export default function ResumePage() {
  const { t } = useLanguage()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1])
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ["5%", "100%"])

  // Real-time color change effect
  const [primaryHue, setPrimaryHue] = useState(0)

  // Ajouter la logique pour faire disparaître l'indicateur de défilement
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  // Dans la fonction ResumePage, ajoutez cette ligne après les autres déclarations d'état
  const isMobile = useMobileDetector()

  // Dans le useEffect, ajouter la logique pour masquer l'indicateur de défilement
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

  // Animation pour les barres de progression avec effet multicolore
  const progressAnimation = {
    initial: { width: 0, backgroundColor: `hsl(${primaryHue}, 70%, 50%)` },
    animate: (value: number) => ({
      width: `${value}%`,
      backgroundColor: `hsl(${primaryHue}, 70%, 50%)`,
      transition: {
        width: { duration: 1, ease: "easeOut" },
      },
    }),
  }

  const { toast } = useToast()

  const handleDownloadCV = () => {
    try {
      // URL vers le fichier CV
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

  return (
    <div className="min-h-screen bg-background bg-dot-pattern" ref={ref}>
      <CursorParticles count={20} color={`hsl(${primaryHue}, 70%, 50%)`} />

      {/* Modifiez la ligne de la barre de progression pour qu'elle soit plus visible sur mobile */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50"
        style={{
          scaleX: scrollYProgress,
          transformOrigin: "0%",
          backgroundColor: `hsl(${primaryHue}, 70%, 50%)`,
          opacity: isMobile ? 1 : 0.8, // Plus visible sur mobile
          boxShadow: `0 0 10px hsl(${primaryHue}, 70%, 50%)`,
        }}
      />

      <div className="container py-12">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <Button variant="ghost" className="group neo-brutalism-button-ghost">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <AnimatedText text={t("backToHome")} type="wave" delay={0.05} />
            </Button>
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="group neo-brutalism-button"
              onClick={handleDownloadCV}
              style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
            >
              <Download className="mr-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
              {t("downloadCV")}
            </Button>
          </motion.div>
        </motion.div>

        <motion.div style={{ opacity, scale }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-20 neo-brutalism-card">
              <CardHeader>
                <div className="flex flex-col items-center">
                  <ImageDistortion
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/offre1.png-7V1cq574NBrNh8wugK0n79GIU6VEpV.jpeg"
                    alt="FOKO TADJUIGE BENOIT JUNIOR"
                    className="w-32 h-32 rounded-full mb-4 border-4 overflow-hidden neo-brutalism-image"
                    style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.2)` }}
                  />
                  <CardTitle className="text-2xl neon-text">
                    <AnimatedText text="FOKO TADJUIGE BENOIT JUNIOR" type="typewriter" delay={0.03} />
                  </CardTitle>
                  <CardDescription className="text-center">{t("profile")}</CardDescription>
                  <motion.div className="flex items-center gap-2 mt-2" whileHover={{ scale: 1.05 }}>
                    <Badge
                      variant="outline"
                      className="animate-pulse neo-brutalism-badge"
                      style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                    >
                      20 {t("years")}
                    </Badge>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="font-medium mb-2 flex items-center gap-2 neon-text">
                      <Phone className="h-4 w-4" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                      {t("contact")}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <motion.div
                        className="flex items-center gap-2 neo-brutalism-card-inner p-2 rounded-md"
                        whileHover={{ x: 5, color: `hsl(${primaryHue}, 70%, 50%)` }}
                      >
                        <Phone className="h-4 w-4" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        <a href="tel:+237690713130" className="hover:text-primary transition-colors">
                          +237 690-713-130
                        </a>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2 neo-brutalism-card-inner p-2 rounded-md"
                        whileHover={{ x: 5, color: `hsl(${primaryHue}, 70%, 50%)` }}
                      >
                        <Mail className="h-4 w-4" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        <a href="mailto:benitojunior2022@gmail.com" className="hover:text-primary transition-colors">
                          benitojunior2022@gmail.com
                        </a>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2 neo-brutalism-card-inner p-2 rounded-md"
                        whileHover={{ x: 5, color: `hsl(${primaryHue}, 70%, 50%)` }}
                      >
                        <Github className="h-4 w-4" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        <a
                          href="https://github.com/FokoJunior"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          github.com/FokoJunior
                        </a>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2 neo-brutalism-card-inner p-2 rounded-md"
                        whileHover={{ x: 5, color: `hsl(${primaryHue}, 70%, 50%)` }}
                      >
                        <MapPin className="h-4 w-4" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        <span>Douala, Cameroun</span>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h3 className="font-medium mb-2 flex items-center gap-2 neon-text">
                      <Languages className="h-4 w-4" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                      {t("languages")}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t("french")}</span>
                          <span className="text-sm">{t("fluent")} (92%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                          <motion.div
                            className="h-full"
                            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                            custom={92}
                            variants={progressAnimation}
                            initial="initial"
                            animate="animate"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t("english")}</span>
                          <span className="text-sm">{t("beginner")} (20%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                          <motion.div
                            className="h-full"
                            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                            custom={20}
                            variants={progressAnimation}
                            initial="initial"
                            animate="animate"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h3 className="font-medium mb-2 flex items-center gap-2 neon-text">
                      <Code className="h-4 w-4" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                      {t("hardSkills")}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">HTML</span>
                          <span className="text-sm">98%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                          <motion.div
                            className="h-full"
                            custom={98}
                            variants={progressAnimation}
                            initial="initial"
                            animate="animate"
                            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">CSS</span>
                          <span className="text-sm">92%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                          <motion.div
                            className="h-full"
                            custom={92}
                            variants={progressAnimation}
                            initial="initial"
                            animate="animate"
                            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">JavaScript</span>
                          <span className="text-sm">66%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                          <motion.div
                            className="h-full"
                            custom={66}
                            variants={progressAnimation}
                            initial="initial"
                            animate="animate"
                            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">PHP</span>
                          <span className="text-sm">85%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                          <motion.div
                            className="h-full"
                            custom={85}
                            variants={progressAnimation}
                            initial="initial"
                            animate="animate"
                            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">SQL</span>
                          <span className="text-sm">78%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                          <motion.div
                            className="h-full"
                            custom={78}
                            variants={progressAnimation}
                            initial="initial"
                            animate="animate"
                            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Python</span>
                          <span className="text-sm">75%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                          <motion.div
                            className="h-full"
                            custom={75}
                            variants={progressAnimation}
                            initial="initial"
                            animate="animate"
                            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Bash</span>
                          <span className="text-sm">89%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                          <motion.div
                            className="h-full"
                            custom={89}
                            variants={progressAnimation}
                            initial="initial"
                            animate="animate"
                            style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <h3 className="font-medium mb-2 flex items-center gap-2 neon-text">
                      <Heart className="h-4 w-4" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                      {t("interests")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                        <Badge variant="outline" className="neo-brutalism-badge">
                          Musique
                        </Badge>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.95 }}>
                        <Badge variant="outline" className="neo-brutalism-badge">
                          Sport
                        </Badge>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                        <Badge variant="outline" className="neo-brutalism-badge">
                          Jeux Vidéos
                        </Badge>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.95 }}>
                        <Badge variant="outline" className="neo-brutalism-badge">
                          Programmation
                        </Badge>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
              <ParallaxEffect intensity={0.05}>
                <motion.div variants={item}>
                  <Card className="neo-brutalism-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 neon-text">
                        <User className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        {t("profile")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Étudiant en troisième année de Génie Informatique à l'Université d'Abomey-Calavi (UAC), je
                        souhaite mettre en pratique mes compétences dans un environnement stimulant et rigoureux. Je me
                        distingue par mon esprit de synthèse, ainsi que par mes solides compétences dans le
                        développement logiciel. Curieux et ouvert, j'apprécie travailler sur des problématiques variées
                        et relever des défis techniques.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </ParallaxEffect>

              <ParallaxEffect intensity={0.08}>
                <motion.div
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="neo-brutalism-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 neon-text">
                        <Briefcase className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        {t("workExperience")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Responsable Tech</h3>
                            <p className="text-muted-foreground">Uniprice - Douala, CAMEROUN</p>
                          </div>
                          <Badge
                            className="animate-pulse neo-brutalism-badge"
                            style={{
                              backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                              color: `hsl(${primaryHue}, 70%, 50%)`,
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Septembre 2023 - Présent
                          </Badge>
                        </div>
                        <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                          <li>Supervision de l'infrastructure technique et du développement logiciel</li>
                          <li>Gestion et optimisation des systèmes informatiques internes</li>
                          <li>Encadrement des équipes techniques et suivi des projets digitaux</li>
                          <li>
                            Mise en place de solutions innovantes pour améliorer l'efficacité des processus internes
                          </li>
                        </ul>
                      </div>

                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Développeur stagiaire</h3>
                            <p className="text-muted-foreground">SyndaTech - Douala, CAMEROUN</p>
                          </div>
                          <Badge
                            className="neo-brutalism-badge"
                            style={{
                              backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                              color: `hsl(${primaryHue}, 70%, 50%)`,
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Avril - Mai 2023
                          </Badge>
                        </div>
                        <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                          <li>Analyse et gestion du flux de données</li>
                          <li>Conception et réalisation d'un site web pour SyndaTech (syndatech.com)</li>
                          <li>Conception et développement d'un blog interactif pour SyndaTech</li>
                        </ul>
                      </div>

                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Développeur stagiaire</h3>
                            <p className="text-muted-foreground">SyndaTech - Douala, CAMEROUN</p>
                          </div>
                          <Badge
                            className="neo-brutalism-badge"
                            style={{
                              backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                              color: `hsl(${primaryHue}, 70%, 50%)`,
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Juin - Août 2022
                          </Badge>
                        </div>
                        <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                          <li>Analyse et gestion du flux de données</li>
                          <li>Conception et développement de plusieurs formulaires pour des applications internes</li>
                          <li>Mise en place d'un système VoIP</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </ParallaxEffect>

              <ParallaxEffect intensity={0.08}>
                <motion.div
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="neo-brutalism-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 neon-text">
                        <GraduationCap className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        {t("education")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Licence - Génie Logiciel</h3>
                            <p className="text-muted-foreground">UAC, Douala, Cameroun</p>
                          </div>
                          <Badge
                            className="animate-pulse neo-brutalism-badge"
                            style={{
                              backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                              color: `hsl(${primaryHue}, 70%, 50%)`,
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            2024 - Présent
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Spécialisation en développement web et mobile, intelligence artificielle et sécurité
                          informatique.
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">DUT - GÉNIE INFORMATIQUE</h3>
                            <p className="text-muted-foreground">JFN-HUI, Douala, Cameroun</p>
                          </div>
                          <Badge
                            className="neo-brutalism-badge"
                            style={{
                              backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                              color: `hsl(${primaryHue}, 70%, 50%)`,
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            2022 - 2024
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Formation en programmation, bases de données, réseaux et systèmes d'information.
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">BACCALAURÉAT TI</h3>
                            <p className="text-muted-foreground">LYCLAF, Foumban, Cameroun</p>
                          </div>
                          <Badge
                            className="neo-brutalism-badge"
                            style={{
                              backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                              color: `hsl(${primaryHue}, 70%, 50%)`,
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            2021 - 2022
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </ParallaxEffect>

              <ParallaxEffect intensity={0.08}>
                <motion.div
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="neo-brutalism-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 neon-text">
                        <Award className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        {t("certifications")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Cisco Certified Network Associate (CCNA)</h3>
                            <p className="text-muted-foreground">Cisco</p>
                          </div>
                          <Badge
                            className="neo-brutalism-badge"
                            style={{
                              backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                              color: `hsl(${primaryHue}, 70%, 50%)`,
                            }}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Janvier 2023
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Certification en réseaux informatiques couvrant les fondamentaux des réseaux, la configuration
                          des routeurs et commutateurs, et les protocoles de routage.
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">HTML CSS</h3>
                            <p className="text-muted-foreground">ALISON</p>
                          </div>
                          <Badge
                            className="neo-brutalism-badge"
                            style={{
                              backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                              color: `hsl(${primaryHue}, 70%, 50%)`,
                            }}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Novembre 2022
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Maîtrise des langages de balisage et de style pour la création de sites web modernes et
                          responsives.
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Python</h3>
                            <p className="text-muted-foreground">HackerRank</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="neo-brutalism-badge"
                            style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            En cours
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </ParallaxEffect>

              <ParallaxEffect intensity={0.08}>
                <motion.div
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="neo-brutalism-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 neon-text">
                        <Laptop className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        {t("technicalSkills")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">React</span>
                            <span className="text-sm">85%</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                            <motion.div
                              className="h-full"
                              custom={85}
                              variants={progressAnimation}
                              initial="initial"
                              animate="animate"
                              style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Next.js</span>
                            <span className="text-sm">80%</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                            <motion.div
                              className="h-full"
                              custom={80}
                              variants={progressAnimation}
                              initial="initial"
                              animate="animate"
                              style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Node.js</span>
                            <span className="text-sm">75%</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                            <motion.div
                              className="h-full"
                              custom={75}
                              variants={progressAnimation}
                              initial="initial"
                              animate="animate"
                              style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">TypeScript</span>
                            <span className="text-sm">70%</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                            <motion.div
                              className="h-full"
                              custom={70}
                              variants={progressAnimation}
                              initial="initial"
                              animate="animate"
                              style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Tailwind CSS</span>
                            <span className="text-sm">90%</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                            <motion.div
                              className="h-full"
                              custom={90}
                              variants={progressAnimation}
                              initial="initial"
                              animate="animate"
                              style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Git</span>
                            <span className="text-sm">85%</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden neo-brutalism-progress">
                            <motion.div
                              className="h-full"
                              custom={85}
                              variants={progressAnimation}
                              initial="initial"
                              animate="animate"
                              style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-3 neon-text">Compétences supplémentaires</h4>
                        <div className="flex flex-wrap gap-2">
                          {["Docker", "AWS", "Firebase", "MongoDB", "GraphQL", "Redux", "Jest", "CI/CD", "Figma"].map(
                            (skill, index) => (
                              <Badge
                                key={skill}
                                className="neo-brutalism-badge"
                                style={{
                                  backgroundColor: `hsl(${(primaryHue + index * 20) % 360}, 70%, 50%, 0.1)`,
                                  color: `hsl(${(primaryHue + index * 20) % 360}, 70%, 50%)`,
                                }}
                              >
                                {skill}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </ParallaxEffect>

              <ParallaxEffect intensity={0.08}>
                <motion.div
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="neo-brutalism-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 neon-text">
                        <Terminal className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
                        Projets personnels
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <span style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}>01.</span> Portfolio personnel
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Développement d'un portfolio moderne avec Next.js, Tailwind CSS et Framer Motion pour
                          présenter mes projets et compétences.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="neo-brutalism-badge">
                            Next.js
                          </Badge>
                          <Badge variant="outline" className="neo-brutalism-badge">
                            Tailwind CSS
                          </Badge>
                          <Badge variant="outline" className="neo-brutalism-badge">
                            Framer Motion
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" className="neo-brutalism-button-ghost">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Voir le projet
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <span style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}>02.</span> Application de gestion de
                          tâches
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Création d'une application web permettant de gérer des tâches avec fonctionnalités de
                          drag-and-drop, filtrage et authentification.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="neo-brutalism-badge">
                            React
                          </Badge>
                          <Badge variant="outline" className="neo-brutalism-badge">
                            Firebase
                          </Badge>
                          <Badge variant="outline" className="neo-brutalism-badge">
                            React DnD
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" className="neo-brutalism-button-ghost">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Voir le projet
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </ParallaxEffect>
            </motion.div>
          </div>
        </motion.div>
      </div>
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
    </div>
  )
}
