import type { T } from "@/lib/i18n"

export type Post = {
  slug: string
  title: T
  excerpt: T
  date: T
  readTime: number
  category: string
  tags: string[]
  /** HTML de l'article par langue. Absent = article pas encore publié. */
  content?: T
}

const REACT_FR = `
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
`

const REACT_EN = `
      <h2>Introduction to React</h2>
      <p>React is a JavaScript library for building user interfaces. Created by Facebook, it is now maintained by Meta and a large community. React lets you build large web applications whose data changes without reloading the page.</p>
      <p>In this guide, we'll cover the basics of React and build your first component together.</p>

      <h2>Why React?</h2>
      <p>React has several advantages that make it a popular choice for front-end development:</p>
      <ul>
        <li><strong>Component architecture</strong>: reusable building blocks that simplify complex interfaces.</li>
        <li><strong>Virtual DOM</strong>: React optimises rendering performance.</li>
        <li><strong>Declarative syntax</strong>: code that is easier to read and debug.</li>
        <li><strong>Community</strong>: a huge ecosystem of libraries and tools.</li>
      </ul>

      <h2>Setting up your first project</h2>
      <p>The easiest way to start is to use a tool that scaffolds a project with sensible defaults:</p>
      <pre><code>npx create-react-app my-first-app
cd my-first-app
npm start</code></pre>
      <p>Then open <code>http://localhost:3000</code> in your browser to see the app running.</p>

      <h2>Creating your first component</h2>
      <p>A component is a reusable piece of UI. Let's create one that displays a welcome message:</p>
      <pre><code>// src/components/Greeting.js
import React from 'react';

function Greeting(props) {
  return (
    &lt;div&gt;
      &lt;h1&gt;Hello, {props.name}!&lt;/h1&gt;
      &lt;p&gt;Welcome to React.&lt;/p&gt;
    &lt;/div&gt;
  );
}

export default Greeting;</code></pre>
      <p>Then use it in <code>App.js</code>:</p>
      <pre><code>// src/App.js
import Greeting from './components/Greeting';

function App() {
  return (
    &lt;div className="App"&gt;
      &lt;Greeting name="World" /&gt;
    &lt;/div&gt;
  );
}

export default App;</code></pre>

      <h2>Understanding props</h2>
      <p>We passed a <code>name</code> prop to the <code>Greeting</code> component. Props (properties) let a parent component pass data down to a child component.</p>

      <h2>Adding state</h2>
      <p>Props come from outside; state is managed inside the component:</p>
      <pre><code>import React, { useState } from 'react';

function Greeting(props) {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;h1&gt;Hello, {props.name}!&lt;/h1&gt;
      &lt;p&gt;You clicked {count} times.&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Click me
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

      <h2>Conclusion</h2>
      <p>We've seen how to set up a project, create components, use props and manage state. React offers much more — hooks, context and a whole ecosystem — that you'll discover as you build.</p>
`

