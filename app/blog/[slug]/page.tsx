"use client"

import type React from "react"

import Link from "next/link"
import { useParams } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Facebook, Linkedin, Tag, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { useMobileDetector } from "@/components/mobile-detector"

const blogPosts = [
  {
    id: 1,
    title: "Comment débuter avec React: Guide pour débutants",
    excerpt:
      "Apprenez les bases de React et comment créer votre premier composant dans ce guide complet pour les débutants.",
    content: `
      <h2>Introduction à React</h2>
      <p>React est une bibliothèque JavaScript pour construire des interfaces utilisateur. Elle a été développée par Facebook et est maintenant maintenue par Facebook et une communauté de développeurs individuels et d'entreprises. React permet aux développeurs de créer de grandes applications web qui peuvent changer de données sans recharger la page.</p>
      
      <p>Dans ce guide, nous allons couvrir les bases de React et vous guider à travers la création de votre premier composant.</p>
      
      <h2>Pourquoi React?</h2>
      <p>React présente plusieurs avantages qui en font un choix populaire pour le développement frontend:</p>
      <ul>
        <li>Architecture basée sur les composants: React est construit autour du concept de composants réutilisables, ce qui facilite la gestion des interfaces utilisateur complexes.</li>
        <li>DOM virtuel: React utilise un DOM virtuel pour optimiser les performances de rendu.</li>
        <li>Syntaxe déclarative: React facilite la compréhension et le débogage de votre code.</li>
        <li>Fort soutien communautaire: React dispose d'une grande communauté et d'un écosystème de bibliothèques et d'outils.</li>
      </ul>
      
      <h2>Configuration de votre premier projet</h2>
      <p>La façon la plus simple de commencer avec React est d'utiliser Create React App, un outil qui configure un nouveau projet React avec une bonne configuration par défaut.</p>
      
      <div class="code-block">
      <pre><code>npx create-react-app mon-premier-app
cd mon-premier-app
npm start</code></pre>
      </div>
      
      <p>Cela créera un nouveau projet React et démarrera un serveur de développement. Vous pouvez maintenant ouvrir votre navigateur et naviguer vers http://localhost:3000 pour voir votre application en cours d'exécution.</p>
      
      <h2>Création de votre premier composant</h2>
      <p>Dans React, un composant est un morceau d'interface utilisateur réutilisable. Créons un composant simple qui affiche un message de bienvenue.</p>
      
      <div class="code-block">
      <pre><code>// src/components/Greeting.js
import React from 'react';

function Greeting(props) {
  return (
    <div>
      <h1>Bonjour, {props.name}!</h1>
      <p>Bienvenue à React.</p>
    </div>
  );
}

export default Greeting;</code></pre>
      </div>
      
      <p>Maintenant, vous pouvez utiliser ce composant dans votre fichier App.js:</p>
      
      <div class="code-block">
      <pre><code>// src/App.js
import React from 'react';
import Greeting from './components/Greeting';

function App() {
  return (
    <div className="App">
      <Greeting name="Monde" />
    </div>
  );
}

export default App;</code></pre>
      </div>
      
      <h2>Comprendre les Props</h2>
      <p>Dans l'exemple ci-dessus, nous avons passé une prop appelée "name" à notre composant Greeting. Les props (abréviation de propriétés) sont un moyen de passer des données d'un composant parent à un composant enfant.</p>
      
      <h2>Ajout d'état à votre composant</h2>
      <p>Alors que les props sont passées à un composant, l'état est géré à l'intérieur du composant. Modifions notre composant Greeting pour inclure une variable d'état:</p>
      
      <div class="code-block">
      <pre><code>// src/components/Greeting.js
import React, { useState } from 'react';

function Greeting(props) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Bonjour, {props.name}!</h1>
      <p>Bienvenue à React.</p>
      <p>Vous avez cliqué sur le bouton {count} fois.</p>
      <button onClick={() => setCount(count + 1)}>
        Cliquez-moi
      </button>
    </div>
  );
}

export default Greeting;</code></pre>
      </div>
      
      <h2>Conclusion</h2>
      <p>Ce guide a couvert les bases de React, y compris la configuration d'un projet, la création de composants, l'utilisation des props et la gestion de l'état. React a beaucoup plus à offrir, comme les méthodes de cycle de vie, les hooks, le contexte, et plus encore. Au fur et à mesure que vous poursuivez votre voyage React, vous découvrirez ces fonctionnalités et comment elles peuvent vous aider à construire des applications web puissantes.</p>
    `,
    date: "15 Mars 2023",
    readTime: "5 min de lecture",
    category: "React",
    tags: ["React", "JavaScript", "Développement Web", "Frontend"],
    author: {
      name: "F_Junior",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/offre1.png-7V1cq574NBrNh8wugK0n79GIU6VEpV.jpeg",
    },
    slug: "debuter-avec-react",
  },
  {
    id: 2,
    title: "Comprendre le CSS Grid Layout",
    excerpt: "Plongez dans CSS Grid Layout et apprenez à créer des mises en page web complexes facilement.",
    content: `
      <h2>Introduction au CSS Grid</h2>
      <p>CSS Grid Layout est un système de mise en page bidimensionnel conçu pour le web. Il vous permet d'organiser le contenu en lignes et en colonnes et possède de nombreuses fonctionnalités qui facilitent la construction de mises en page complexes.</p>
      
      <h2>Concepts de base</h2>
      <p>Pour commencer avec CSS Grid, vous devez comprendre quelques concepts clés:</p>
      <ul>
        <li>Conteneur de grille: L'élément sur lequel display: grid est appliqué.</li>
        <li>Éléments de grille: Les enfants du conteneur de grille.</li>
        <li>Lignes de grille: Les lignes horizontales et verticales qui divisent la grille.</li>
        <li>Pistes de grille: L'espace entre deux lignes de grille adjacentes (lignes ou colonnes).</li>
        <li>Cellule de grille: L'intersection d'une ligne et d'une colonne.</li>
        <li>Zone de grille: Une zone rectangulaire sur la grille contenant une ou plusieurs cellules de grille.</li>
      </ul>
      
      <h2>Création d'une grille de base</h2>
      <p>Commençons par créer une grille simple avec trois colonnes et deux lignes:</p>
      
      <div class="code-block">
      <pre><code>.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 100px;
  gap: 10px;
}

.item {
  background-color: #f0f0f0;
  padding: 20px;
  text-align: center;
}</code></pre>
      </div>
      
      <p>Dans cet exemple, nous utilisons l'unité fr, qui représente une fraction de l'espace disponible. Ainsi, 1fr 1fr 1fr crée trois colonnes de largeur égale.</p>
      
      <h2>Placement des éléments sur la grille</h2>
      <p>Vous pouvez placer des éléments sur la grille en utilisant les propriétés grid-column et grid-row:</p>
      
      <div class="code-block">
      <pre><code>.item1 {
  grid-column: 1 / 3; /* Commence à la ligne 1, termine à la ligne 3 */
  grid-row: 1 / 2; /* Commence à la ligne 1, termine à la ligne 2 */
}

.item2 {
  grid-column: 3 / 4; /* Commence à la ligne 3, termine à la ligne 4 */
  grid-row: 1 / 3; /* Commence à la ligne 1, termine à la ligne 3 */
}</code></pre>
      </div>
    `,
    date: "2 Avril 2023",
    readTime: "7 min de lecture",
    category: "CSS",
    tags: ["CSS", "Web Design", "Mise en page", "Frontend"],
    author: {
      name: "F_Junior",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/offre1.png-7V1cq574NBrNh8wugK0n79GIU6VEpV.jpeg",
    },
    slug: "comprendre-css-grid",
  },
]

