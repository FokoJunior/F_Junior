import { gallery, type Shot } from "@/lib/gallery"
import type { T } from "@/lib/i18n"

export type ProjectCategory = "web" | "mobile" | "ai"

export type ProjectLink = { label: T | string; href: string }

export type Project = {
  slug: string
  title: string
  description: T
  category: ProjectCategory
  tags: string[]
  /** Client, employeur ou cadre du projet */
  context?: T | string
  features?: T[]
  links?: ProjectLink[]
  featured?: boolean
  /** Projets d'études et premiers projets */
  archive?: boolean
  /** Visuel d'une archive (les projets principaux utilisent la galerie) */
  image?: string
  /** Mise en garde affichée sur la fiche */
  note?: T
}

export const categoryLabels: Record<ProjectCategory, T> = {
  web: { fr: "Web", en: "Web", de: "Web", zh: "网页" },
  mobile: { fr: "Mobile", en: "Mobile", de: "Mobile", zh: "移动端" },
  ai: { fr: "IA", en: "AI", de: "KI", zh: "人工智能" },
}

const site = (href: string): ProjectLink => ({ label: prettyUrl(href), href })

const IMG = "https://github.com/FokoJunior/uniprice_website/blob/master/img/porfolio"

type ArchiveRow = [slug: string, title: string, category: ProjectCategory, tags: string[], image: string, description: T]

const archives: ArchiveRow[] = [
  ["synda-tech", "Site web — SyndaTech", "web", ["PHP", "JavaScript", "MySQL", "Bootstrap"], `${IMG}/syndatech-website.png?raw=true`,
    { fr: "Site dynamique avec gestion de contenu et blog interactif pour SyndaTech.", en: "Dynamic website with content management and an interactive blog for SyndaTech.", de: "Dynamische Website mit Content-Management und interaktivem Blog für SyndaTech.", zh: "为 SyndaTech 打造的动态网站，含内容管理与互动博客。" }],
  ["uniprice-dwash", "Site vitrine — Uniprice Dwash", "web", ["HTML", "CSS", "JavaScript", "Bootstrap"], `${IMG}/Uniprice-website.png?raw=true`,
    { fr: "Site vitrine d'un service de lavage auto, avec formules et prise de rendez-vous.", en: "Showcase site for a car wash, with packages and online booking.", de: "Website einer Autowäsche mit Paketen und Online-Terminbuchung.", zh: "洗车服务展示网站，含套餐与在线预约。" }],
  ["ecommerce", "Site e-commerce", "web", ["Next.js", "React", "Tailwind CSS"], `${IMG}/ecommerce.png?raw=true`,
    { fr: "Premier site e-commerce : catalogue, filtres, panier et paiement.", en: "First e-commerce site: catalogue, filters, cart and checkout.", de: "Erster Onlineshop: Katalog, Filter, Warenkorb und Bezahlung.", zh: "第一个电商网站：目录、筛选、购物车与结算。" }],
  ["jm-expenses-tracker", "J-M Expenses Tracker", "mobile", ["Flutter", "Dart", "Firebase"], `${IMG}/tracker.png?raw=true`,
    { fr: "Suivi des dépenses personnelles avec graphiques et catégories.", en: "Personal expense tracker with charts and categories.", de: "Ausgaben-Tracker mit Diagrammen und Kategorien.", zh: "带图表和分类的个人记账应用。" }],
  ["test-personnalite", "Test de personnalité", "mobile", ["Flutter", "Dart"], `${IMG}/test_personnalite.png?raw=true`,
    { fr: "Application de tests de personnalité aux résultats partageables.", en: "Personality test app with shareable results.", de: "Persönlichkeitstest-App mit teilbaren Ergebnissen.", zh: "可分享结果的性格测试应用。" }],
  ["quiz-app", "Application de quiz", "mobile", ["Flutter", "Dart", "API"], `${IMG}/quiz.png?raw=true`,
    { fr: "Quiz par catégories et niveaux, avec classement.", en: "Quiz by category and level, with a leaderboard.", de: "Quiz nach Kategorien und Stufen mit Rangliste.", zh: "分类分级问答游戏，带排行榜。" }],
  ["reconnaissance-faciale", "Reconnaissance faciale", "ai", ["Python", "OpenCV", "TensorFlow"], "https://hans-associes.fr/wp-content/uploads/2025/01/k4_14741506.jpg",
    { fr: "Détection et identification de visages en temps réel avec OpenCV.", en: "Real-time face detection and recognition with OpenCV.", de: "Gesichtserkennung in Echtzeit mit OpenCV.", zh: "基于 OpenCV 的实时人脸检测与识别。" }],
  ["chatbot-telegram", "Chatbot Telegram", "ai", ["Python", "NLP", "Telegram API"], "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/207441761/original/aaf3c0f3c869463f18b04ff9c8d547f261e04445/make-a-telegram-bot-using-python.png",
    { fr: "Chatbot Telegram s'appuyant sur le traitement du langage naturel.", en: "Telegram chatbot built on natural language processing.", de: "Telegram-Chatbot auf Basis von Sprachverarbeitung.", zh: "基于自然语言处理的 Telegram 聊天机器人。" }],
  ["dfs-bfs", "Parcours de graphes DFS & BFS", "ai", ["Python", "Matplotlib"], "https://raw.githubusercontent.com/Daytron/graph-bfs-dfs-gui/master/screenshots/screenshot1.png",
    { fr: "Implémentation et visualisation des parcours en profondeur et en largeur.", en: "Implementation and visualisation of depth- and breadth-first search.", de: "Implementierung und Visualisierung von Tiefen- und Breitensuche.", zh: "深度优先与广度优先搜索的实现与可视化。" }],
  ["gestion-vote", "Gestion de vote", "web", ["PHP", "MySQL", "AJAX"], "https://www.esri.com/content/dam/esrisites/en-us/industries/2021/state-and-local-government/elections/assets/elections-mgmt-card-arcgis-survey-123.jpg",
    { fr: "Système de vote en ligne avec authentification et résultats en direct.", en: "Online voting system with authentication and live results.", de: "Online-Abstimmung mit Anmeldung und Live-Ergebnissen.", zh: "带身份验证和实时结果的在线投票系统。" }],
  ["blog-interactif", "Blog interactif", "web", ["PHP", "MySQL", "jQuery"], "https://img.freepik.com/vecteurs-libre/illustration-publication-blog-plat-organique-personnes_23-2148955260.jpg",
    { fr: "Blog avec commentaires, partage social et administration.", en: "Blog with comments, social sharing and admin.", de: "Blog mit Kommentaren, Teilen und Verwaltung.", zh: "带评论、社交分享和后台的博客。" }],
  ["weather", "Application météo", "web", ["JavaScript", "OpenWeather API", "Chart.js"], "https://static.vecteezy.com/ti/vecteur-libre/p1/3774267-meteo-verifier-cartoon-smartphone-interface-vector-templates-set-winter-overcast-mobile-app-screen-page-day-and-dark-mode-design-forecast-ui-for-application-phone-display-avec-caractere-plat-vectoriel.jpg",
    { fr: "Tableau de bord météo avec prévisions sur 7 jours.", en: "Weather dashboard with a 7-day forecast.", de: "Wetter-Dashboard mit 7-Tage-Vorhersage.", zh: "带 7 天预报的天气看板。" }],
]

