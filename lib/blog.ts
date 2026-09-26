export type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: number
  category: string
  tags: string[]
  /** HTML de l'article. Absent = article pas encore publié. */
  content?: string
}

export const posts: Post[] = [
  {
    slug: "debuter-avec-react",
    title: "Comment débuter avec React : guide pour débutants",
    excerpt:
      "Apprenez les bases de React et comment créer votre premier composant dans ce guide complet pour les débutants.",
    date: "15 mars 2023",
    readTime: 5,
    category: "React",
    tags: ["React", "JavaScript", "Développement Web", "Frontend"],
    content: `
      <h2>Introduction à React</h2>
      <p>React est une bibliothèque JavaScript pour construire des interfaces utilisateur. Développée par Facebook, elle est aujourd'hui maintenue par Meta et une large communauté. React permet de créer de grandes applications web dont les données changent sans recharger la page.</p>
      <p>Dans ce guide, nous allons couvrir les bases de React et créer ensemble votre premier composant.</p>

      <h2>Pourquoi React ?</h2>
      <p>React présente plusieurs avantages qui en font un choix populaire pour le développement frontend :</p>
      <ul>
        <li><strong>Architecture en composants</strong> : des briques réutilisables qui simplifient les interfaces complexes.</li>
        <li><strong>DOM virtuel</strong> : React optimise les performances de rendu.</li>
        <li><strong>Syntaxe déclarative</strong> : un code plus facile à comprendre et à déboguer.</li>
        <li><strong>Communauté</strong> : un immense écosystème de bibliothèques et d'outils.</li>
      </ul>

      <h2>Configurer votre premier projet</h2>
      <p>Le plus simple pour démarrer est d'utiliser un outil qui prépare un projet avec une bonne configuration par défaut :</p>
      <pre><code>npx create-react-app mon-premier-app
cd mon-premier-app
npm start</code></pre>
      <p>Ouvrez ensuite <code>http://localhost:3000</code> dans votre navigateur pour voir l'application tourner.</p>

      <h2>Créer votre premier composant</h2>
      <p>Un composant est un morceau d'interface réutilisable. Créons-en un qui affiche un message de bienvenue :</p>
      <pre><code>// src/components/Greeting.js
import React from 'react';

function Greeting(props) {
  return (
    &lt;div&gt;
      &lt;h1&gt;Bonjour, {props.name} !&lt;/h1&gt;
      &lt;p&gt;Bienvenue dans React.&lt;/p&gt;
    &lt;/div&gt;
  );
}

export default Greeting;</code></pre>
      <p>Utilisez-le ensuite dans <code>App.js</code> :</p>
      <pre><code>// src/App.js
import Greeting from './components/Greeting';

function App() {
  return (
    &lt;div className="App"&gt;
      &lt;Greeting name="Monde" /&gt;
    &lt;/div&gt;
  );
}

export default App;</code></pre>

      <h2>Comprendre les props</h2>
      <p>Nous avons passé une prop <code>name</code> au composant <code>Greeting</code>. Les props (propriétés) permettent de transmettre des données d'un composant parent à un composant enfant.</p>

      <h2>Ajouter un état</h2>
      <p>Les props viennent de l'extérieur ; l'état, lui, est géré à l'intérieur du composant :</p>
      <pre><code>import React, { useState } from 'react';

function Greeting(props) {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;h1&gt;Bonjour, {props.name} !&lt;/h1&gt;
      &lt;p&gt;Vous avez cliqué {count} fois.&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Cliquez-moi
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

      <h2>Conclusion</h2>
      <p>Nous avons vu comment configurer un projet, créer des composants, utiliser les props et gérer l'état. React offre bien plus — hooks, contexte, et tout un écosystème — que vous découvrirez au fil de vos projets.</p>
    `,
  },
  {
    slug: "comprendre-css-grid",
    title: "Comprendre le CSS Grid Layout",
    excerpt: "Plongez dans CSS Grid Layout et apprenez à créer des mises en page web complexes facilement.",
    date: "2 avril 2023",
    readTime: 7,
    category: "CSS",
    tags: ["CSS", "Web Design", "Mise en page", "Frontend"],
    content: `
      <h2>Introduction au CSS Grid</h2>
      <p>CSS Grid Layout est un système de mise en page bidimensionnel. Il organise le contenu en lignes et en colonnes et simplifie énormément la construction de mises en page complexes.</p>

      <h2>Concepts de base</h2>
      <ul>
        <li><strong>Conteneur de grille</strong> : l'élément sur lequel on applique <code>display: grid</code>.</li>
        <li><strong>Éléments de grille</strong> : les enfants directs du conteneur.</li>
        <li><strong>Lignes de grille</strong> : les séparations horizontales et verticales.</li>
        <li><strong>Pistes</strong> : l'espace entre deux lignes adjacentes (une ligne ou une colonne).</li>
        <li><strong>Cellule</strong> : l'intersection d'une ligne et d'une colonne.</li>
        <li><strong>Zone</strong> : un rectangle composé d'une ou plusieurs cellules.</li>
      </ul>

      <h2>Créer une grille simple</h2>
      <p>Une grille de trois colonnes et deux lignes :</p>
      <pre><code>.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 100px;
  gap: 10px;
}</code></pre>
      <p>L'unité <code>fr</code> représente une fraction de l'espace disponible : <code>1fr 1fr 1fr</code> crée donc trois colonnes de même largeur.</p>

      <h2>Placer les éléments</h2>
      <p>On positionne les éléments avec <code>grid-column</code> et <code>grid-row</code> :</p>
      <pre><code>.item1 {
  grid-column: 1 / 3; /* de la ligne 1 à la ligne 3 */
  grid-row: 1 / 2;
}

.item2 {
  grid-column: 3 / 4;
  grid-row: 1 / 3;
}</code></pre>
    `,
  },
  {
    slug: "methodes-tableau-javascript",
    title: "Les méthodes de tableau JavaScript à connaître",
    excerpt:
      "Explorez les méthodes de tableau JavaScript les plus utiles qui rendront votre code plus propre et plus efficace.",
    date: "10 mai 2023",
    readTime: 6,
    category: "JavaScript",
    tags: ["JavaScript"],
  },
  {
    slug: "introduction-nextjs",
    title: "Introduction à Next.js",
    excerpt:
      "Découvrez les avantages de Next.js et comment il peut vous aider à construire de meilleures applications React.",
    date: "22 juin 2023",
    readTime: 8,
    category: "Next.js",
    tags: ["Next.js", "React"],
  },
  {
    slug: "design-responsive-pratiques",
    title: "Meilleures pratiques pour le design responsive",
    excerpt: "Les bonnes pratiques pour créer des sites qui fonctionnent bien sur tous les appareils.",
    date: "5 juillet 2023",
    readTime: 5,
    category: "Web Design",
    tags: ["Web Design", "CSS"],
  },
  {
    slug: "debuter-avec-typescript",
    title: "Débuter avec TypeScript",
    excerpt: "Apprenez à utiliser TypeScript pour ajouter un typage statique à vos projets JavaScript.",
    date: "18 août 2023",
    readTime: 7,
    category: "TypeScript",
    tags: ["TypeScript", "JavaScript"],
  },
]

export const blogCategories = Array.from(new Set(posts.map((p) => p.category)))

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug)
}
