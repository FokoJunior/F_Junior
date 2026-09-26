// Source : CV du 26/09/2026 (public/info/cv-foko-junior-2026-09-26.json)
import type { T } from "@/lib/i18n"

export const profile: T = {
  fr: "Étudiant en Master 2 Génie Logiciel et Systèmes d'Information, développeur full-stack avec une expertise confirmée en TypeScript / Next.js et Flutter. Auteur de plus de 20 projets GitHub couvrant des domaines variés — SaaS, mobile, e-commerce, agriculture — je conçois des solutions complètes intégrant API, interfaces modernes et intelligence artificielle. Proactif et autodidacte, je cherche à contribuer à des projets à fort impact.",
  en: "Master 2 student in Software Engineering and Information Systems and full-stack developer with solid expertise in TypeScript / Next.js and Flutter. Author of more than 20 GitHub projects across SaaS, mobile, e-commerce and agriculture, I build complete solutions combining APIs, modern interfaces and artificial intelligence. Proactive and self-taught, I want to contribute to high-impact projects.",
  de: "Master-2-Student in Softwaretechnik und Informationssystemen und Full-Stack-Entwickler mit fundierter Erfahrung in TypeScript / Next.js und Flutter. Mit über 20 GitHub-Projekten aus SaaS, Mobile, E-Commerce und Landwirtschaft entwickle ich komplette Lösungen aus APIs, modernen Oberflächen und künstlicher Intelligenz. Proaktiv und autodidaktisch möchte ich an wirkungsvollen Projekten mitwirken.",
  zh: "软件工程与信息系统硕士二年级学生，全栈开发者，精通 TypeScript / Next.js 与 Flutter。我在 GitHub 上完成了 20 多个项目，涵盖 SaaS、移动、电子商务和农业，能够打造融合 API、现代界面与人工智能的完整解决方案。积极主动、善于自学，希望参与有影响力的项目。",
}

export type Experience = {
  role: T
  company: string
  place: T
  period: T
  duration?: T
  points: T[]
}

const hybrid: T = { fr: "Douala · Hybride", en: "Douala · Hybrid", de: "Douala · Hybrid", zh: "杜阿拉 · 混合办公" }
const douala: T = { fr: "Douala", en: "Douala", de: "Douala", zh: "杜阿拉" }
const webDev: T = { fr: "Développeur web", en: "Web developer", de: "Webentwickler", zh: "网页开发工程师" }
const intern: T = { fr: "Développeur stagiaire", en: "Developer intern", de: "Entwickler (Praktikum)", zh: "开发实习生" }
const months = (n: number): T => ({ fr: `${n} mois`, en: `${n} months`, de: `${n} Monate`, zh: `${n} 个月` })

