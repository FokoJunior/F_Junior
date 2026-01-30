"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

const SYSTEM_PROMPT = `
Tu es l'assistant personnel IA de FOKO TADJUIGE B. JUNIOR (connu sous le pseudo F_Junior).
Ton rôle est de répondre aux questions des visiteurs de son portfolio uniquement sur lui, ses projets, son parcours et ses compétences.

INFORMATIONS SUR F_JUNIOR :
- Nom complet : FOKO TADJUIGE B. JUNIOR
- Pseudo : F_Junior
- Statut : Étudiant en 3ème Année de Génie Logiciel.
- Passion : Intelligence Artificielle et Développement Logiciel.
- Localisation : Douala - Logpom, Cameroun.

COMPÉTENCES :
- Frontend : HTML, CSS, JavaScript, React, Next.js, Tailwind CSS, Vue.js.
- Backend : Node.js, Express, Python, Django, PHP, Laravel, MySQL.
- Mobile : React Native, Flutter, Firebase.
- IA/ML : Python, TensorFlow, PyTorch, Scikit-learn, NLP, Computer Vision.
- Outils : Git, GitHub, VS Code, Docker, Agile, Figma.
- Langues : Français (Courant), Anglais (Débutant).

PROJETS NOTABLES :
1. Site E-commerce : Construit avec Next.js et Tailwind CSS (catalogue, filtrage, panier, paiement).
2. Gestionnaire de Tâches : React, Firebase, Auth, glisser-déposer.
3. Application Météo : Dashboard avec API météo, interface intuitive.
4. Site Portfolio : Ce site actuel, moderne et épuré.
5. Projets Mobile : Gestion de tâches quotidiennes, synchronisation cloud.
6. Projet IA : Analyse et catégorisation de textes par NLP.

CONSIGNES DE RÉPONSE :
1. Parle TOUJOURS au nom de F_Junior ou comme son assistant dédié.
2. Ne parle QUE de F_Junior, de ses projets, de son parcours et de ses compétences.
3. Si on te pose une question hors sujet (ex: cuisine, sport, géographie générale), réponds poliment que tu es spécialisé sur le parcours de F_Junior et invite l'utilisateur à poser des questions sur ses compétences en développement ou ses projets.
4. Sois professionnel, amical et concis.
5. Réponds dans la langue de l'utilisateur (Français par défaut).
`

export async function chatWithOpenAI(messages: { role: "user" | "assistant", content: string }[]) {
    try {
        // Use gemini-flash-latest as found in the available models list
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
        })

        // Prepare history by injecting system prompt as the first part of the conversation context
        // Gemini handles history as pairs of user/model messages. 
        // We will cheat a bit by prepending the system prompt to the first user message if possible, 
        // or just relying on the context.

        // Better strategy: Prepend the system prompt to the very last message sent by the user, 
        // or include it in the history structure as a user message if needed.
        // However, the cleanest way without systemInstruction is to add it to the first message.

        let history = messages
            .filter(msg => msg.role !== "system")
            .map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }]
            }))

        // Ensure history starts with user
        while (history.length > 0 && history[0].role === "model") {
            history.shift()
        }

        // Capture the last message
        const lastMessage = history.pop()

        if (!lastMessage || !lastMessage.parts[0].text) {
            return { text: "Bonjour ! Comment puis-je vous aider ?" }
        }

        // Creating a session with the history
        const chat = model.startChat({
            history: history,
        })

        // Prepend system prompt to the user's message to enforce persona
        const fullPrompt = `${SYSTEM_PROMPT}\n\nQuestion de l'utilisateur: ${lastMessage.parts[0].text}`

        const result = await chat.sendMessage(fullPrompt)
        const response = result.response
        const text = response.text()

        return { text }
    } catch (error) {
        console.error("Erreur Gemini API:", error)
        return { error: "Désolé, je ne suis pas disponible pour le moment. Réessayez plus tard." }
    }
}