const REACT_DE = `
      <h2>Einführung in React</h2>
      <p>React ist eine JavaScript-Bibliothek zum Erstellen von Benutzeroberflächen. Ursprünglich von Facebook entwickelt, wird sie heute von Meta und einer großen Community gepflegt. Mit React lassen sich große Webanwendungen bauen, deren Daten sich ändern, ohne dass die Seite neu geladen wird.</p>
      <p>In diesem Leitfaden behandeln wir die Grundlagen von React und bauen gemeinsam Ihre erste Komponente.</p>

      <h2>Warum React?</h2>
      <p>React hat mehrere Vorteile, die es zu einer beliebten Wahl für die Frontend-Entwicklung machen:</p>
      <ul>
        <li><strong>Komponentenarchitektur</strong>: wiederverwendbare Bausteine, die komplexe Oberflächen vereinfachen.</li>
        <li><strong>Virtuelles DOM</strong>: React optimiert die Rendering-Leistung.</li>
        <li><strong>Deklarative Syntax</strong>: Code, der leichter zu verstehen und zu debuggen ist.</li>
        <li><strong>Community</strong>: ein riesiges Ökosystem an Bibliotheken und Werkzeugen.</li>
      </ul>

      <h2>Ihr erstes Projekt einrichten</h2>
      <p>Am einfachsten starten Sie mit einem Werkzeug, das ein Projekt mit sinnvollen Standardeinstellungen anlegt:</p>
      <pre><code>npx create-react-app meine-erste-app
cd meine-erste-app
npm start</code></pre>
      <p>Öffnen Sie anschließend <code>http://localhost:3000</code> im Browser, um die App laufen zu sehen.</p>

      <h2>Ihre erste Komponente</h2>
      <p>Eine Komponente ist ein wiederverwendbarer Teil der Oberfläche. Erstellen wir eine, die eine Begrüßung anzeigt:</p>
      <pre><code>// src/components/Greeting.js
import React from 'react';

function Greeting(props) {
  return (
    &lt;div&gt;
      &lt;h1&gt;Hallo, {props.name}!&lt;/h1&gt;
      &lt;p&gt;Willkommen bei React.&lt;/p&gt;
    &lt;/div&gt;
  );
}

export default Greeting;</code></pre>
      <p>Verwenden Sie sie dann in <code>App.js</code>:</p>
      <pre><code>// src/App.js
import Greeting from './components/Greeting';

function App() {
  return (
    &lt;div className="App"&gt;
      &lt;Greeting name="Welt" /&gt;
    &lt;/div&gt;
  );
}

export default App;</code></pre>

      <h2>Props verstehen</h2>
      <p>Wir haben der Komponente <code>Greeting</code> eine Prop <code>name</code> übergeben. Props (Eigenschaften) geben Daten von einer Eltern- an eine Kindkomponente weiter.</p>

      <h2>Zustand hinzufügen</h2>
      <p>Props kommen von außen; der Zustand wird innerhalb der Komponente verwaltet:</p>
      <pre><code>import React, { useState } from 'react';

function Greeting(props) {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;h1&gt;Hallo, {props.name}!&lt;/h1&gt;
      &lt;p&gt;Sie haben {count}-mal geklickt.&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Klick mich
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

      <h2>Fazit</h2>
      <p>Wir haben gesehen, wie man ein Projekt einrichtet, Komponenten erstellt, Props nutzt und Zustand verwaltet. React bietet noch viel mehr — Hooks, Context und ein ganzes Ökosystem —, das Sie beim Entwickeln entdecken werden.</p>
`

const REACT_ZH = `
      <h2>React 简介</h2>
      <p>React 是一个用于构建用户界面的 JavaScript 库。它由 Facebook 创建，如今由 Meta 和庞大的社区共同维护。借助 React，可以构建数据变化时无需重新加载页面的大型 Web 应用。</p>
      <p>本指南将介绍 React 的基础知识，并带你一起编写第一个组件。</p>

      <h2>为什么选择 React？</h2>
      <p>React 有多项优势，使其成为前端开发的热门选择：</p>
      <ul>
        <li><strong>组件化架构</strong>：可复用的模块让复杂界面更易管理。</li>
        <li><strong>虚拟 DOM</strong>：React 优化了渲染性能。</li>
        <li><strong>声明式语法</strong>：代码更易理解和调试。</li>
        <li><strong>社区</strong>：拥有庞大的库和工具生态。</li>
      </ul>

      <h2>创建第一个项目</h2>
      <p>最简单的方式是使用一个带有合理默认配置的脚手架工具：</p>
      <pre><code>npx create-react-app my-first-app
cd my-first-app
npm start</code></pre>
      <p>然后在浏览器中打开 <code>http://localhost:3000</code>，即可看到应用运行。</p>

      <h2>编写第一个组件</h2>
      <p>组件是一段可复用的界面。我们来创建一个显示欢迎信息的组件：</p>
      <pre><code>// src/components/Greeting.js
import React from 'react';

function Greeting(props) {
  return (
    &lt;div&gt;
      &lt;h1&gt;你好，{props.name}！&lt;/h1&gt;
      &lt;p&gt;欢迎来到 React。&lt;/p&gt;
    &lt;/div&gt;
  );
}

export default Greeting;</code></pre>
      <p>然后在 <code>App.js</code> 中使用它：</p>
      <pre><code>// src/App.js
import Greeting from './components/Greeting';

function App() {
  return (
    &lt;div className="App"&gt;
      &lt;Greeting name="世界" /&gt;
    &lt;/div&gt;
  );
}

export default App;</code></pre>

      <h2>理解 props</h2>
      <p>我们向 <code>Greeting</code> 组件传递了一个 <code>name</code> 属性。props（属性）用于把数据从父组件传递给子组件。</p>

      <h2>添加状态</h2>
      <p>props 来自外部，而状态在组件内部管理：</p>
      <pre><code>import React, { useState } from 'react';

function Greeting(props) {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;h1&gt;你好，{props.name}！&lt;/h1&gt;
      &lt;p&gt;你点击了 {count} 次。&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        点我
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

      <h2>总结</h2>
      <p>我们学习了如何创建项目、编写组件、使用 props 以及管理状态。React 还有更多内容——hooks、context 以及完整的生态——等你在实践中探索。</p>
`

