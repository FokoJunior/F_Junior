"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface WireframeOrbProps {
  primaryHue?: number
}

export default function WireframeOrb({ primaryHue = 0 }: WireframeOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const orbRef = useRef<THREE.Mesh | null>(null)
  const wireframeRef = useRef<THREE.LineSegments | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const pointLightRef = useRef<THREE.PointLight | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationFrameRef = useRef<number>(0)
  const autoRotate = useRef(true)
  const rotationSpeedRef = useRef(0.005) // Vitesse de rotation de base

  useEffect(() => {
    setIsMounted(true)

    // Initialiser la scène Three.js
    const initScene = () => {
      if (!containerRef.current) return

      // Obtenir les dimensions du conteneur
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      // Créer la scène
      const scene = new THREE.Scene()
      sceneRef.current = scene

      // Créer la caméra
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
      camera.position.z = 5
      cameraRef.current = camera

      // Créer le renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(window.devicePixelRatio)
      containerRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Ajouter les contrôles orbitaux
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.rotateSpeed = 0.5
      controls.enableZoom = true
      controls.minDistance = 3
      controls.maxDistance = 10
      controls.autoRotate = true
      controls.autoRotateSpeed = 1.5 // Augmentation de la vitesse de rotation automatique
      controlsRef.current = controls

      // Créer l'orbe wireframe
      createWireframeOrb()

      // Ajouter des particules
      createParticles()

      // Ajouter des étoiles en arrière-plan
      createStars()

      // Gérer le redimensionnement
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight

        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()

        rendererRef.current.setSize(width, height)
      }

      window.addEventListener("resize", handleResize)

      // Gérer les mouvements de souris
      const handleMouseMove = (event: MouseEvent) => {
        if (!containerRef.current) return

        // Calculer la position relative de la souris
        const rect = containerRef.current.getBoundingClientRect()
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

        // Ajuster la vitesse de rotation en fonction de la position de la souris
        if (wireframeRef.current) {
          rotationSpeedRef.current = 0.005 + Math.abs(mouseX) * 0.01
        }

        // Déplacer la lumière ponctuelle en fonction de la position de la souris
        if (pointLightRef.current) {
          pointLightRef.current.position.x = mouseX * 5
          pointLightRef.current.position.y = mouseY * 5
        }

        // Désactiver la rotation automatique lorsque l'utilisateur interagit
        if (controlsRef.current) {
          controlsRef.current.autoRotate = false
          autoRotate.current = false

          // Réactiver la rotation automatique après 3 secondes d'inactivité
          clearTimeout(autoRotateTimeout.current)
          autoRotateTimeout.current = setTimeout(() => {
            if (controlsRef.current) {
              controlsRef.current.autoRotate = true
              autoRotate.current = true
            }
          }, 3000)
        }
      }

      containerRef.current.addEventListener("mousemove", handleMouseMove)

      // Timeout pour la rotation automatique
      const autoRotateTimeout = { current: 0 }

      // Démarrer la boucle d'animation
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate)

        if (controlsRef.current) {
          controlsRef.current.update()
        }

        // Animer l'orbe wireframe avec une rotation plus dynamique
        if (wireframeRef.current) {
          wireframeRef.current.rotation.y += rotationSpeedRef.current
          wireframeRef.current.rotation.x += rotationSpeedRef.current * 0.5
        }

        // Animer l'orbe principal
        if (orbRef.current) {
          orbRef.current.rotation.y += rotationSpeedRef.current * 0.8
          orbRef.current.rotation.x += rotationSpeedRef.current * 0.3
        }

        // Animer les particules
        if (particlesRef.current) {
          particlesRef.current.rotation.y -= rotationSpeedRef.current * 0.3

          // Faire pulser les particules
          const positions = particlesRef.current.geometry.attributes.position.array
          const time = Date.now() * 0.0005

          for (let i = 0; i < positions.length; i += 3) {
            const i3 = i / 3
            const x = positions[i]
            const y = positions[i + 1]
            const z = positions[i + 2]

            // Calculer la distance depuis le centre
            const distance = Math.sqrt(x * x + y * y + z * z)

            // Faire pulser les particules
            const scale = 1 + 0.15 * Math.sin(time + i3 * 0.1)

            positions[i] = x * scale
            positions[i + 1] = y * scale
            positions[i + 2] = z * scale
          }

          particlesRef.current.geometry.attributes.position.needsUpdate = true
        }

        // Faire tourner la lumière ponctuelle autour de l'orbe
        if (pointLightRef.current) {
          const time = Date.now() * 0.001
          if (!isMouseMoving) {
            pointLightRef.current.position.x = Math.sin(time) * 5
            pointLightRef.current.position.y = Math.cos(time) * 5
            pointLightRef.current.position.z = Math.sin(time * 0.5) * 5
          }
        }

        // Rendu de la scène
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current)
        }
      }

      // Variable pour suivre si la souris est en mouvement
      let isMouseMoving = false
      containerRef.current.addEventListener("mousemove", () => {
        isMouseMoving = true
        setTimeout(() => {
          isMouseMoving = false
        }, 100)
      })

      animate()

      // Fonction de nettoyage
      return () => {
        window.removeEventListener("resize", handleResize)
        if (containerRef.current) {
          containerRef.current.removeEventListener("mousemove", handleMouseMove)
          if (rendererRef.current) {
            containerRef.current.removeChild(rendererRef.current.domElement)
          }
        }
        cancelAnimationFrame(animationFrameRef.current)
        clearTimeout(autoRotateTimeout.current)
      }
    }

    // Créer l'orbe wireframe
    const createWireframeOrb = () => {
      if (!sceneRef.current) return

      // Créer la géométrie de la sphère avec plus de segments pour un wireframe plus détaillé
      const geometry = new THREE.SphereGeometry(2, 48, 48)

      // Créer le matériau de l'orbe principal (semi-transparent)
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(`hsl(${primaryHue}, 70%, 50%)`),
        transparent: true,
        opacity: 0.15,
        shininess: 100,
        specular: new THREE.Color(`hsl(${(primaryHue + 60) % 360}, 100%, 80%)`),
      })

      // Créer l'orbe principal
      const orb = new THREE.Mesh(geometry, material)
      sceneRef.current.add(orb)
      orbRef.current = orb

      // Créer le wireframe avec un matériau plus brillant
      const wireframeGeometry = new THREE.WireframeGeometry(geometry)
      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(`hsl(${(primaryHue + 30) % 360}, 100%, 70%)`),
        transparent: true,
        opacity: 0.8,
        linewidth: 1,
      })

      const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
      sceneRef.current.add(wireframe)
      wireframeRef.current = wireframe

      // Ajouter une lumière ambiante
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      sceneRef.current.add(ambientLight)

      // Ajouter une lumière directionnelle
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 3, 5)
      sceneRef.current.add(directionalLight)

      // Ajouter une lumière ponctuelle qui change de couleur
      const pointLight = new THREE.PointLight(new THREE.Color(`hsl(${(primaryHue + 180) % 360}, 100%, 70%)`), 1.5, 10)
      pointLight.position.set(-3, 2, 2)
      sceneRef.current.add(pointLight)
      pointLightRef.current = pointLight

      // Ajouter une deuxième lumière ponctuelle pour plus d'effet
      const pointLight2 = new THREE.PointLight(new THREE.Color(`hsl(${(primaryHue + 90) % 360}, 100%, 70%)`), 1, 8)
      pointLight2.position.set(3, -2, -2)
      sceneRef.current.add(pointLight2)
    }

    // Ajouter des particules autour de l'orbe
    const createParticles = () => {
      if (!sceneRef.current) return

      const particlesGeometry = new THREE.BufferGeometry()
      const particleCount = 1500 // Augmentation du nombre de particules

      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      const sizes = new Float32Array(particleCount)

      const color = new THREE.Color()

      for (let i = 0; i < particleCount; i++) {
        // Positionner les particules sur une sphère
        const radius = 2.2 + Math.random() * 0.5 // Légèrement plus grand que l'orbe
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)

        // Taille variable des particules
        sizes[i] = Math.random() * 0.1 + 0.02

        // Couleur basée sur la position avec plus de variation
        color.setHSL(
          (primaryHue / 360 + positions[i * 3] / 10 + Math.random() * 0.2) % 1,
          0.8,
          0.5 + Math.random() * 0.3,
        )

        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }

      particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
      particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

      // Utiliser un shader personnalisé pour des particules plus brillantes
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending, // Effet de brillance
      })

      const particles = new THREE.Points(particlesGeometry, particlesMaterial)
      sceneRef.current.add(particles)
      particlesRef.current = particles
    }

    // Ajouter des étoiles en arrière-plan
    const createStars = () => {
      if (!sceneRef.current) return

      const starsGeometry = new THREE.BufferGeometry()
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending, // Effet de brillance
      })

      const starsVertices = []
      for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 100
        const y = (Math.random() - 0.5) * 100
        const z = (Math.random() - 0.5) * 100

        // S'assurer que les étoiles sont loin de l'orbe
        const distance = Math.sqrt(x * x + y * y + z * z)
        if (distance > 20) {
          starsVertices.push(x, y, z)
        }
      }

      starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3))
      const stars = new THREE.Points(starsGeometry, starsMaterial)
      sceneRef.current.add(stars)
    }

    // Ajouter cette fonction dans le useEffect pour détecter les appareils mobiles
    const isMobile = window.innerWidth < 768

    // Ajuster les paramètres en fonction de l'appareil
    if (isMobile) {
      // Réduire la complexité sur mobile
      if (orbRef.current) {
        const geometry = new THREE.SphereGeometry(2, 24, 24) // Moins de segments
        orbRef.current.geometry = geometry

        if (wireframeRef.current) {
          const wireframeGeometry = new THREE.WireframeGeometry(geometry)
          wireframeRef.current.geometry = wireframeGeometry
        }
      }

      // Ajuster les contrôles pour une meilleure expérience tactile
      if (controlsRef.current) {
        controlsRef.current.rotateSpeed = 0.3
        controlsRef.current.enableZoom = false // Désactiver le zoom sur mobile
        controlsRef.current.autoRotateSpeed = 2.0 // Rotation plus rapide sur mobile
      }
    }

    // Initialiser la scène au montage du composant
    initScene()

    return () => {
      // Nettoyage géré dans la fonction de retour d'initScene
    }
  }, [primaryHue])

  // Mettre à jour les couleurs lorsque primaryHue change
  useEffect(() => {
    // Mettre à jour la couleur de l'orbe principal
    if (orbRef.current && orbRef.current.material instanceof THREE.MeshPhongMaterial) {
      orbRef.current.material.color.set(new THREE.Color(`hsl(${primaryHue}, 70%, 50%)`))
      orbRef.current.material.specular.set(new THREE.Color(`hsl(${(primaryHue + 60) % 360}, 100%, 80%)`))
      orbRef.current.material.needsUpdate = true
    }

    // Mettre à jour la couleur du wireframe
    if (wireframeRef.current && wireframeRef.current.material instanceof THREE.LineBasicMaterial) {
      wireframeRef.current.material.color.set(new THREE.Color(`hsl(${(primaryHue + 30) % 360}, 100%, 70%)`))
      wireframeRef.current.material.needsUpdate = true
    }

    // Mettre à jour la couleur de la lumière ponctuelle
    if (pointLightRef.current) {
      pointLightRef.current.color.set(new THREE.Color(`hsl(${(primaryHue + 180) % 360}, 100%, 70%)`))
    }

    // Mettre à jour les couleurs des particules
    if (particlesRef.current && particlesRef.current.geometry.attributes.color) {
      const colors = particlesRef.current.geometry.attributes.color.array
      const positions = particlesRef.current.geometry.attributes.position.array
      const color = new THREE.Color()

      for (let i = 0; i < colors.length / 3; i++) {
        color.setHSL(
          (primaryHue / 360 + positions[i * 3] / 10 + Math.random() * 0.1) % 1,
          0.8,
          0.5 + Math.random() * 0.3,
        )

        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }

      particlesRef.current.geometry.attributes.color.needsUpdate = true
    }
  }, [primaryHue])

  if (!isMounted) return null

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  )
}