export const experience: Experience[] = [
  {
    role: { fr: "Développeur mobile Flutter", en: "Flutter mobile developer", de: "Flutter-Mobile-Entwickler", zh: "Flutter 移动开发工程师" },
    company: "DanAid",
    place: hybrid,
    period: { fr: "Nov. 2025 — Sept. 2026", en: "Nov 2025 — Sep 2026", de: "Nov. 2025 — Sept. 2026", zh: "2025.11 — 2026.09" },
    duration: months(9),
    points: [
      { fr: "Développement et maintenance de l'application mobile DanAid (assurance santé, disponible sur le Play Store)", en: "Built and maintained the DanAid mobile app (health insurance, available on the Play Store)", de: "Entwicklung und Wartung der DanAid-App (Krankenversicherung, im Play Store verfügbar)", zh: "开发并维护 DanAid 移动应用（健康保险，已在 Play 商店上架）" },
      { fr: "Contribution à 3 applications Flutter : patients, carte santé numérique, prestataires", en: "Contributed to 3 Flutter apps: patients, digital health card, providers", de: "Mitarbeit an 3 Flutter-Apps: Patienten, digitale Gesundheitskarte, Leistungserbringer", zh: "参与 3 款 Flutter 应用：患者端、数字健康卡、医疗机构端" },
    ],
  },
  {
    role: { fr: "Responsable informatique & développeur", en: "IT manager & developer", de: "IT-Leiter & Entwickler", zh: "IT 负责人兼开发工程师" },
    company: "Uniprice Sarl",
    place: hybrid,
    period: { fr: "Avr. 2024 — Juil. 2026", en: "Apr 2024 — Jul 2026", de: "Apr. 2024 — Juli 2026", zh: "2024.04 — 2026.07" },
    duration: { fr: "2 ans 4 mois", en: "2 yrs 4 mos", de: "2 Jahre 4 Monate", zh: "2 年 4 个月" },
    points: [
      { fr: "Application de gestion de stock multi-tenant stock.uniprice.org", en: "Multi-tenant inventory app stock.uniprice.org", de: "Mandantenfähige Lager-App stock.uniprice.org", zh: "多租户库存管理应用 stock.uniprice.org" },
      { fr: "Conception du site e-commerce uniprice.org", en: "Designed the uniprice.org e-commerce site", de: "Konzeption des Onlineshops uniprice.org", zh: "设计 uniprice.org 电商网站" },
      { fr: "Supports visuels et supervision informatique", en: "Visual assets and IT supervision", de: "Visuelle Medien und IT-Betreuung", zh: "视觉物料与 IT 运维" },
    ],
  },
  {
    role: webDev,
    company: "Aigle Digital",
    place: hybrid,
    period: { fr: "Sept. 2025 — Juil. 2026", en: "Sep 2025 — Jul 2026", de: "Sept. 2025 — Juli 2026", zh: "2025.09 — 2026.07" },
    duration: months(11),
    points: [
      { fr: "Site web officiel d'Aigle Digital", en: "Aigle Digital's official website", de: "Offizielle Website von Aigle Digital", zh: "Aigle Digital 官方网站" },
      { fr: "Application d'administration pour Sitracel (gestion interne, tableaux de bord)", en: "Admin application for Sitracel (internal management, dashboards)", de: "Admin-Anwendung für Sitracel (interne Verwaltung, Dashboards)", zh: "Sitracel 后台管理应用（内部管理、数据看板）" },
      { fr: "Plateforme de gestion du club de football AS Boyom's", en: "Management platform for the AS Boyom's football club", de: "Verwaltungsplattform für den Fußballverein AS Boyom's", zh: "AS Boyom's 足球俱乐部管理平台" },
      { fr: "Application de vote JudgeX : concours collectif et vote individuel sécurisé", en: "JudgeX voting app: group contests and secure individual votes", de: "Abstimmungs-App JudgeX: Gruppenwettbewerbe und sichere Einzelstimmen", zh: "JudgeX 投票应用：团体竞赛与安全个人投票" },
    ],
  },
  {
    role: { fr: "Développeur web freelance", en: "Freelance web developer", de: "Freiberuflicher Webentwickler", zh: "自由职业网页开发者" },
    company: "Revolute Consulting",
    place: { fr: "Télétravail", en: "Remote", de: "Remote", zh: "远程" },
    period: { fr: "Oct. 2025 — Mai 2026", en: "Oct 2025 — May 2026", de: "Okt. 2025 — Mai 2026", zh: "2025.10 — 2026.05" },
    duration: months(8),
    points: [
      { fr: "Site de Revolute Consulting (Next.js, Prisma, Google Gemini AI, blog, admin)", en: "Revolute Consulting website (Next.js, Prisma, Google Gemini AI, blog, admin)", de: "Website von Revolute Consulting (Next.js, Prisma, Google Gemini AI, Blog, Admin)", zh: "Revolute Consulting 官网（Next.js、Prisma、Google Gemini AI、博客、后台）" },
      { fr: "PoliMonitor AI, application de veille politique alimentée par l'IA", en: "PoliMonitor AI, an AI-powered political monitoring app", de: "PoliMonitor AI, KI-gestützte Anwendung für politisches Monitoring", zh: "PoliMonitor AI：AI 驱动的政治监测应用" },
      { fr: "Sites vitrines : Pure Workspaces, Start New, cabinet de psychologie, Scoops FCS", en: "Showcase sites: Pure Workspaces, Start New, a psychology practice, Scoops FCS", de: "Websites: Pure Workspaces, Start New, psychologische Praxis, Scoops FCS", zh: "展示网站：Pure Workspaces、Start New、心理咨询诊所、Scoops FCS" },
    ],
  },
  {
    role: webDev,
    company: "SyndaTech",
    place: douala,
    period: { fr: "Oct. 2024 — Mars 2025", en: "Oct 2024 — Mar 2025", de: "Okt. 2024 — März 2025", zh: "2024.10 — 2025.03" },
    duration: months(6),
    points: [
      { fr: "Module WebRTC intégré à Odoo (VoIP, visioconférence)", en: "WebRTC module integrated into Odoo (VoIP, video calls)", de: "In Odoo integriertes WebRTC-Modul (VoIP, Videokonferenz)", zh: "集成于 Odoo 的 WebRTC 模块（VoIP、视频会议）" },
      { fr: "Mise à jour et refonte partielle de syndatech.com", en: "Update and partial redesign of syndatech.com", de: "Aktualisierung und teilweises Redesign von syndatech.com", zh: "syndatech.com 的更新与部分改版" },
    ],
  },
  {
    role: intern,
    company: "SyndaTech",
    place: douala,
    period: { fr: "Mai — Sept. 2024", en: "May — Sep 2024", de: "Mai — Sept. 2024", zh: "2024.05 — 2024.09" },
    duration: months(5),
    points: [{ fr: "Refonte complète du site syndatech.com", en: "Full redesign of syndatech.com", de: "Komplettes Redesign von syndatech.com", zh: "syndatech.com 网站全面改版" }],
  },
  {
    role: intern,
    company: "SyndaTech",
    place: douala,
    period: { fr: "Juin — Août 2023", en: "Jun — Aug 2023", de: "Juni — Aug. 2023", zh: "2023.06 — 2023.08" },
    duration: months(3),
    points: [{ fr: "Analyse des flux de données et formulaires interactifs", en: "Data flow analysis and interactive forms", de: "Datenflussanalyse und interaktive Formulare", zh: "数据流分析与交互式表单" }],
  },
  {
    role: { fr: "Secrétaire", en: "Secretary", de: "Sekretär", zh: "秘书" },
    company: "Solution Bio",
    place: douala,
    period: { fr: "Juil. — Août 2021", en: "Jul — Aug 2021", de: "Juli — Aug. 2021", zh: "2021.07 — 2021.08" },
    points: [],
  },
]

