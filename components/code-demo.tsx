"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Braces,
  Code,
  FileCode,
  FileJson,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import SyntaxHighlighter from "@/components/syntax-highlighter"

interface CodeDemoProps {
  primaryHue?: number
}

export default function CodeDemo({ primaryHue = 0 }: CodeDemoProps) {
  const [activeTab, setActiveTab] = useState("html")
  const [isTyping, setIsTyping] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [displayedCode, setDisplayedCode] = useState<Record<string, string>>({
    html: "",
    css: "",
    js: "",
  })
  const [editableCode, setEditableCode] = useState<Record<string, string>>({
    html: "",
    css: "",
    js: "",
  })
  const [output, setOutput] = useState<string[]>([])
  const [typingSpeed, setTypingSpeed] = useState(30)
  const [previewContent, setPreviewContent] = useState("")
  const outputRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Exemples de code
  const codeExamples = {
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animation Interactive</title>
  <style>
    /* Les styles seront ajoutés depuis l'onglet CSS */
  </style>
</head>
<body>
  <div class="container">
    <h1>Animation Interactive</h1>
    <p>Déplacez votre souris sur le canvas ci-dessous pour créer des particules colorées!</p>
    
    <div class="controls">
      <button id="clearBtn">Effacer</button>
      <div class="color-picker">
        <label for="colorPicker">Couleur:</label>
        <input type="color" id="colorPicker" value="#ff5733">
      </div>
      <div class="size-slider">
        <label for="sizeSlider">Taille:</label>
        <input type="range" id="sizeSlider" min="2" max="20" value="5">
      </div>
    </div>
    
    <canvas id="particleCanvas" width="600" height="400"></canvas>
    
    <div class="stats">
      <p>Particules: <span id="particleCount">0</span></p>
      <p>FPS: <span id="fps">0</span></p>
    </div>
  </div>

  <!-- Le script sera ajouté depuis l'onglet JS -->
  <script>
    // Le code JavaScript sera ajouté depuis l'onglet JS
  </script>
</body>
</html>`,

    css: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: 0;
  padding: 20px;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow: hidden;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

.color-picker, .size-slider {
  display: flex;
  align-items: center;
  gap: 8px;
}

input[type="color"] {
  border: none;
  border-radius: 4px;
  height: 30px;
  width: 50px;
  cursor: pointer;
}

input[type="range"] {
  width: 100px;
}

canvas {
  width: 100%;
  height: 400px;
  background-color: #2c3e50;
  border-radius: 8px;
  cursor: crosshair;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 14px;
  color: #666;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
}`,

    js: `// Configuration
let particles = [];
let particleCount = 0;
let lastTime = 0;
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = 0;

// Récupération des éléments DOM
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const colorPicker = document.getElementById('colorPicker');
const sizeSlider = document.getElementById('sizeSlider');
const particleCountElement = document.getElementById('particleCount');
const fpsElement = document.getElementById('fps');

// Classe Particle
class Particle {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.life = 100; // Durée de vie de la particule
  }

  // Mise à jour de la position et de la durée de vie
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 1;
    
    // Rebond sur les bords
    if (this.x <= 0 || this.x >= canvas.width) this.speedX *= -1;
    if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;
  }

  // Dessin de la particule
  draw() {
    ctx.globalAlpha = this.life / 100; // Opacité basée sur la durée de vie
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// Création de particules au clic et au mouvement de la souris
canvas.addEventListener('mousemove', (e) => {
  if (e.buttons === 1) { // Si le bouton gauche est enfoncé
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = parseInt(sizeSlider.value);
    const color = colorPicker.value;
    
    // Créer plusieurs particules à chaque mouvement
    for (let i = 0; i < 3; i++) {
      particles.push(new Particle(
        x + Math.random() * 20 - 10,
        y + Math.random() * 20 - 10,
        size * Math.random() + size/2,
        color
      ));
      particleCount++;
    }
    
    updateParticleCount();
  }
});

// Création de particules au clic
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const size = parseInt(sizeSlider.value);
  const color = colorPicker.value;
  
  // Créer un groupe de particules
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(
      x + Math.random() * 40 - 20,
      y + Math.random() * 40 - 20,
      size * Math.random() + size/2,
      color
    ));
    particleCount++;
  }
  
  updateParticleCount();
});

// Effacer toutes les particules
clearBtn.addEventListener('click', () => {
  particles = [];
  particleCount = 0;
  updateParticleCount();
});

// Mise à jour du compteur de particules
function updateParticleCount() {
  particleCountElement.textContent = particleCount;
}

// Calcul et affichage des FPS
function updateFPS(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
    return;
  }
  
  // Calculer le delta time
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Incrémenter le compteur de frames
  frameCount++;
  
  // Mettre à jour les FPS toutes les secondes
  if (timestamp - lastFpsUpdate > 1000) {
    fps = Math.round((frameCount * 1000) / (timestamp - lastFpsUpdate));
    fpsElement.textContent = fps;
    frameCount = 0;
    lastFpsUpdate = timestamp;
  }
}

// Boucle d'animation principale
function animate(timestamp) {
  // Effacer le canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Mettre à jour et dessiner chaque particule
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    
    // Supprimer les particules mortes
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
      particleCount--;
      updateParticleCount();
    }
  }
  
  // Mettre à jour les FPS
  updateFPS(timestamp);
  
  // Continuer l'animation
  requestAnimationFrame(animate);
}

// Démarrer l'animation
animate();

// Ajuster la taille du canvas lors du redimensionnement
window.addEventListener('resize', () => {
  // Maintenir le ratio du canvas
  canvas.width = canvas.offsetWidth;
  canvas.height = 400;
});

// Initialiser la taille du canvas
canvas.width = canvas.offsetWidth;
canvas.height = 400;

console.log("Animation de particules initialisée !");`,
  }

  // Effet pour l'animation de frappe
  useEffect(() => {
    if (isTyping) {
      let i = 0
      const code = codeExamples[activeTab as keyof typeof codeExamples]

      const typingInterval = setInterval(() => {
        if (i < code.length) {
          setDisplayedCode((prev) => ({
            ...prev,
            [activeTab]: code.substring(0, i + 1),
          }))
          i++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
          setEditableCode((prev) => ({
            ...prev,
            [activeTab]: code,
          }))
        }
      }, typingSpeed)

      return () => clearInterval(typingInterval)
    }
  }, [isTyping, activeTab, typingSpeed])

  // Effet pour l'animation d'exécution
  useEffect(() => {
    if (isExecuting) {
      setOutput([])

      // Simuler l'exécution du code
      const executionSteps = [
        "Initialisation de l'environnement...",
        "Compilation du code...",
        "Création du canvas...",
        "Initialisation des particules...",
        "Ajout des écouteurs d'événements...",
        "Démarrage de l'animation...",
        "✓ Animation démarrée avec succès !",
        "FPS: 60",
        "Particules actives: 0",
      ]

      let i = 0
      const executionInterval = setInterval(() => {
        if (i < executionSteps.length) {
          setOutput((prev) => [...prev, executionSteps[i]])
          i++

          // Scroll to bottom of output
          if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight
          }
        } else {
          clearInterval(executionInterval)
          setIsExecuting(false)

          // Générer la prévisualisation
          updatePreview()
        }
      }, 500)

      return () => clearInterval(executionInterval)
    }
  }, [isExecuting])

  // Mettre à jour la prévisualisation
  const updatePreview = () => {
    const html = editableCode.html
    const css = editableCode.css
    const js = editableCode.js

    // Combiner HTML, CSS et JS
    const combinedCode = html
      .replace("<style>\n    /* Les styles seront ajoutés depuis l'onglet CSS */\n  </style>", `<style>${css}</style>`)
      .replace(
        "<script>\n    // Le code JavaScript sera ajouté depuis l'onglet JS\n  </script>",
        `<script>${js}</script>`,
      )

    setPreviewContent(combinedCode)
  }

  const handleStartTyping = () => {
    setDisplayedCode((prev) => ({
      ...prev,
      [activeTab]: "",
    }))
    setIsTyping(true)
  }

  const handleExecute = () => {
    setIsExecuting(true)
  }

  const handleReset = () => {
    setDisplayedCode((prev) => ({
      ...prev,
      [activeTab]: "",
    }))
    setEditableCode((prev) => ({
      ...prev,
      [activeTab]: "",
    }))
    setOutput([])
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode[activeTab])
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleToggleEdit = () => {
    if (!isEditing) {
      // Passer en mode édition
      setIsEditing(true)
    } else {
      // Appliquer les modifications
      updatePreview()
      setIsEditing(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableCode((prev) => ({
      ...prev,
      [activeTab]: e.target.value,
    }))
  }

  const handleToggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  // Initialiser les codes au chargement
  useEffect(() => {
    setEditableCode({
      html: codeExamples.html,
      css: codeExamples.css,
      js: codeExamples.js,
    })

    // Mettre à jour la prévisualisation initiale
    updatePreview()

    // Détecter la sortie du mode plein écran
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Mettre le focus sur l'éditeur en mode édition
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus()
    }
  }, [isEditing])

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full rounded-lg overflow-hidden border code-editor-gradient transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
        }`}
      style={{
        borderColor: `hsl(${primaryHue}, 70%, 50%, 0.3)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md" style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%, 0.2)` }}>
            <Code className="h-5 w-5" style={{ color: `hsl(${primaryHue}, 70%, 50%)` }} />
          </div>
          <h3 className="font-mono font-bold text-white text-glow">Éditeur de Code Interactif</h3>
          <Badge
            variant="outline"
            className="ml-2 subtle-pulse"
            style={{
              borderColor: `hsl(${primaryHue}, 70%, 50%, 0.5)`,
              color: `hsl(${primaryHue}, 70%, 50%)`,
            }}
          >
            Live
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            onClick={handleToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        {/* Particules d'arrière-plan */}

      </div>

      <div className="flex flex-col md:flex-row flex-grow">
        {/* Left Panel - Code Editor */}
        <div className="flex flex-col w-full md:w-1/2 border-r border-gray-800">
          <Tabs defaultValue="html" value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
            <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-800">
              <TabsList className="bg-gray-800 p-0.5">
                <TabsTrigger
                  value="html"
                  className="code-editor-tab data-[state=active]:bg-gray-700/70 data-[state=active]:text-white px-3 py-1.5 text-xs"
                  style={{ "--tab-highlight-color": `hsl(${primaryHue}, 70%, 50%)` } as React.CSSProperties}
                >
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  HTML
                </TabsTrigger>
                <TabsTrigger
                  value="css"
                  className="code-editor-tab data-[state=active]:bg-gray-700/70 data-[state=active]:text-white px-3 py-1.5 text-xs"
                  style={
                    { "--tab-highlight-color": `hsl(${(primaryHue + 30) % 360}, 70%, 50%)` } as React.CSSProperties
                  }
                >
                  <Braces className="h-3.5 w-3.5 mr-1.5" />
                  CSS
                </TabsTrigger>
                <TabsTrigger
                  value="js"
                  className="code-editor-tab data-[state=active]:bg-gray-700/70 data-[state=active]:text-white px-3 py-1.5 text-xs"
                  style={
                    { "--tab-highlight-color": `hsl(${(primaryHue + 60) % 360}, 70%, 50%)` } as React.CSSProperties
                  }
                >
                  <FileJson className="h-3.5 w-3.5 mr-1.5" />
                  JavaScript
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                  onClick={handleCopyCode}
                >
                  {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                  onClick={handleToggleEdit}
                >
                  {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex-grow relative overflow-hidden bg-[#1e1e1e]">
              {/* Line Numbers Helper Function */}
              {isEditing ? null : (
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1e1e1e] border-r border-gray-800 text-gray-600 font-mono text-sm p-4 text-right select-none z-10 flex flex-col items-end gap-[0.05rem] leading-relaxed pt-[1.1rem]">
                  {(displayedCode[activeTab] || editableCode[activeTab]).split('\n').map((_, i) => (
                    <span key={i} className="h-6">{i + 1}</span>
                  ))}
                </div>
              )}

              <TabsContent value="html" className="m-0 h-full overflow-auto custom-scrollbar">
                {isEditing ? (
                  <textarea
                    ref={editorRef}
                    value={editableCode.html}
                    onChange={handleCodeChange}
                    className="w-full h-full bg-[#1e1e1e] text-gray-200 font-mono text-sm p-4 pl-12 resize-none focus:outline-none leading-relaxed"
                    spellCheck="false"
                  />
                ) : (
                  <div className="p-4 pl-12 min-h-full">
                    <SyntaxHighlighter
                      code={displayedCode.html || (isTyping ? "" : editableCode.html) || "// Cliquez sur 'Taper' pour voir le code HTML"}
                      language="html"
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="css" className="m-0 h-full overflow-auto custom-scrollbar">
                {isEditing ? (
                  <textarea
                    ref={editorRef}
                    value={editableCode.css}
                    onChange={handleCodeChange}
                    className="w-full h-full bg-[#1e1e1e] text-gray-200 font-mono text-sm p-4 pl-12 resize-none focus:outline-none leading-relaxed"
                    spellCheck="false"
                  />
                ) : (
                  <div className="p-4 pl-12 min-h-full">
                    <SyntaxHighlighter
                      code={displayedCode.css || (isTyping ? "" : editableCode.css) || "// Cliquez sur 'Taper' pour voir le code CSS"}
                      language="css"
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="js" className="m-0 h-full overflow-auto custom-scrollbar">
                {isEditing ? (
                  <textarea
                    ref={editorRef}
                    value={editableCode.js}
                    onChange={handleCodeChange}
                    className="w-full h-full bg-[#1e1e1e] text-gray-200 font-mono text-sm p-4 pl-12 resize-none focus:outline-none leading-relaxed"
                    spellCheck="false"
                  />
                ) : (
                  <div className="p-4 pl-12 min-h-full">
                    <SyntaxHighlighter
                      code={displayedCode.js || (isTyping ? "" : editableCode.js) || "// Cliquez sur 'Taper' pour voir le code JS"}
                      language="js"
                    />
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex items-center justify-between p-2 bg-gray-900 border-t border-gray-800">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="code-editor-button h-8 px-3 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/70 text-xs"
                onClick={handleStartTyping}
                disabled={isTyping}
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Taper le code
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/70 text-xs transition-all duration-300 hover:scale-105"
                onClick={updatePreview}
                disabled={isExecuting}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Actualiser
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Vitesse:</span>
              <input
                type="range"
                min="10"
                max="100"
                value={100 - typingSpeed}
                onChange={(e) => setTypingSpeed(100 - Number.parseInt(e.target.value))}
                className="w-20 h-2 bg-gray-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-webkit-slider-thumb]:bg-primary"
                style={{
                  ["--primary" as any]: `hsl(${primaryHue}, 70%, 50%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Preview & Console */}
        <div className="flex flex-col w-full md:w-1/2">
          <Tabs defaultValue="preview" className="flex-grow flex flex-col">
            <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-800">
              <TabsList className="bg-gray-800 p-0.5">
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-white px-3 py-1.5 text-xs"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Aperçu
                </TabsTrigger>
                <TabsTrigger
                  value="console"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-white px-3 py-1.5 text-xs"
                >
                  <Terminal className="h-3.5 w-3.5 mr-1.5" />
                  Console
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                  onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                >
                  {isPreviewVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <div className="flex-grow">
              <TabsContent value="preview" className="m-0 h-full">
                <div className="w-full h-full bg-white relative">
                  {!isPreviewVisible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                      <Button
                        onClick={() => setIsPreviewVisible(true)}
                        className="flex items-center gap-2"
                        style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                      >
                        <Eye className="h-4 w-4" />
                        Afficher l'aperçu
                      </Button>
                    </div>
                  )}
                  <iframe
                    ref={previewRef}
                    className="w-full h-full border-0"
                    title="Aperçu du code"
                    sandbox="allow-scripts"
                    srcDoc={previewContent}
                  />
                </div>
              </TabsContent>
              <TabsContent value="console" className="m-0 h-full">
                <div
                  ref={outputRef}
                  className="w-full h-full bg-gray-950 text-gray-200 font-mono text-sm p-4 overflow-auto"
                >
                  {output.length > 0 ? (
                    <div>
                      {output.map((line, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="mb-1 flex items-start"
                        >
                          <span className="text-gray-500 mr-2">$</span>
                          <span
                            className={
                              typeof line === "string" && line.includes("✓")
                                ? "text-green-400"
                                : typeof line === "string" && line.includes("erreur")
                                  ? "text-red-400"
                                  : "text-white"
                            }
                          >
                            {line}
                          </span>
                        </motion.div>
                      ))}
                      {isExecuting && (
                        <motion.span
                          className="inline-block h-4 w-2"
                          style={{ backgroundColor: `hsl(${primaryHue}, 70%, 50%)` }}
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      <p>La console affichera les résultats d'exécution et les messages de débogage.</p>
                      <p className="mt-2">Cliquez sur "Exécuter" pour voir les résultats.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex items-center justify-between p-2 bg-gray-900 border-t border-gray-800">
            <Button
              size="sm"
              variant="default"
              className="h-8 px-3 text-xs transition-all duration-300 hover:scale-105 bg-gradient-to-r"
              onClick={handleExecute}
              disabled={isExecuting}
              style={{
                backgroundImage: `linear-gradient(to right, hsl(${primaryHue}, 70%, 50%), hsl(${(primaryHue + 60) % 360}, 70%, 50%))`,
              }}
            >
              {isExecuting ? (
                <>
                  <Pause className="h-3.5 w-3.5 mr-1.5" />
                  Exécution...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Exécuter
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 bg-gray-800 border-gray-700 hover:bg-gray-700 text-xs"
              onClick={() => {
                const blob = new Blob([previewContent], { type: "text/html" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "animation-interactive.html"
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Télécharger
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
