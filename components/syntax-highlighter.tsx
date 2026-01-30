"use client"

import React from "react"

interface SyntaxHighlighterProps {
    code: string
    language: "html" | "css" | "js" | "javascript"
    className?: string
}

export default function SyntaxHighlighter({ code, language, className = "" }: SyntaxHighlighterProps) {
    const highlight = (code: string, lang: string) => {
        let highlightedRequest = code

        // Échapper le HTML de base pour éviter les injections
        highlightedRequest = highlightedRequest
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")

        if (lang === "html") {
            // Commentaires
            highlightedRequest = highlightedRequest.replace(
                /(&lt;!--[\s\S]*?--&gt;)/g,
                '<span class="text-gray-500 italic">$1</span>'
            )
            // Tags
            highlightedRequest = highlightedRequest.replace(
                /(&lt;\/?)(\w+)(.*?)(&gt;)/g,
                '$1<span class="text-blue-400">$2</span>$3$4'
            )
            // Attributs
            highlightedRequest = highlightedRequest.replace(
                /(\s)([a-zA-Z-]+)(=)/g,
                '$1<span class="text-cyan-400">$2</span><span class="text-gray-400">$3</span>'
            )
            // Valeurs d'attributs (chaînes) - Attention, c'est simplifié
            highlightedRequest = highlightedRequest.replace(
                /(".*?")/g,
                '<span class="text-orange-300">$1</span>'
            )
        } else if (lang === "css") {
            // Commentaires
            highlightedRequest = highlightedRequest.replace(
                /(\/\*[\s\S]*?\*\/)/g,
                '<span class="text-gray-500 italic">$1</span>'
            )
            // Sélecteurs
            highlightedRequest = highlightedRequest.replace(
                /^([^{]+)({)/gm,
                '<span class="text-yellow-400">$1</span><span class="text-gray-300">$2</span>'
            )
            // Propriétés et valeurs
            highlightedRequest = highlightedRequest.replace(
                /([\w-]+)(:)([^;]+)(;)/g,
                '<span class="text-cyan-300">$1</span><span class="text-gray-400">$2</span><span class="text-orange-300">$3</span><span class="text-gray-400">$4</span>'
            )
        } else if (lang === "js" || lang === "javascript") {
            // Commentaires
            highlightedRequest = highlightedRequest.replace(
                /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
                '<span class="text-gray-500 italic">$1</span>'
            )
            // Chaînes
            highlightedRequest = highlightedRequest.replace(
                /(['"`].*?['"`])/g,
                '<span class="text-green-300">$1</span>'
            )
            // Mots-clés
            const keywords = "const|let|var|function|return|if|else|for|while|class|constructor|this|new|import|export|default|true|false|null|undefined"
            highlightedRequest = highlightedRequest.replace(
                new RegExp(`\\b(${keywords})\\b`, "g"),
                '<span class="text-purple-400 font-bold">$1</span>'
            )
            // Fonctions
            highlightedRequest = highlightedRequest.replace(
                /(\w+)(\()/g,
                '<span class="text-blue-300">$1</span><span class="text-gray-300">$2</span>'
            )
            // Nombres
            highlightedRequest = highlightedRequest.replace(
                /\b(\d+)\b/g,
                '<span class="text-orange-400">$1</span>'
            )
        }

        return highlightedRequest
    }

    return (
        <pre className={`font-mono text-sm leading-relaxed ${className}`}>
            <code
                dangerouslySetInnerHTML={{
                    __html: highlight(code, language),
                }}
            />
        </pre>
    )
}
