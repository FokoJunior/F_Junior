"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Code2,
  FileCode,
  Palette,
  Terminal,
  Eye,
  Circle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SyntaxHighlighter from "@/components/syntax-highlighter"

interface CodeDemoProps {
  primaryHue?: number
}

// Exemples de code
const codeExamples = {
  html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Portfolio F_Junior</title>
</head>
<body>
  <div class="hero">
    <h1 class="title">Bonjour, je suis <span>F_Junior</span></h1>
    <p class="subtitle">Développeur Full Stack & IA</p>
    <button class="cta-btn" onclick="greet()">
      Découvrir mes projets
    </button>
  </div>
</body>
</html>`,

  css: `.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23, #1a1a3e);
  color: white;
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.title span {
  background: linear-gradient(90deg, #00d4ff, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.8;
  margin-bottom: 2rem;
}

.cta-btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 50px;
  background: linear-gradient(90deg, #00d4ff, #7c3aed);
  color: white;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.cta-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 40px rgba(124, 58, 237, 0.4);
}`,

  js: `// Animation interactive
function greet() {
  const messages = [
    "Bienvenue! 🚀",
    "Explorez mes projets 💡",
    "Contactez-moi! 🤝"
  ];
  const idx = Math.floor(Math.random() * messages.length);
  alert(messages[idx]);
}

// Animation au chargement
document.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('.title');
  if (title) {
    title.style.opacity = 0;
    title.style.transform = 'translateY(20px)';
    setTimeout(() => {
      title.style.transition = 'all 0.6s ease';
      title.style.opacity = 1;
      title.style.transform = 'translateY(0)';
    }, 200);
  }
  console.log("✨ Portfolio prêt!");
});`
}

export default function CodeDemo({ primaryHue = 0 }: CodeDemoProps) {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html")
  const [rightPanel, setRightPanel] = useState<"preview" | "console">("preview")
  const [isTyping, setIsTyping] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [displayedCode, setDisplayedCode] = useState({ html: "", css: "", js: "" })
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [previewHtml, setPreviewHtml] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Générer le HTML complet pour le preview
  const generatePreview = () => {
    const html = displayedCode.html || codeExamples.html
    const css = displayedCode.css || codeExamples.css
    const js = displayedCode.js || codeExamples.js

    // Extraire le contenu du body
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    const bodyContent = bodyMatch ? bodyMatch[1] : html

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  ${bodyContent}
  <script>${js}<\/script>
</body>
</html>`
  }

  // Effet de frappe automatique
  useEffect(() => {
    if (isTyping) {
      let charIndex = 0
      const code = codeExamples[activeTab]

      const interval = setInterval(() => {
        if (charIndex <= code.length) {
          setDisplayedCode(prev => ({
            ...prev,
            [activeTab]: code.slice(0, charIndex)
          }))
          charIndex++
        } else {
          setIsTyping(false)
          clearInterval(interval)
        }
      }, 12)

      return () => clearInterval(interval)
    }
  }, [isTyping, activeTab])

  // Mettre à jour le preview quand le code change
  useEffect(() => {
    const newPreview = generatePreview()
    setPreviewHtml(newPreview)
  }, [displayedCode])

  const handleStartTyping = () => {
    setDisplayedCode(prev => ({ ...prev, [activeTab]: "" }))
    setIsTyping(true)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeExamples[activeTab])
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleRun = () => {
    // Charger tout le code d'un coup
    setDisplayedCode({
      html: codeExamples.html,
      css: codeExamples.css,
      js: codeExamples.js
    })

    setConsoleOutput([])
    setRightPanel("console")

    // Messages console simulés
    const messages = [
      "🚀 Compilation...",
      "✅ HTML parsé",
      "✅ CSS appliqué",
      "✅ JS exécuté",
      "🎉 Prêt!"
    ]

    messages.forEach((msg, i) => {
      setTimeout(() => {
        setConsoleOutput(prev => [...prev, msg])
        if (i === messages.length - 1) {
          setTimeout(() => setRightPanel("preview"), 500)
        }
      }, 200 * (i + 1))
    })
  }

  const handleReset = () => {
    setDisplayedCode({ html: "", css: "", js: "" })
    setConsoleOutput([])
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  const tabs = [
    { id: "html", label: "index.html", icon: FileCode, color: "#e34c26" },
    { id: "css", label: "style.css", icon: Palette, color: "#264de4" },
    { id: "js", label: "script.js", icon: Code2, color: "#f7df1e" },
  ]

  const currentCode = displayedCode[activeTab] || codeExamples[activeTab]

  return (
    <motion.div
      ref={containerRef}
      className={`rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col ${isFullscreen ? "fixed inset-0 z-50" : "h-full"
        }`}
      style={{ backgroundColor: "#1e1e1e" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-gray-800"
        style={{ backgroundColor: "#252526" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <Circle className="w-3 h-3 fill-red-500 text-red-500" />
            <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <Circle className="w-3 h-3 fill-green-500 text-green-500" />
          </div>
          <span className="text-gray-400 text-sm ml-4 font-medium">F_Junior IDE</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center border-b border-gray-800 overflow-x-auto"
        style={{ backgroundColor: "#252526" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "html" | "css" | "js")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-r border-gray-800 ${activeTab === tab.id
                ? "bg-[#1e1e1e] text-white"
                : "text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d]"
              }`}
          >
            <tab.icon className="w-4 h-4" style={{ color: tab.color }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content - Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 flex flex-col overflow-hidden border-r border-gray-800">
          {/* Code Area */}
          <div className="flex-1 overflow-auto" style={{ backgroundColor: "#1e1e1e" }}>
            <div className="flex h-full">
              {/* Line Numbers */}
              <div
                className="py-4 pr-2 text-right text-gray-600 select-none font-mono text-xs border-r border-gray-800 min-w-[40px]"
                style={{ backgroundColor: "#1e1e1e" }}
              >
                {currentCode.split('\n').map((_, i) => (
                  <div key={i} className="leading-5 px-2">{i + 1}</div>
                ))}
              </div>

              {/* Code Content */}
              <div className="flex-1 p-3 overflow-auto">
                <SyntaxHighlighter
                  code={currentCode}
                  language={activeTab}
                  className="leading-5 text-xs"
                />
                {isTyping && (
                  <motion.span
                    className="inline-block w-1.5 h-4 bg-white ml-0.5"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div
            className="flex items-center justify-between px-3 py-2 border-t border-gray-800"
            style={{ backgroundColor: "#252526" }}
          >
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleStartTyping}
                disabled={isTyping}
                className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-3"
              >
                <Code2 className="w-3 h-3 mr-1" />
                Taper
              </Button>
              <Button
                size="sm"
                onClick={handleRun}
                className="h-7 text-xs px-3 text-white"
                style={{ backgroundColor: `hsl(${primaryHue}, 70%, 45%)` }}
              >
                <Play className="w-3 h-3 mr-1" />
                Exécuter
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReset}
                className="text-gray-400 hover:text-white hover:bg-gray-700 h-7 text-xs px-2"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="text-gray-400 hover:text-white hover:bg-gray-700 h-7 text-xs px-2"
            >
              {isCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Right Panel - Preview/Console */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Panel Tabs */}
          <div
            className="flex items-center border-b border-gray-800"
            style={{ backgroundColor: "#252526" }}
          >
            <button
              onClick={() => setRightPanel("preview")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${rightPanel === "preview"
                  ? "bg-[#1e1e1e] text-white"
                  : "text-gray-500 hover:text-gray-300"
                }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setRightPanel("console")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${rightPanel === "console"
                  ? "bg-[#1e1e1e] text-white"
                  : "text-gray-500 hover:text-gray-300"
                }`}
            >
              <Terminal className="w-4 h-4" />
              Console
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {rightPanel === "preview" ? (
              <iframe
                ref={iframeRef}
                srcDoc={previewHtml}
                title="Preview"
                className="w-full h-full bg-white"
                sandbox="allow-scripts"
              />
            ) : (
              <div
                className="h-full p-4 font-mono text-sm overflow-auto"
                style={{ backgroundColor: "#0d1117" }}
              >
                {consoleOutput.length === 0 ? (
                  <span className="text-gray-600">En attente d'exécution...</span>
                ) : (
                  consoleOutput.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-gray-300 mb-1"
                    >
                      <span className="text-gray-600 mr-2">[{String(i).padStart(2, '0')}]</span>
                      {line}
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div
        className="flex items-center justify-between px-4 py-1 text-xs border-t border-gray-800"
        style={{ backgroundColor: "#007acc" }}
      >
        <div className="flex items-center gap-4 text-white/90">
          <span>UTF-8</span>
          <span>{activeTab.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4 text-white/90">
          <span>Ln {currentCode.split('\n').length}</span>
          <span>F_Junior IDE</span>
        </div>
      </div>
    </motion.div>
  )
}
