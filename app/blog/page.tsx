"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, Clock, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"

const blogPosts = [
  {
    id: 1,
    title: "Comment débuter avec React: Guide pour débutants",
    excerpt:
      "Apprenez les bases de React et comment créer votre premier composant dans ce guide complet pour les débutants.",
    date: "15 Mars 2023",
    readTime: "5 min de lecture",
    category: "React",
    author: {
      name: "F_Junior",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/offre1.png-7V1cq574NBrNh8wugK0n79GIU6VEpV.jpeg",
    },
    slug: "debuter-avec-react",
    featured: true,
  },
  {
    id: 2,
    title: "Comprendre le CSS Grid Layout",
    excerpt: "Plongez dans CSS Grid Layout et apprenez à créer des mises en page web complexes facilement.",
    date: "2 Avril 2023",
    readTime: "7 min de lecture",
    category: "CSS",
    author: {
      name: "F_Junior",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/offre1.png-7V1cq574NBrNh8wugK0n79GIU6VEpV.jpeg",
    },
    slug: "comprendre-css-grid",
  },
  {
    id: 3,
    title: "Les méthodes de tableau JavaScript à connaître",
    excerpt:
      "Explorez les méthodes de tableau JavaScript les plus utiles qui rendront votre code plus propre et plus efficace.",
    date: "10 Mai 2023",
    readTime: "6 min de lecture",
    category: "JavaScript",
    author: {
      name: "F_Junior",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/offre1.png-7V1cq574NBrNh8wugK0n79GIU6VEpV.jpeg",
    },
    slug: "methodes-tableau-javascript",
  },
  {
    id: 4,
    title: "Introduction à Next.js",
    excerpt:
      "Découvrez les avantages de Next.js et comment il peut vous aider à construire de meilleures applications React.",
    date: "22 Juin 2023",
    readTime: "8 min de lecture",
    category: "Next.js",
    author: {
      name: "F_Junior",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/offre1.png-7V1cq574NBrNh8wugK0n79GIU6VEpV.jpeg",
    },
    slug: "introduction-nextjs",
  },
  {
    id: 5,
    title: "Meilleures pratiques pour le design responsive",
    excerpt:
      "Apprenez les meilleures pratiques pour créer des sites web responsives qui fonctionnent bien sur tous les appareils.",
    date: "5 Juillet 2023",
    readTime: "5 min de lecture",
    category: "Web Design",
    author: {
      name: "F_Junior",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/offre1.png-7V1cq574NBrNh8wugK0n79GIU6VEpV.jpeg",
    },
    slug: "design-responsive-pratiques",
  },
  {
    id: 6,
    title: "Débuter avec TypeScript",
    excerpt: "Apprenez à utiliser TypeScript pour ajouter un typage statique à vos projets JavaScript.",
    date: "18 Août 2023",
    readTime: "7 min de lecture",
    category: "TypeScript",
    author: {
      name: "F_Junior",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/offre1.png-7V1cq574NBrNh8wugK0n79GIU6VEpV.jpeg",
    },
    slug: "debuter-avec-typescript",
  },
]

const categories = ["Tous", "React", "JavaScript", "CSS", "Next.js", "TypeScript", "Web Design"]

export default function BlogPage() {
  const { t } = useLanguage()

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

  const featuredPost = blogPosts.find((post) => post.featured)

  return (
    <div className="min-h-screen">
      <header className="bg-primary/5 py-12 md:py-16 lg:py-24">
        <div className="container px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t("myBlog")}</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">{t("blogSubtitle")}</p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder={t("searchArticles")} className="pl-10 pr-4 py-6 rounded-full" />
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-8 md:py-12">
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 md:mb-16"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t("featuredPost")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-video bg-muted overflow-hidden">
                <motion.img
                  src={`/placeholder.svg?height=400&width=600&text=${featuredPost.title}`}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="p-4 md:p-6 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Badge className="w-fit mb-2 animate-pulse">{featuredPost.category}</Badge>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 hover:text-primary transition-colors">
                    <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h3>
                  <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <motion.img
                        src={featuredPost.author.avatar || "/placeholder.svg"}
                        alt={featuredPost.author.name}
                        className="w-8 h-8 rounded-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="text-sm">{featuredPost.author.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <Button className="w-fit group">
                      {t("readMore")}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2 mb-6 md:mb-8 justify-center">
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Button
                variant={category === "Tous" ? "default" : "outline"}
                className="rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {blogPosts
            .filter((post) => !post.featured)
            .map((post) => (
              <motion.div key={post.id} variants={item}>
                <BlogPostCard post={post} />
              </motion.div>
            ))}
        </motion.div>

        <div className="flex justify-center mt-8 md:mt-12">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="rounded-full group">
              {t("loadMore")}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function BlogPostCard({ post }: { post: any }) {
  const { t } = useLanguage()
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col hover:border-primary/50">
      <div className="aspect-video bg-muted">
        <motion.img
          src={`/placeholder.svg?height=200&width=400&text=${post.title}`}
          alt={post.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary" className="animate-pulse">
            {post.category}
          </Badge>
          <div className="text-sm text-muted-foreground flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {post.readTime}
          </div>
        </div>
        <CardTitle className="hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <User className="h-3 w-3" />
          {post.author.name}
          <span className="mx-1">•</span>
          <Calendar className="h-3 w-3" />
          {post.date}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{post.excerpt}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/blog/${post.slug}`} className="w-full">
          <Button variant="outline" className="w-full group">
            {t("readMore")}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