const GRID_CODE_1 = `<pre><code>.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 100px;
  gap: 10px;
}</code></pre>`

const gridCode2 = (a: string, b: string) => `<pre><code>.item1 {
  grid-column: 1 / 3; /* ${a} */
  grid-row: 1 / 2;
}

.item2 {
  grid-column: 3 / 4;
  grid-row: 1 / 3; /* ${b} */
}</code></pre>`

const GRID_FR = `
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
      ${GRID_CODE_1}
      <p>L'unité <code>fr</code> représente une fraction de l'espace disponible : <code>1fr 1fr 1fr</code> crée donc trois colonnes de même largeur.</p>

      <h2>Placer les éléments</h2>
      <p>On positionne les éléments avec <code>grid-column</code> et <code>grid-row</code> :</p>
      ${gridCode2("de la ligne 1 à la ligne 3", "sur deux lignes")}
`

const GRID_EN = `
      <h2>Introduction to CSS Grid</h2>
      <p>CSS Grid Layout is a two-dimensional layout system. It arranges content in rows and columns and makes complex layouts far easier to build.</p>

      <h2>Core concepts</h2>
      <ul>
        <li><strong>Grid container</strong>: the element you apply <code>display: grid</code> to.</li>
        <li><strong>Grid items</strong>: the direct children of the container.</li>
        <li><strong>Grid lines</strong>: the horizontal and vertical dividing lines.</li>
        <li><strong>Tracks</strong>: the space between two adjacent lines (a row or a column).</li>
        <li><strong>Cell</strong>: the intersection of a row and a column.</li>
        <li><strong>Area</strong>: a rectangle made of one or more cells.</li>
      </ul>

      <h2>Building a simple grid</h2>
      <p>A grid with three columns and two rows:</p>
      ${GRID_CODE_1}
      <p>The <code>fr</code> unit is a fraction of the available space, so <code>1fr 1fr 1fr</code> creates three equal-width columns.</p>

      <h2>Placing items</h2>
      <p>Position items with <code>grid-column</code> and <code>grid-row</code>:</p>
      ${gridCode2("from line 1 to line 3", "spans two rows")}
`