export const projects: Project[] = [
  {
    slug: "tchoop237",
    title: "TCHOOP237",
    featured: true,
    category: "web",
    context: "SaaS",
    tags: ["Next.js 14", "Express.js", "PostgreSQL"],
    links: [site("https://www.tchoop237.com")],
    description: {
      fr: "Solution SaaS tout-en-un pour les restaurants africains : menu QR code, commandes en temps réel, gestion des tables, réservations et tableau de bord.",
      en: "All-in-one SaaS for African restaurants: QR code menu, real-time orders, table management, bookings and an analytics dashboard.",
      de: "All-in-one-SaaS für afrikanische Restaurants: QR-Code-Menü, Bestellungen in Echtzeit, Tischverwaltung, Reservierungen und Analyse-Dashboard.",
      zh: "面向非洲餐厅的一体化 SaaS：二维码菜单、实时订单、餐桌管理、预订和数据看板。",
    },
    features: [
      { fr: "Dashboard analytics", en: "Analytics dashboard", de: "Analyse-Dashboard", zh: "数据分析看板" },
      { fr: "Menu interactif par QR code", en: "Interactive QR code menu", de: "Interaktives QR-Code-Menü", zh: "二维码互动菜单" },
      { fr: "Interface serveur et commandes en temps réel", en: "Waiter interface and real-time orders", de: "Kellner-Oberfläche und Bestellungen in Echtzeit", zh: "服务员界面与实时订单" },
      { fr: "Réservations et gestion des tables", en: "Bookings and table management", de: "Reservierungen und Tischverwaltung", zh: "预订与餐桌管理" },
      { fr: "Notifications push", en: "Push notifications", de: "Push-Benachrichtigungen", zh: "推送通知" },
    ],
  },
  {
    slug: "oystr",
    title: "Oystr",
    featured: true,
    category: "web",
    tags: ["Next.js 16", "Prisma", "Supabase", "Stripe"],
    links: [site("https://app.oystr.ca")],
    description: {
      fr: "Réseau social de responsabilisation : on y déclare un objectif, on réunit son « crew » et on avance avec des soutiens plutôt que des followers passifs.",
      en: "An accountability social network: declare a goal, gather your crew and move forward with backers instead of passive followers.",
      de: "Ein soziales Netzwerk für Verbindlichkeit: Ziel festlegen, eine Crew versammeln und mit Unterstützern statt passiven Followern vorankommen.",
      zh: "一个强调责任感的社交网络：公开目标、组建团队，由真正的支持者而非被动粉丝陪你前进。",
    },
    features: [
      { fr: "Fil d'actualité et blog", en: "Feed and blog", de: "Feed und Blog", zh: "动态流与博客" },
      { fr: "Messagerie", en: "Messaging", de: "Nachrichten", zh: "即时消息" },
      { fr: "Abonnements payants avec Stripe", en: "Paid subscriptions with Stripe", de: "Bezahlte Abos mit Stripe", zh: "基于 Stripe 的付费订阅" },
      { fr: "Programme de parrainage", en: "Referral programme", de: "Empfehlungsprogramm", zh: "推荐计划" },
    ],
  },
  {
    slug: "fermeconnect",
    title: "FermeConnect",
    featured: true,
    category: "web",
    context: "SaaS",
    tags: ["Next.js 16", "TypeScript", "Prisma 7", "PostgreSQL (Neon)"],
    description: {
      fr: "Plateforme SaaS multi-tenant et modulaire de gestion agricole : productions végétales, élevage et aide à la décision, activables indépendamment par exploitation.",
      en: "Multi-tenant, modular farm management SaaS: crops, livestock and decision support, each module enabled per organisation and per farm.",
      de: "Mandantenfähige, modulare SaaS für Landwirtschaftsbetriebe: Pflanzenbau, Tierhaltung und Entscheidungshilfe, pro Betrieb aktivierbar.",
      zh: "多租户、模块化的农业管理 SaaS：种植、养殖与决策支持，可按组织和农场独立启用。",
    },
    features: [
      { fr: "Modules Agriculture et Élevage activables séparément", en: "Crop and livestock modules enabled independently", de: "Module Ackerbau und Tierhaltung einzeln aktivierbar", zh: "种植与养殖模块可独立启用" },
      { fr: "Parcelles, campagnes culturales et récoltes", en: "Fields, crop campaigns and harvests", de: "Parzellen, Anbaukampagnen und Ernten", zh: "地块、种植季与收成管理" },
      { fr: "Lots d'élevage, mortalité et suivi du poids", en: "Livestock batches, mortality and weight tracking", de: "Tierbestände, Sterblichkeit und Gewichtsverlauf", zh: "养殖批次、死亡率与体重跟踪" },
      { fr: "Stocks, finances, documents et alertes", en: "Stock, finance, documents and alerts", de: "Lager, Finanzen, Dokumente und Warnungen", zh: "库存、财务、文档与预警" },
      { fr: "Isolation stricte des données entre organisations", en: "Strict data isolation between organisations", de: "Strikte Datentrennung zwischen Organisationen", zh: "组织之间严格的数据隔离" },
    ],
  },
  {
    slug: "stock-junior",
    title: "Stock Junior",
    featured: true,
    category: "web",
    context: "Uniprice Sarl",
    tags: ["PHP", "CodeIgniter", "MySQL", "PWA"],
    description: {
      fr: "Logiciel de gestion de stock multi-tenant : produits, commandes, factures, rapports, rôles, messagerie interne et assistant IA — installable en PWA.",
      en: "Multi-tenant inventory software: products, orders, invoices, reports, roles, internal chat and an AI assistant — installable as a PWA.",
      de: "Mandantenfähige Lagerverwaltung: Produkte, Bestellungen, Rechnungen, Berichte, Rollen, interner Chat und KI-Assistent — als PWA installierbar.",
      zh: "多租户库存管理软件：商品、订单、发票、报表、角色权限、内部消息与 AI 助手，可作为 PWA 安装。",
    },
    features: [
      { fr: "Isolation des données par entreprise", en: "Per-company data isolation", de: "Datentrennung pro Unternehmen", zh: "按企业隔离数据" },
      { fr: "Commandes, bons de livraison et factures", en: "Orders, delivery notes and invoices", de: "Bestellungen, Lieferscheine und Rechnungen", zh: "订单、送货单与发票" },
      { fr: "Rapports mensuels et journal d'activité", en: "Monthly reports and activity log", de: "Monatsberichte und Aktivitätsprotokoll", zh: "月度报表与操作日志" },
      { fr: "Rôles et permissions", en: "Roles and permissions", de: "Rollen und Berechtigungen", zh: "角色与权限" },
      { fr: "Messagerie interne et assistant IA", en: "Internal chat and AI assistant", de: "Interner Chat und KI-Assistent", zh: "内部消息与 AI 助手" },
      { fr: "Application installable (PWA), déployée sur VPS", en: "Installable app (PWA) deployed on a VPS", de: "Installierbare App (PWA) auf einem VPS", zh: "可安装应用（PWA），部署于 VPS" },
    ],
  },
  {
    slug: "danaid-mobile",
    title: "DanAid",
    featured: true,
    category: "mobile",
    context: { fr: "DanAid · Contributeur", en: "DanAid · Contributor", de: "DanAid · Mitwirkender", zh: "DanAid · 贡献者" },
    tags: ["Flutter", "Dart", "Firebase"],
    links: [
      site("https://danaid.io"),
      { label: "Google Play — DanAid & Moi", href: "https://play.google.com/store/apps/details?id=com.danaid.danaidmobile&hl=fr" },
      { label: "Google Play — DanAid e-Clinic", href: "https://play.google.com/store/apps/details?id=com.danaidmobile.doctor&hl=fr" },
    ],
    description: {
      fr: "Écosystème mobile d'une assurance santé au Cameroun : application patients, carte santé numérique et application prestataires, publiées sur le Play Store.",
      en: "Mobile ecosystem of a health insurer in Cameroon: patient app, digital health card and provider app, published on the Play Store.",
      de: "Mobiles Ökosystem einer Krankenversicherung in Kamerun: Patienten-App, digitale Gesundheitskarte und App für Leistungserbringer, im Play Store veröffentlicht.",
      zh: "喀麦隆一家健康保险公司的移动生态：患者应用、数字健康卡和医疗机构应用，均已在 Play 商店上架。",
    },
    features: [
      { fr: "DanAid & Moi — application patients", en: "DanAid & Moi — patient app", de: "DanAid & Moi — Patienten-App", zh: "DanAid & Moi — 患者应用" },
      { fr: "DanAid e-Clinic — interface prestataires", en: "DanAid e-Clinic — provider app", de: "DanAid e-Clinic — App für Leistungserbringer", zh: "DanAid e-Clinic — 医疗机构应用" },
      { fr: "Carte santé numérique", en: "Digital health card", de: "Digitale Gesundheitskarte", zh: "数字健康卡" },
      { fr: "Développement et maintenance en Flutter", en: "Development and maintenance in Flutter", de: "Entwicklung und Wartung mit Flutter", zh: "使用 Flutter 开发与维护" },
    ],
  },
  {
    slug: "judgex",
    title: "JudgeX",
    featured: true,
    category: "web",
    context: "Aigle Digital · Sepro-Tech",
    tags: ["Next.js", "TypeScript", "Docker", "VPS"],
    description: {
      fr: "Plateforme de vote et de jury en ligne : concours collectifs, votes individuels sécurisés, podium et résultats en temps réel.",
      en: "Online voting and judging platform: group contests, secure individual votes, podium and real-time results.",
      de: "Online-Plattform für Abstimmungen und Jurys: Gruppenwettbewerbe, sichere Einzelstimmen, Podium und Ergebnisse in Echtzeit.",
      zh: "在线投票与评审平台：团体竞赛、安全的个人投票、领奖台与实时结果。",
    },
    features: [
      { fr: "Page publique des concours et podium", en: "Public contest page and podium", de: "Öffentliche Wettbewerbsseite und Podium", zh: "公开竞赛页面与领奖台" },
      { fr: "Votes individuels sécurisés", en: "Secure individual voting", de: "Sichere Einzelabstimmung", zh: "安全的个人投票" },
      { fr: "Tableau de bord administrateur", en: "Admin dashboard", de: "Admin-Dashboard", zh: "管理员看板" },
      { fr: "Gestion des concours et des utilisateurs", en: "Contest and user management", de: "Verwaltung von Wettbewerben und Nutzern", zh: "竞赛与用户管理" },
    ],
  },
  {
    slug: "aquasafe",
    title: "AquaSafe Cameroun",
    category: "web",
    context: { fr: "Projet intégrateur — EGEM, Université de Ngaoundéré", en: "Capstone project — EGEM, University of Ngaoundéré", de: "Abschlussprojekt — EGEM, Universität Ngaoundéré", zh: "综合项目 — 恩冈代雷大学 EGEM" },
    tags: ["Next.js", "Prisma", "PostgreSQL", "NextAuth", "next-intl"],
    description: {
      fr: "Base de données et application de classification de la potabilité des eaux des localités du Cameroun, avec consultation publique et carte.",
      en: "Database and app classifying drinking-water safety across Cameroonian localities, with public lookup and a map.",
      de: "Datenbank und Anwendung zur Einstufung der Trinkwasserqualität in kamerunischen Ortschaften, mit öffentlicher Abfrage und Karte.",
      zh: "喀麦隆各地饮用水安全分级数据库与应用，提供公开查询和地图。",
    },
    features: [
      { fr: "Consultation publique par localité, sans compte", en: "Public lookup by locality, no account needed", de: "Öffentliche Abfrage nach Ort, ohne Konto", zh: "按地区公开查询，无需账号" },
      { fr: "Classification selon les normes OMS", en: "Classification against WHO standards", de: "Einstufung nach WHO-Normen", zh: "依据世卫组织标准分级" },
      { fr: "Rôles : administrateur, technicien, chercheur", en: "Roles: admin, field technician, researcher", de: "Rollen: Admin, Techniker, Forscher", zh: "角色：管理员、技术员、研究人员" },
      { fr: "Interface bilingue français / anglais", en: "Bilingual French / English interface", de: "Zweisprachige Oberfläche Französisch / Englisch", zh: "法语 / 英语双语界面" },
    ],
  },
  {
    slug: "polimonitor-ai",
    title: "PoliMonitor AI",
    category: "ai",
    context: "Revolute Consulting",
    tags: ["React", "Vite", "Supabase", "Google Gemini"],
    description: {
      fr: "Veille politique intelligente : agrégation de sources, analyse automatique par l'IA Gemini et tableaux de bord de risques pour les décideurs.",
      en: "Political intelligence: source aggregation, automatic analysis with Gemini AI and risk dashboards for decision-makers.",
      de: "Politisches Monitoring: Quellenaggregation, automatische Analyse mit Gemini-KI und Risiko-Dashboards für Entscheider.",
      zh: "政治情报监测：多源聚合、Gemini AI 自动分析以及面向决策者的风险看板。",
    },
    features: [
      { fr: "Agrégation de sources", en: "Source aggregation", de: "Quellenaggregation", zh: "多源信息聚合" },
      { fr: "Analyse automatique par IA", en: "Automatic AI analysis", de: "Automatische KI-Analyse", zh: "AI 自动分析" },
      { fr: "Tableau de bord de veille", en: "Monitoring dashboard", de: "Monitoring-Dashboard", zh: "监测看板" },
    ],
  },
  {
    slug: "gold7-rl",
    title: "GOLD7 RL",
    category: "ai",
    context: { fr: "Projet personnel · recherche", en: "Personal project · research", de: "Eigenes Projekt · Forschung", zh: "个人项目 · 研究" },
    tags: ["Python", "PPO", "Stable-Baselines3", "ONNX", "MQL5", "Streamlit"],
    description: {
      fr: "Agent d'apprentissage par renforcement (PPO) greffé sur un Expert Advisor MQL5 pour l'or : entraînement en Python, export ONNX, tableau de bord de backtest.",
      en: "Reinforcement learning agent (PPO) plugged into an MQL5 gold Expert Advisor: Python training, ONNX export and a backtest dashboard.",
      de: "Reinforcement-Learning-Agent (PPO) für einen MQL5-Expert-Advisor auf Gold: Training in Python, ONNX-Export und Backtest-Dashboard.",
      zh: "接入 MQL5 黄金交易 EA 的强化学习智能体（PPO）：Python 训练、ONNX 导出与回测看板。",
    },
    features: [
      { fr: "Système de récompense / malus à la clôture des trades", en: "Reward / penalty system on trade close", de: "Belohnungs-/Strafsystem beim Schließen von Trades", zh: "平仓时的奖励 / 惩罚机制" },
      { fr: "Sessions de marché de l'or (Asie, Londres, New York)", en: "Gold market sessions (Asia, London, New York)", de: "Handelssitzungen für Gold (Asien, London, New York)", zh: "黄金市场交易时段（亚洲、伦敦、纽约）" },
      { fr: "Boucle de ré-entraînement continu", en: "Continuous retraining loop", de: "Kontinuierliche Nachtrainingsschleife", zh: "持续再训练循环" },
      { fr: "Export ONNX exécuté directement dans MetaTrader 5", en: "ONNX export run directly inside MetaTrader 5", de: "ONNX-Export, direkt in MetaTrader 5 ausgeführt", zh: "导出 ONNX 并在 MetaTrader 5 中直接运行" },
      { fr: "Tableau de bord Streamlit : backtest sur 50 000 bougies XAUUSD M15", en: "Streamlit dashboard: backtest on 50,000 XAUUSD M15 candles", de: "Streamlit-Dashboard: Backtest über 50.000 XAUUSD-M15-Kerzen", zh: "Streamlit 看板：基于 50,000 根 XAUUSD M15 K 线回测" },
    ],
    note: {
      fr: "Projet technique et pédagogique : un backtest ne garantit aucun résultat futur, ce n'est pas un conseil financier.",
      en: "A technical, educational project: a backtest guarantees no future result and this is not financial advice.",
      de: "Ein technisches Lernprojekt: Ein Backtest garantiert keine künftigen Ergebnisse, keine Finanzberatung.",
      zh: "技术与学习项目：回测不代表未来收益，亦不构成投资建议。",
    },
  },
  {
    slug: "uniprice-ecommerce",
    title: "Uniprice E-commerce",
    category: "web",
    context: "Uniprice Sarl",
    tags: ["Next.js 15", "Three.js", "React Three Fiber", "Framer Motion"],
    links: [site("https://website.uniprice.org")],
    description: {
      fr: "Site e-commerce d'un fabricant de produits d'hygiène au Cameroun : catalogue, scènes 3D interactives, promotions et devis rapide.",
      en: "E-commerce site for a Cameroonian hygiene products maker: catalogue, interactive 3D scenes, promotions and quick quotes.",
      de: "E-Commerce-Website eines kamerunischen Herstellers von Hygieneprodukten: Katalog, interaktive 3D-Szenen, Aktionen und Schnellangebote.",
      zh: "喀麦隆一家清洁用品制造商的电商网站：产品目录、交互式 3D 场景、促销与快速报价。",
    },
    features: [
      { fr: "Scènes 3D interactives", en: "Interactive 3D scenes", de: "Interaktive 3D-Szenen", zh: "交互式 3D 场景" },
      { fr: "Catalogue et promotions", en: "Catalogue and promotions", de: "Katalog und Aktionen", zh: "产品目录与促销" },
      { fr: "QR codes produits", en: "Product QR codes", de: "Produkt-QR-Codes", zh: "商品二维码" },
    ],
  },
  {
    slug: "revolute-consulting",
    title: "Revolute Consulting",
    category: "web",
    context: { fr: "Freelance", en: "Freelance", de: "Freelance", zh: "自由职业" },
    tags: ["Next.js 16", "Prisma", "Google Gemini"],
    links: [site("https://www.revoluteconsulting.com")],
    description: {
      fr: "Site d'un cabinet de conseil en transformation digitale : services, études de cas, blog, espace d'administration et assistant IA Gemini.",
      en: "Website for a digital transformation consultancy: services, case studies, blog, admin area and a Gemini AI assistant.",
      de: "Website einer Beratung für digitale Transformation: Leistungen, Fallstudien, Blog, Admin-Bereich und Gemini-KI-Assistent.",
      zh: "数字化转型咨询公司官网：服务、案例、博客、后台管理以及 Gemini AI 助手。",
    },
    features: [
      { fr: "Pages services et études de cas", en: "Service pages and case studies", de: "Leistungsseiten und Fallstudien", zh: "服务页面与案例" },
      { fr: "Blog et espace d'administration", en: "Blog and admin area", de: "Blog und Admin-Bereich", zh: "博客与后台管理" },
      { fr: "Assistant IA Google Gemini", en: "Google Gemini AI assistant", de: "KI-Assistent mit Google Gemini", zh: "Google Gemini AI 助手" },
    ],
  },
  {
    slug: "football-platform",
    title: "AS Boyom's FC",
    category: "web",
    context: "Aigle Digital",
    tags: ["Next.js", "Drizzle", "PostgreSQL", "Docker"],
    description: {
      fr: "Plateforme d'un club de football camerounais : actualités, effectifs, matchs, détections, académie et espace d'administration.",
      en: "Platform for a Cameroonian football club: news, squad, fixtures, scouting, academy and an admin area.",
      de: "Plattform eines kamerunischen Fußballvereins: News, Kader, Spiele, Sichtungen, Akademie und Admin-Bereich.",
      zh: "喀麦隆足球俱乐部平台：新闻、球队阵容、赛程、选拔、青训学院与后台管理。",
    },
    features: [
      { fr: "Actualités et résultats", en: "News and results", de: "News und Ergebnisse", zh: "新闻与比赛结果" },
      { fr: "Effectifs et joueurs", en: "Squad and players", de: "Kader und Spieler", zh: "球队与球员" },
      { fr: "Détections et académie", en: "Scouting and academy", de: "Sichtungen und Akademie", zh: "选拔与青训" },
      { fr: "Espace d'administration", en: "Admin area", de: "Admin-Bereich", zh: "后台管理" },
    ],
  },
  {
    slug: "agriconnect",
    title: "AgriConnect",
    category: "mobile",
    context: { fr: "Mobile + Web + API", en: "Mobile + Web + API", de: "Mobile + Web + API", zh: "移动端 + 网页 + API" },
    tags: ["Flutter", "Next.js", "API REST"],
    description: {
      fr: "Écosystème agricole camerounais : marché, analyse IA des prix, logistique et paiement sécurisé entre producteurs, acheteurs et transporteurs.",
      en: "Cameroonian agri ecosystem: marketplace, AI price analysis, logistics and secure payments between farmers, buyers and carriers.",
      de: "Agrar-Ökosystem für Kamerun: Marktplatz, KI-Preisanalyse, Logistik und sichere Zahlungen zwischen Erzeugern, Käufern und Transporteuren.",
      zh: "喀麦隆农业生态：交易市场、AI 价格分析、物流以及生产者、买家与承运人之间的安全支付。",
    },
    features: [
      { fr: "Application mobile Flutter", en: "Flutter mobile app", de: "Flutter-Mobile-App", zh: "Flutter 移动应用" },
      { fr: "Espaces producteur, acheteur et transporteur", en: "Farmer, buyer and carrier spaces", de: "Bereiche für Erzeuger, Käufer und Transporteure", zh: "生产者、买家与承运人专区" },
      { fr: "Intelligence de marché et paiement séquestre", en: "Market intelligence and escrow payments", de: "Marktdaten und Treuhandzahlungen", zh: "市场情报与担保支付" },
      { fr: "API REST et administration web", en: "REST API and web admin", de: "REST-API und Web-Administration", zh: "REST API 与网页后台" },
    ],
  },
  {
    slug: "iuc-community",
    title: "IUC Community",
    category: "web",
    tags: ["Next.js 16", "Supabase", "TipTap", "Vitest"],
    description: {
      fr: "Plateforme communautaire de l'Institut Universitaire de la Côte : clubs, événements, blog, ressources et espaces étudiants et enseignants.",
      en: "Community platform for the Institut Universitaire de la Côte: clubs, events, blog, resources and student and teacher spaces.",
      de: "Community-Plattform des Institut Universitaire de la Côte: Clubs, Events, Blog, Ressourcen sowie Bereiche für Studierende und Lehrende.",
      zh: "IUC 大学社区平台：社团、活动、博客、学习资源以及学生和教师空间。",
    },
    features: [
      { fr: "Clubs, communautés et événements", en: "Clubs, communities and events", de: "Clubs, Communities und Events", zh: "社团、社区与活动" },
      { fr: "Éditeur de texte riche (TipTap)", en: "Rich text editor (TipTap)", de: "Rich-Text-Editor (TipTap)", zh: "富文本编辑器（TipTap）" },
      { fr: "Espaces étudiant, enseignant et administration", en: "Student, teacher and admin spaces", de: "Bereiche für Studierende, Lehrende und Verwaltung", zh: "学生、教师与管理员空间" },
      { fr: "Tests automatisés (Vitest)", en: "Automated tests (Vitest)", de: "Automatisierte Tests (Vitest)", zh: "自动化测试（Vitest）" },
    ],
  },
  {
    slug: "fairconnaict",
    title: "FairconnAIct",
    category: "web",
    tags: ["Next.js 16", "Polygon", "React Native", "API REST"],
    description: {
      fr: "ERP pour coopératives de cacao au Cameroun, avec traçabilité blockchain (Polygon), application terrain hors ligne et paiements Mobile Money.",
      en: "ERP for cocoa cooperatives in Cameroon, with blockchain traceability (Polygon), an offline field app and Mobile Money payments.",
      de: "ERP für Kakaogenossenschaften in Kamerun mit Blockchain-Rückverfolgbarkeit (Polygon), Offline-Feld-App und Mobile-Money-Zahlungen.",
      zh: "面向喀麦隆可可合作社的 ERP：区块链溯源（Polygon）、离线外勤应用与移动支付。",
    },
    features: [
      { fr: "Gestion des producteurs, lots de récolte et stocks", en: "Producers, harvest batches and stock", de: "Erzeuger, Erntechargen und Lager", zh: "生产者、收获批次与库存" },
      { fr: "Transactions enregistrées sur la blockchain Polygon", en: "Transactions recorded on the Polygon blockchain", de: "Transaktionen auf der Polygon-Blockchain", zh: "交易记录上链（Polygon）" },
      { fr: "Application mobile hors ligne pour les agents terrain", en: "Offline mobile app for field agents", de: "Offline-App für Außendienstmitarbeiter", zh: "外勤人员离线移动应用" },
      { fr: "Paiements MTN MoMo et Orange Money", en: "MTN MoMo and Orange Money payments", de: "Zahlungen über MTN MoMo und Orange Money", zh: "MTN MoMo 与 Orange Money 支付" },
    ],
  },
  {
    slug: "secure-documents",
    title: "DocSecure",
    category: "web",
    tags: ["Next.js", "TypeScript", "Supabase", "PostgreSQL"],
    description: {
      fr: "Génération et vérification de documents sécurisés : PDF avec QR code unique et filigrane, vérification publique et journal d'audit.",
      en: "Secure document generation and verification: PDFs with a unique QR code and watermark, public verification and an audit log.",
      de: "Erstellung und Prüfung fälschungssicherer Dokumente: PDFs mit eindeutigem QR-Code und Wasserzeichen, öffentliche Prüfung und Audit-Log.",
      zh: "安全文档生成与验证：带唯一二维码和水印的 PDF、公开验证以及审计日志。",
    },
    features: [
      { fr: "Rôles administrateur, opérateur et public", en: "Admin, operator and public roles", de: "Rollen Admin, Operator und Öffentlich", zh: "管理员、操作员与公众角色" },
      { fr: "PDF avec QR code unique et filigrane", en: "PDFs with unique QR code and watermark", de: "PDFs mit eindeutigem QR-Code und Wasserzeichen", zh: "带唯一二维码与水印的 PDF" },
      { fr: "Vérification publique sans compte", en: "Public verification without an account", de: "Öffentliche Prüfung ohne Konto", zh: "无需账号的公开验证" },
      { fr: "Audit détaillé et statistiques", en: "Detailed audit and statistics", de: "Detailliertes Audit und Statistiken", zh: "详细审计与统计" },
    ],
  },
  {
    slug: "smarthr-pro",
    title: "SmartHR Pro",
    category: "web",
    tags: ["React 19", "TypeScript", "Vite", "Recharts"],
    description: {
      fr: "Plateforme RH : employés, recrutement en Kanban, paie, congés, présence, évaluations et gestion des rôles.",
      en: "HR platform: employees, Kanban recruiting, payroll, leave, attendance, reviews and role management.",
      de: "HR-Plattform: Mitarbeitende, Recruiting im Kanban, Gehaltsabrechnung, Urlaub, Anwesenheit, Beurteilungen und Rollen.",
      zh: "人力资源平台：员工、看板式招聘、薪资、休假、考勤、绩效与角色管理。",
    },
    features: [
      { fr: "Tableaux de bord par rôle", en: "Role-based dashboards", de: "Rollenbasierte Dashboards", zh: "按角色的看板" },
      { fr: "Recrutement en Kanban", en: "Kanban recruiting", de: "Recruiting im Kanban", zh: "看板式招聘" },
      { fr: "Paie et bulletins", en: "Payroll and payslips", de: "Gehaltsabrechnung", zh: "薪资与工资单" },
      { fr: "Congés, présence et évaluations", en: "Leave, attendance and reviews", de: "Urlaub, Anwesenheit und Beurteilungen", zh: "休假、考勤与绩效" },
    ],
  },
  {
    slug: "pure-workspaces",
    title: "Pure Workspaces",
    category: "web",
    context: { fr: "Freelance · Royaume-Uni", en: "Freelance · United Kingdom", de: "Freelance · Vereinigtes Königreich", zh: "自由职业 · 英国" },
    tags: ["Next.js", "Tailwind CSS", "shadcn/ui"],
    links: [site("https://www.pureworkspaces.uk")],
    description: {
      fr: "Site vitrine d'une entreprise de nettoyage professionnel dans l'Oxfordshire et à Swindon : valeurs, services, approche et devis.",
      en: "Showcase site for a commercial cleaning company in Oxfordshire and Swindon: values, services, approach and quotes.",
      de: "Website eines Reinigungsunternehmens in Oxfordshire und Swindon: Werte, Leistungen, Vorgehen und Angebote.",
      zh: "英国牛津郡与斯温登一家商业清洁公司的展示网站：价值观、服务、流程与报价。",
    },
  },
  {
    slug: "scoops-fcs",
    title: "SCOOPS FCS",
    category: "web",
    context: "Revolute Consulting",
    tags: ["React", "TypeScript", "Vite", "Tailwind CSS", "Framer Motion"],
    description: {
      fr: "Site d'un projet de coopératives agricoles porté par 1 500 femmes dans la région de l'Est du Cameroun : modèle, filières, agenda 2030 et partenaires.",
      en: "Website for a women-led farming cooperative project (1,500 women) in Cameroon's East region: model, value chains, 2030 agenda and partners.",
      de: "Website eines Genossenschaftsprojekts von 1.500 Frauen in Kameruns Ostregion: Modell, Wertschöpfungsketten, Agenda 2030 und Partner.",
      zh: "喀麦隆东部大区由 1,500 名女性发起的农业合作社项目网站：模式、产业链、2030 议程与合作伙伴。",
    },
  },
  {
    slug: "start-new",
    title: "Start New",
    category: "web",
    context: "Revolute Consulting",
    tags: ["React 18", "Vite", "CSS"],
    description: {
      fr: "Landing page d'une plateforme bien-être : savoirs, remèdes naturels, recettes et communauté — responsive et fidèle à la maquette.",
      en: "Landing page for a wellness platform: knowledge, natural remedies, recipes and community — responsive and pixel-faithful.",
      de: "Landingpage einer Wellness-Plattform: Wissen, Naturheilmittel, Rezepte und Community — responsiv und pixelgenau.",
      zh: "健康生活平台落地页：知识、自然疗法、食谱与社区，响应式且忠于设计稿。",
    },
  },
  {
    slug: "lumidetect",
    title: "LumiDetect",
    category: "mobile",
    tags: ["Flutter", "Dart", "Sensors"],
    description: {
      fr: "Application Flutter qui lit le capteur de lumière ambiante du téléphone et bascule automatiquement l'interface en mode jour ou nuit sous 20 lux.",
      en: "Flutter app that reads the phone's ambient light sensor and switches the UI to day or night mode below 20 lux.",
      de: "Flutter-App, die den Umgebungslichtsensor ausliest und die Oberfläche unter 20 Lux automatisch in den Nachtmodus schaltet.",
      zh: "读取手机环境光传感器的 Flutter 应用，低于 20 勒克斯时自动切换日间 / 夜间界面。",
    },
    features: [
      { fr: "Mesure de la luminosité en temps réel (lux)", en: "Real-time light measurement (lux)", de: "Lichtmessung in Echtzeit (Lux)", zh: "实时亮度测量（勒克斯）" },
      { fr: "Thème adaptatif jour / nuit", en: "Adaptive day / night theme", de: "Adaptives Tag-/Nacht-Design", zh: "日间 / 夜间自适应主题" },
      { fr: "Android et iOS", en: "Android and iOS", de: "Android und iOS", zh: "支持 Android 与 iOS" },
    ],
  },

  // Archives : projets d'études et premiers projets
  ...archives.map(([slug, title, category, tags, image, description]) => ({
    slug,
    title,
    category,
    tags,
    image,
    description,
    archive: true,
  })),
]

export const mainProjects = projects.filter((p) => !p.archive)
export const archivedProjects = projects.filter((p) => p.archive)
export const featuredProjects = projects.filter((p) => p.featured)

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}

export function shotsOf(project: Project): Shot[] {
  return gallery[project.slug] ?? []
}

/** Image principale : première capture desktop, sinon première capture, sinon visuel d'archive. */
export function coverOf(project: Project): string | undefined {
  const shots = shotsOf(project)
  return (shots.find((s) => !s.mobile) ?? shots[0])?.src ?? project.image
}

export function prettyUrl(href: string) {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
}