export default function BlogPostPage() {
  const { t } = useLanguage()
  const params = useParams()
  const slug = params.slug as string
  const ref = useRef(null)
  const [primaryHue, setPrimaryHue] = useState(0)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1])
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0])
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ["5%", "100%"])

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

  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
        <p className="text-muted-foreground mb-8">L'article que vous recherchez n'existe pas.</p>
        <Link href="/blog">
          <Button>Retour au blog</Button>
        </Link>
      </div>
    )
  }

  // Get related posts (same category or tags)
  const relatedPosts = blogPosts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((tag) => post.tags.includes(tag))))
    .slice(0, 2)

  return (
    <div className="min-h-screen" ref={ref}>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50"
        style={{
          scaleX: scrollYProgress,
          transformOrigin: "0%",
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
          <p className="text-sm text-muted-foreground mb-2">Défilez pour lire</p>
          <ChevronDown className="h-6 w-6" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
        </motion.div>
      </motion.div>

      <div className="container px-4 sm:px-6 py-8 md:py-12">
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/blog">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour au blog
            </Button>
          </Link>
        </motion.div>

        <motion.div style={{ opacity, scale, y }} className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge
              className="mb-4 animate-pulse"
              style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`, color: `hsl(${primaryHue}, 70%, 50%)` }}
            >
              {post.category}
            </Badge>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
              style={{ color: `hsl(${primaryHue}, 50%, 50%)` }}
            >
              {post.title}
            </h1>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-4 mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <motion.img
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.3 }}
              />
              <span className="text-sm">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </motion.div>

          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.img
              src={`/placeholder.svg?height=400&width=800&text=${post.title}`}
              alt={post.title}
              className="w-full h-auto rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          <motion.div
            className="prose prose-lg max-w-none dark:prose-invert mb-8 md:mb-12 blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={
              {
                "--primary-hue": primaryHue,
              } as React.CSSProperties
            }
          />

          <motion.div
            className="flex flex-wrap gap-2 mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {post.tags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 3 : -3 }}
              >
                <Badge
                  variant="outline"
                  className="flex items-center gap-1"
                  style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="border-t border-b py-6 my-6 md:my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <motion.img
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div>
                  <p className="font-medium">Écrit par {post.author.name}</p>
                  <p className="text-sm text-muted-foreground">Développeur Full Stack & Rédacteur Technique</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" size="icon" style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" size="icon" style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}>
                    <Twitter className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" size="icon" style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}>
                    <Facebook className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" size="icon" style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)` }}>
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {relatedPosts.length > 0 && (
            <motion.div
              className="mt-8 md:mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h2
                className="text-xl md:text-2xl font-bold mb-4 md:mb-6"
                style={{ color: `hsl(${primaryHue}, 50%, 50%)` }}
              >
                Articles similaires
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                  >
                    <Card
                      className="hover:shadow-md transition-shadow"
                      style={{ borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)` }}
                    >
                      <CardContent className="p-4">
                        <Badge
                          className="mb-2 animate-pulse"
                          style={{
                            backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)`,
                            color: `hsl(${primaryHue}, 70%, 50%)`,
                          }}
                        >
                          {relatedPost.category}
                        </Badge>
                        <h3 className="text-lg font-bold mb-2">
                          <Link
                            href={`/blog/${relatedPost.slug}`}
                            className="hover:text-primary transition-colors"
                            style={{ color: `hsl(${primaryHue}, 50%, 50%)` }}
                          >
                            {relatedPost.title}
                          </Link>
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">{relatedPost.excerpt}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">{relatedPost.date}</div>
                          <Link href={`/blog/${relatedPost.slug}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="group"
                              style={{ color: `hsl(${primaryHue}, 70%, 50%)` }}
                            >
                              Lire la suite
                              <motion.span className="ml-1 inline-block" initial={{ x: 0 }} whileHover={{ x: 3 }}>
                                →
                              </motion.span>
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        .blog-content .code-block {
          background-color: rgba(var(--card), 0.8);
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1.5rem 0;
          border-left: 4px solid hsl(var(--primary-hue), 70%, 50%);
          overflow-x: auto;
        }
        
        .blog-content .code-block pre {
          margin: 0;
          padding: 0;
        }
        
        .blog-content .code-block code {
          font-family: monospace;
          white-space: pre;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  )
}
