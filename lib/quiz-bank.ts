import tiktokBank from "@/lib/quiz-tiktok-bank.json"

export type QuizDifficulty = 1 | 2 | 3

export interface RawQuizItem {
  q: string
  a: string[]
  c: number
  d: QuizDifficulty
  cat: string
  exp?: string
}

export interface QuizQuestion {
  q: string
  options: string[]
  correctIdx: number
  category: string
  difficulty: QuizDifficulty
  explanation?: string
}

export type QuizThemePack = "all" | "culture" | "geo" | "science" | "sport" | "dev"

export const QUIZ_THEME_LABELS: Record<QuizThemePack, { fr: string; en: string }> = {
  all: { fr: "Tous thèmes", en: "All topics" },
  culture: { fr: "Culture & Afrique", en: "Culture & Africa" },
  geo: { fr: "Géo & Capitales", en: "Geo & Capitals" },
  science: { fr: "Sciences & Maths", en: "Science & Math" },
  sport: { fr: "Sport & Loisirs", en: "Sports & Fun" },
  dev: { fr: "Dev & Tech", en: "Dev & Tech" },
}

const DEV_QUESTIONS: RawQuizItem[] = [
  {
    q: "Quel hook React gère un état local dans un composant fonctionnel ?",
    a: ["useState()", "useEffect()", "useMemo()", "useRef()"],
    c: 0,
    d: 1,
    cat: "Dev & Tech",
    exp: "useState() déclare et met à jour un état local dans un composant React.",
  },
  {
    q: "Quel code HTTP indique une ressource introuvable ?",
    a: ["404", "200", "301", "500"],
    c: 0,
    d: 1,
    cat: "Dev & Tech",
    exp: "404 Not Found signifie que la ressource demandée n'existe pas.",
  },
  {
    q: "En Git, quelle commande crée ET bascule sur une nouvelle branche ?",
    a: ["git checkout -b", "git push -f", "git merge --abort", "git stash pop"],
    c: 0,
    d: 1,
    cat: "Dev & Tech",
  },
  {
    q: "Quel opérateur TypeScript vérifie null ou undefined pour fournir une valeur par défaut ?",
    a: ["??", "&&", "||=", "==="],
    c: 0,
    d: 2,
    cat: "Dev & Tech",
    exp: "L'opérateur de coalescence nulle (??) ne se déclenche que pour null ou undefined.",
  },
  {
    q: "En CSS, quelle propriété active une mise en page en grille bidimensionnelle ?",
    a: ["display: grid", "display: flex", "position: sticky", "float: left"],
    c: 0,
    d: 1,
    cat: "Dev & Tech",
  },
  {
    q: "Quelle méthode JavaScript transforme chaque élément d'un tableau et en retourne un nouveau ?",
    a: [".map()", ".forEach()", ".push()", ".splice()"],
    c: 0,
    d: 1,
    cat: "Dev & Tech",
  },
  {
    q: "Quel protocole sécurise les échanges HTTP avec chiffrement TLS ?",
    a: ["HTTPS", "FTP", "SMTP", "DNS"],
    c: 0,
    d: 1,
    cat: "Dev & Tech",
  },
  {
    q: "En SQL, quelle clause filtre les lignes avant un regroupement ?",
    a: ["WHERE", "ORDER BY", "GROUP BY", "LIMIT"],
    c: 0,
    d: 2,
    cat: "Dev & Tech",
  },
  {
    q: "Dans Next.js App Router, quel fichier définit la mise en page partagée d'un segment ?",
    a: ["layout.tsx", "route.ts", "loading.tsx", "middleware.ts"],
    c: 0,
    d: 2,
    cat: "Dev & Tech",
  },
  {
    q: "Quelle est la complexité moyenne d'une recherche dans une table de hachage (HashMap) ?",
    a: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
    c: 0,
    d: 2,
    cat: "Dev & Tech",
  },
  {
    q: "Quel fichier décrit les dépendances et scripts d'un projet Node.js ?",
    a: ["package.json", "tsconfig.json", "Dockerfile", ".gitignore"],
    c: 0,
    d: 1,
    cat: "Dev & Tech",
  },
  {
    q: "En Docker, quelle commande construit une image à partir d'un Dockerfile ?",
    a: ["docker build", "docker pull", "docker ps", "docker logs"],
    c: 0,
    d: 2,
    cat: "Dev & Tech",
  },
  {
    q: "Quel code HTTP correspond à « Trop de requêtes » (rate limit) ?",
    a: ["429", "401", "403", "502"],
    c: 0,
    d: 3,
    cat: "Dev & Tech",
  },
  {
    q: "Quel type PostgreSQL stocke du JSON indexable en binaire ?",
    a: ["JSONB", "TEXT", "BLOB", "VARCHAR"],
    c: 0,
    d: 3,
    cat: "Dev & Tech",
  },
  {
    q: "Quelle commande SQL permet d'éviter les doublons dans un SELECT ?",
    a: ["SELECT DISTINCT", "SELECT UNIQUE", "SELECT FILTER", "SELECT ONLY"],
    c: 0,
    d: 2,
    cat: "Dev & Tech",
  },
]