const GRID_DE = `
      <h2>Einführung in CSS Grid</h2>
      <p>CSS Grid Layout ist ein zweidimensionales Layoutsystem. Es ordnet Inhalte in Zeilen und Spalten an und vereinfacht komplexe Layouts enorm.</p>

      <h2>Grundbegriffe</h2>
      <ul>
        <li><strong>Grid-Container</strong>: das Element, auf das <code>display: grid</code> angewendet wird.</li>
        <li><strong>Grid-Elemente</strong>: die direkten Kinder des Containers.</li>
        <li><strong>Grid-Linien</strong>: die horizontalen und vertikalen Trennlinien.</li>
        <li><strong>Spuren</strong>: der Raum zwischen zwei benachbarten Linien (eine Zeile oder Spalte).</li>
        <li><strong>Zelle</strong>: der Schnittpunkt einer Zeile und einer Spalte.</li>
        <li><strong>Bereich</strong>: ein Rechteck aus einer oder mehreren Zellen.</li>
      </ul>

      <h2>Ein einfaches Grid erstellen</h2>
      <p>Ein Grid mit drei Spalten und zwei Zeilen:</p>
      ${GRID_CODE_1}
      <p>Die Einheit <code>fr</code> steht für einen Bruchteil des verfügbaren Platzes: <code>1fr 1fr 1fr</code> erzeugt also drei gleich breite Spalten.</p>

      <h2>Elemente platzieren</h2>
      <p>Elemente werden mit <code>grid-column</code> und <code>grid-row</code> positioniert:</p>
      ${gridCode2("von Linie 1 bis Linie 3", "über zwei Zeilen")}
`

const GRID_ZH = `
      <h2>CSS Grid 简介</h2>
      <p>CSS Grid 布局是一种二维布局系统。它按行和列组织内容，让复杂布局的实现变得简单得多。</p>

      <h2>基本概念</h2>
      <ul>
        <li><strong>网格容器</strong>：应用了 <code>display: grid</code> 的元素。</li>
        <li><strong>网格项</strong>：容器的直接子元素。</li>
        <li><strong>网格线</strong>：水平和垂直的分隔线。</li>
        <li><strong>轨道</strong>：两条相邻网格线之间的空间（一行或一列）。</li>
        <li><strong>单元格</strong>：行与列的交叉处。</li>
        <li><strong>区域</strong>：由一个或多个单元格组成的矩形。</li>
      </ul>

      <h2>创建一个简单的网格</h2>
      <p>一个三列两行的网格：</p>
      ${GRID_CODE_1}
      <p><code>fr</code> 单位表示可用空间的一份，因此 <code>1fr 1fr 1fr</code> 会生成三列等宽的列。</p>

      <h2>放置网格项</h2>
      <p>使用 <code>grid-column</code> 和 <code>grid-row</code> 定位元素：</p>
      ${gridCode2("从第 1 条线到第 3 条线", "跨越两行")}
`