const iuc: T = { fr: "Institut Universitaire de la Côte, Douala", en: "Institut Universitaire de la Côte, Douala", de: "Institut Universitaire de la Côte, Douala", zh: "海岸大学学院（IUC），杜阿拉" }
const glsi = (level: string): T => ({
  fr: `${level} — Génie Logiciel & Systèmes d'Information`,
  en: `${level} — Software Engineering & Information Systems`,
  de: `${level} — Softwaretechnik & Informationssysteme`,
  zh: `${level} — 软件工程与信息系统`,
})

export const education: { title: T; school: T | string; period: T; mention?: T; current?: boolean }[] = [
  { title: glsi("Master 2"), school: iuc, period: { fr: "Sept. 2026 — Présent", en: "Sep 2026 — Present", de: "Sept. 2026 — Heute", zh: "2026.09 — 至今" }, current: true },
  { title: glsi("Master 1"), school: iuc, period: { fr: "Oct. 2025 — Juil. 2026", en: "Oct 2025 — Jul 2026", de: "Okt. 2025 — Juli 2026", zh: "2025.10 — 2026.07" }, mention: { fr: "Mention Assez Bien", en: "Honours: Fairly Good", de: "Prädikat: Befriedigend", zh: "成绩：中上" } },
  { title: glsi("Licence"), school: "Université Adventiste Cosendaï, Douala", period: { fr: "Oct. 2024 — Août 2025", en: "Oct 2024 — Aug 2025", de: "Okt. 2024 — Aug. 2025", zh: "2024.10 — 2025.08" }, mention: { fr: "Mention Bien", en: "Honours: Good", de: "Prädikat: Gut", zh: "成绩：良好" } },
  { title: { fr: "DUT — Génie Informatique", en: "DUT — Computer Engineering", de: "DUT — Informatik", zh: "大学技术文凭（DUT）— 计算机工程" }, school: "JFN HUI, Douala", period: { fr: "2022 — 2024", en: "2022 — 2024", de: "2022 — 2024", zh: "2022 — 2024" } },
]

export const certifications: { title: string; issuer: string; date: string; inProgress?: boolean }[] = [
  { title: "Cisco CCNA", issuer: "Cisco", date: "", inProgress: true },
  { title: "Python — Ethical Hacking", issuer: "Hackeraw", date: "01/2025" },
  { title: "HTML & CSS", issuer: "Alison", date: "11/2022" },
]

export const spokenLanguages = [
  { name: "french", level: "fluent", value: 92 },
  { name: "english", level: "basicLevel", value: 30 },
]

export const interests: T[] = [
  { fr: "Musique", en: "Music", de: "Musik", zh: "音乐" },
  { fr: "Sport", en: "Sport", de: "Sport", zh: "运动" },
  { fr: "Jeux vidéo", en: "Video games", de: "Videospiele", zh: "电子游戏" },
  { fr: "Open source", en: "Open source", de: "Open Source", zh: "开源" },
]