const ALL_RAW_QUESTIONS: RawQuizItem[] = [
  ...DEV_QUESTIONS,
  ...(tiktokBank as RawQuizItem[]),
]

const THEME_CATS: Record<Exclude<QuizThemePack, "all">, Set<string>> = {
  culture: new Set(["Afrique", "Indépendances", "Histoire", "Culture générale", "Littérature", "Art", "Musique", "Monnaies", "Chiffres romains"]),
  geo: new Set(["Géographie", "Capitales", "Continents", "Villes", "Afrique"]),
  science: new Set(["Sciences", "Chimie", "Espace", "Nature", "Corps humain", "Maths", "Calcul mental", "Animaux"]),
  sport: new Set(["Sport", "Cuisine", "Fruits", "Musique", "Animaux", "Culture générale"]),
  dev: new Set(["Dev & Tech", "Informatique"]),
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function toShuffledQuestion(raw: RawQuizItem): QuizQuestion {
  const indexed = raw.a.map((text, idx) => ({ text, isCorrect: idx === raw.c }))
  const mixed = shuffle(indexed)
  return {
    q: raw.q,
    options: mixed.map((m) => m.text),
    correctIdx: mixed.findIndex((m) => m.isCorrect),
    category: raw.cat,
    difficulty: raw.d,
    ...(raw.exp ? { explanation: raw.exp } : {}),
  }
}

export function getQuizBankSize(): number {
  return ALL_RAW_QUESTIONS.length
}

/**
 * Pick `count` varied questions from the 1,100+ bank (General culture + Africa + Science + Sport + Dev).
 * Avoids repeating the same category back-to-back so every match feels super lively and diverse.
 */
export function pickQuizQuestions(
  count = 5,
  theme: QuizThemePack = "all",
  difficulty: QuizDifficulty | "all" = "all",
): QuizQuestion[] {
  let pool = ALL_RAW_QUESTIONS
  if (theme !== "all") {
    const allowed = THEME_CATS[theme]
    pool = pool.filter((item) => allowed.has(item.cat))
  }
  if (difficulty !== "all") {
    const byDiff = pool.filter((item) => item.d === difficulty)
    if (byDiff.length >= count) pool = byDiff
  }

  const shuffled = shuffle(pool)
  const picked: RawQuizItem[] = []
  const usedCategories = new Set<string>()

  // Pass 1: pick distinct categories first (for maximum variety!)
  for (const item of shuffled) {
    if (picked.length >= count) break
    if (!usedCategories.has(item.cat)) {
      picked.push(item)
      usedCategories.add(item.cat)
    }
  }

  // Pass 2: fill any remaining slots if requested count > distinct categories
  if (picked.length < count) {
    const pickedSet = new Set(picked.map((p) => p.q))
    for (const item of shuffled) {
      if (picked.length >= count) break
      if (!pickedSet.has(item.q)) {
        picked.push(item)
        pickedSet.add(item.q)
      }
    }
  }

  return shuffle(picked).map(toShuffledQuestion)
}