export const posts: Post[] = [
  {
    slug: "debuter-avec-react",
    title: {
      fr: "Comment débuter avec React : guide pour débutants",
      en: "Getting started with React: a beginner's guide",
      de: "Einstieg in React: ein Leitfaden für Anfänger",
      zh: "React 入门：新手指南",
    },
    excerpt: {
      fr: "Apprenez les bases de React et comment créer votre premier composant dans ce guide complet pour les débutants.",
      en: "Learn the basics of React and how to build your first component in this complete beginner's guide.",
      de: "Lernen Sie die Grundlagen von React und bauen Sie in diesem Leitfaden Ihre erste Komponente.",
      zh: "在这篇完整的新手指南中，学习 React 的基础知识并编写你的第一个组件。",
    },
    date: { fr: "15 mars 2023", en: "15 March 2023", de: "15. März 2023", zh: "2023年3月15日" },
    readTime: 5,
    category: "React",
    tags: ["React", "JavaScript", "Frontend"],
    content: { fr: REACT_FR, en: REACT_EN, de: REACT_DE, zh: REACT_ZH },
  },
  {
    slug: "comprendre-css-grid",
    title: {
      fr: "Comprendre le CSS Grid Layout",
      en: "Understanding CSS Grid Layout",
      de: "CSS Grid Layout verstehen",
      zh: "理解 CSS Grid 布局",
    },
    excerpt: {
      fr: "Plongez dans CSS Grid Layout et apprenez à créer des mises en page web complexes facilement.",
      en: "Dive into CSS Grid Layout and learn to build complex web layouts with ease.",
      de: "Tauchen Sie in CSS Grid ein und erstellen Sie komplexe Web-Layouts ganz einfach.",
      zh: "深入了解 CSS Grid，轻松构建复杂的网页布局。",
    },
    date: { fr: "2 avril 2023", en: "2 April 2023", de: "2. April 2023", zh: "2023年4月2日" },
    readTime: 7,
    category: "CSS",
    tags: ["CSS", "Web Design", "Frontend"],
    content: { fr: GRID_FR, en: GRID_EN, de: GRID_DE, zh: GRID_ZH },
  },
  {
    slug: "methodes-tableau-javascript",
    title: {
      fr: "Les méthodes de tableau JavaScript à connaître",
      en: "JavaScript array methods you should know",
      de: "JavaScript-Array-Methoden, die Sie kennen sollten",
      zh: "你应该掌握的 JavaScript 数组方法",
    },
    excerpt: {
      fr: "Les méthodes de tableau JavaScript les plus utiles pour un code plus propre et plus efficace.",
      en: "The most useful JavaScript array methods for cleaner, more efficient code.",
      de: "Die nützlichsten Array-Methoden für saubereren, effizienteren Code.",
      zh: "最实用的 JavaScript 数组方法，让代码更简洁高效。",
    },
    date: { fr: "10 mai 2023", en: "10 May 2023", de: "10. Mai 2023", zh: "2023年5月10日" },
    readTime: 6,
    category: "JavaScript",
    tags: ["JavaScript"],
  },
  {
    slug: "introduction-nextjs",
    title: { fr: "Introduction à Next.js", en: "An introduction to Next.js", de: "Einführung in Next.js", zh: "Next.js 入门" },
    excerpt: {
      fr: "Les avantages de Next.js et comment il aide à construire de meilleures applications React.",
      en: "The benefits of Next.js and how it helps you build better React applications.",
      de: "Die Vorteile von Next.js und wie es bessere React-Anwendungen ermöglicht.",
      zh: "Next.js 的优势，以及它如何帮助你构建更好的 React 应用。",
    },
    date: { fr: "22 juin 2023", en: "22 June 2023", de: "22. Juni 2023", zh: "2023年6月22日" },
    readTime: 8,
    category: "Next.js",
    tags: ["Next.js", "React"],
  },
  {
    slug: "design-responsive-pratiques",
    title: {
      fr: "Meilleures pratiques pour le design responsive",
      en: "Best practices for responsive design",
      de: "Best Practices für responsives Design",
      zh: "响应式设计最佳实践",
    },
    excerpt: {
      fr: "Les bonnes pratiques pour créer des sites qui fonctionnent bien sur tous les appareils.",
      en: "Good practices for building sites that work well on every device.",
      de: "Bewährte Methoden für Websites, die auf allen Geräten gut funktionieren.",
      zh: "打造在所有设备上都表现良好的网站的实用做法。",
    },
    date: { fr: "5 juillet 2023", en: "5 July 2023", de: "5. Juli 2023", zh: "2023年7月5日" },
    readTime: 5,
    category: "Web Design",
    tags: ["Web Design", "CSS"],
  },
  {
    slug: "debuter-avec-typescript",
    title: { fr: "Débuter avec TypeScript", en: "Getting started with TypeScript", de: "Einstieg in TypeScript", zh: "TypeScript 入门" },
    excerpt: {
      fr: "Apprenez à utiliser TypeScript pour ajouter un typage statique à vos projets JavaScript.",
      en: "Learn how to use TypeScript to add static typing to your JavaScript projects.",
      de: "Lernen Sie, mit TypeScript statische Typisierung in JavaScript-Projekte zu bringen.",
      zh: "学习如何使用 TypeScript 为 JavaScript 项目添加静态类型。",
    },
    date: { fr: "18 août 2023", en: "18 August 2023", de: "18. August 2023", zh: "2023年8月18日" },
    readTime: 7,
    category: "TypeScript",
    tags: ["TypeScript", "JavaScript"],
  },
]

export const blogCategories = Array.from(new Set(posts.map((p) => p.category)))

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug)
}
