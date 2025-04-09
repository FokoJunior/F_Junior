"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface InteractiveGlobeProps {
  primaryHue?: number
}

export default function InteractiveGlobe({ primaryHue = 0 }: InteractiveGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const globeRef = useRef<THREE.Mesh | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const markersRef = useRef<THREE.Group | null>(null)
  const connectionsRef = useRef<THREE.Line[]>([])
  const animationFrameRef = useRef<number>(0)
  const autoRotate = useRef(true)

  // Définir plus de villes/points d'intérêt pour avoir plus de connexions
  const locations = [
    { name: "Paris", lat: 48.8566, lng: 2.3522, color: `hsl(${(primaryHue + 20) % 360}, 70%, 60%)` },
    { name: "New York", lat: 40.7128, lng: -74.006, color: `hsl(${(primaryHue + 40) % 360}, 70%, 60%)` },
    { name: "Tokyo", lat: 35.6762, lng: 139.6503, color: `hsl(${(primaryHue + 60) % 360}, 70%, 60%)` },
    { name: "Sydney", lat: -33.8688, lng: 151.2093, color: `hsl(${(primaryHue + 80) % 360}, 70%, 60%)` },
    { name: "Douala", lat: 4.0511, lng: 9.7679, color: `hsl(${(primaryHue + 100) % 360}, 70%, 60%)` },
    { name: "Nairobi", lat: -1.2921, lng: 36.8219, color: `hsl(${(primaryHue + 120) % 360}, 70%, 60%)` },
    { name: "Moscow", lat: 55.7558, lng: 37.6173, color: `hsl(${(primaryHue + 140) % 360}, 70%, 60%)` },
    { name: "Rio", lat: -22.9068, lng: -43.1729, color: `hsl(${(primaryHue + 160) % 360}, 70%, 60%)` },
    { name: "Cairo", lat: 30.0444, lng: 31.2357, color: `hsl(${(primaryHue + 180) % 360}, 70%, 60%)` },
    { name: "Beijing", lat: 39.9042, lng: 116.4074, color: `hsl(${(primaryHue + 200) % 360}, 70%, 60%)` },
    { name: "London", lat: 51.5074, lng: -0.1278, color: `hsl(${(primaryHue + 220) % 360}, 70%, 60%)` },
    { name: "Berlin", lat: 52.52, lng: 13.405, color: `hsl(${(primaryHue + 240) % 360}, 70%, 60%)` },
    { name: "Mumbai", lat: 19.076, lng: 72.8777, color: `hsl(${(primaryHue + 260) % 360}, 70%, 60%)` },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437, color: `hsl(${(primaryHue + 280) % 360}, 70%, 60%)` },
    { name: "Mexico City", lat: 19.4326, lng: -99.1332, color: `hsl(${(primaryHue + 300) % 360}, 70%, 60%)` },
    { name: "Singapore", lat: 1.3521, lng: 103.8198, color: `hsl(${(primaryHue + 320) % 360}, 70%, 60%)` },
  ]

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
      controls.autoRotateSpeed = 0.5
      controlsRef.current = controls

      // Créer le globe
      createGlobe()

      // Créer les marqueurs pour les villes
      createMarkers()

      // Créer les connexions entre les villes
      createConnections()

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

        // Désactiver la rotation automatique lorsque l'utilisateur interagit
        if (controlsRef.current) {
          controlsRef.current.autoRotate = false
          autoRotate.current = false

          // Réactiver la rotation automatique après 5 secondes d'inactivité
          clearTimeout(autoRotateTimeout.current)
          autoRotateTimeout.current = setTimeout(() => {
            if (controlsRef.current) {
              controlsRef.current.autoRotate = true
              autoRotate.current = true
            }
          }, 5000)
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

        // Animer les marqueurs
        if (markersRef.current) {
          markersRef.current.children.forEach((marker, index) => {
            if (marker instanceof THREE.Mesh) {
              marker.rotation.y += 0.01
              marker.scale.setScalar(1 + Math.sin(Date.now() * 0.002 + index) * 0.1)
            }
          })
        }

        // Animer les connexions
        connectionsRef.current.forEach((line, index) => {
          if (line.material instanceof THREE.LineBasicMaterial) {
            const opacity = 0.3 + Math.sin(Date.now() * 0.001 + index) * 0.2
            line.material.opacity = Math.max(0.1, opacity)
          }
        })

        // Rendu de la scène
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current)
        }
      }

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

    // Créer le globe terrestre
    const createGlobe = () => {
      if (!sceneRef.current) return

      // Charger la texture de la Terre
      const textureLoader = new THREE.TextureLoader()
      const earthTexture = textureLoader.load("/earth-texture.jpg", () => {
        // Fallback si la texture ne se charge pas
        earthTexture.image.onerror = () => {
          // Créer une texture de remplacement
          const canvas = document.createElement("canvas")
          canvas.width = 1024
          canvas.height = 512
          const ctx = canvas.getContext("2d")
          if (ctx) {
            // Dessiner un fond bleu
            ctx.fillStyle = `hsl(210, 70%, 50%)`
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Dessiner des continents simplifiés
            ctx.fillStyle = `hsl(120, 60%, 40%)`
            // Amérique du Nord
            ctx.fillRect(200, 100, 150, 100)
            // Amérique du Sud
            ctx.fillRect(300, 250, 100, 150)
            // Europe et Afrique
            ctx.fillRect(450, 100, 150, 200)
            // Asie
            ctx.fillRect(600, 100, 200, 150)
            // Australie
            ctx.fillRect(700, 300, 100, 80)

            // Mettre à jour la texture
            earthTexture.needsUpdate = true
          }
        }
      })

      // Créer la géométrie du globe
      const geometry = new THREE.SphereGeometry(2, 64, 64)

      // Créer le matériau du globe
      const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpScale: 0.05,
        specular: new THREE.Color("grey"),
        shininess: 5,
      })

      // Créer le maillage du globe
      const globe = new THREE.Mesh(geometry, material)
      sceneRef.current.add(globe)
      globeRef.current = globe

      // Ajouter une lumière ambiante
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      sceneRef.current.add(ambientLight)

      // Ajouter une lumière directionnelle
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 3, 5)
      sceneRef.current.add(directionalLight)

      // Ajouter une atmosphère
      const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64)
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(`hsl(${primaryHue}, 70%, 60%)`),
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
      })
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
      sceneRef.current.add(atmosphere)
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
      })

      const starsVertices = []
      for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 100
        const y = (Math.random() - 0.5) * 100
        const z = (Math.random() - 0.5) * 100

        // S'assurer que les étoiles sont loin du globe
        const distance = Math.sqrt(x * x + y * y + z * z)
        if (distance > 20) {
          starsVertices.push(x, y, z)
        }
      }

      starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3))
      const stars = new THREE.Points(starsGeometry, starsMaterial)
      sceneRef.current.add(stars)
    }

    // Convertir les coordonnées lat/lng en position 3D
    const latLngToVector3 = (lat: number, lng: number, radius = 2) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)

      const x = -radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)

      return new THREE.Vector3(x, y, z)
    }

    // Créer les marqueurs pour les villes
    const createMarkers = () => {
      if (!sceneRef.current) return

      const markersGroup = new THREE.Group()

      locations.forEach((location, index) => {
        // Créer un marqueur pour chaque ville
        const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16)
        const markerMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(location.color),
          transparent: true,
          opacity: 0.8,
        })

        const marker = new THREE.Mesh(markerGeometry, markerMaterial)
        const position = latLngToVector3(location.lat, location.lng)
        marker.position.copy(position)

        // Ajouter un halo autour du marqueur
        const haloGeometry = new THREE.SphereGeometry(0.08, 16, 16)
        const haloMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(location.color),
          transparent: true,
          opacity: 0.3,
          side: THREE.BackSide,
        })

        const halo = new THREE.Mesh(haloGeometry, haloMaterial)
        marker.add(halo)

        // Ajouter le marqueur au groupe
        markersGroup.add(marker)
      })

      sceneRef.current.add(markersGroup)
      markersRef.current = markersGroup
    }

    // Créer les connexions entre les villes
    const createConnections = () => {
      if (!sceneRef.current) return

      const connections: THREE.Line[] = []

      // Créer des connexions entre toutes les villes (plus de connexions)
      for (let i = 0; i < locations.length; i++) {
        for (let j = i + 1; j < locations.length; j++) {
          // Augmenter la probabilité de connexion pour avoir plus de lignes
          if (Math.random() > 0.3) continue

          const startPosition = latLngToVector3(locations[i].lat, locations[i].lng)
          const endPosition = latLngToVector3(locations[j].lat, locations[j].lng)

          // Créer une courbe pour la connexion
          const curvePoints = []
          for (let t = 0; t <= 20; t++) {
            const segment = t / 20

            // Calculer un point intermédiaire qui s'élève au-dessus de la surface
            const interpolatedX = startPosition.x + (endPosition.x - startPosition.x) * segment
            const interpolatedY = startPosition.y + (endPosition.y - startPosition.y) * segment
            const interpolatedZ = startPosition.z + (endPosition.z - startPosition.z) * segment

            // Normaliser pour obtenir un point sur la sphère
            const normal = new THREE.Vector3(interpolatedX, interpolatedY, interpolatedZ).normalize()

            // Élever le point au-dessus de la surface (effet d'arc)
            const midHeight = 1 - Math.abs(segment - 0.5) * 2 // 0->1->0
            const elevationFactor = 0.2 // Hauteur de l'arc
            const elevated = normal.clone().multiplyScalar(2 + midHeight * elevationFactor)

            curvePoints.push(elevated)
          }

          // Créer la géométrie de la courbe
          const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints)

          // Créer le matériau de la ligne
          const lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(`hsl(${(primaryHue + (i + j) * 20) % 360}, 70%, 60%)`),
            transparent: true,
            opacity: 0.5,
            linewidth: 1,
          })

          // Créer la ligne
          const line = new THREE.Line(curveGeometry, lineMaterial)
          sceneRef.current.add(line)
          connections.push(line)
        }
      }

      connectionsRef.current = connections
    }

    // Ajouter cette fonction dans le useEffect pour détecter les appareils mobiles
    const isMobile = window.innerWidth < 768

    // Ajuster les paramètres en fonction de l'appareil
    if (isMobile) {
      // Réduire la complexité sur mobile
      if (globeRef.current) {
        const geometry = new THREE.SphereGeometry(2, 32, 32) // Moins de segments
        globeRef.current.geometry = geometry
      }

      // Limiter le nombre de connexions sur mobile
      connectionsRef.current.forEach((connection, index) => {
        if (index % 2 === 0) {
          // Garder seulement la moitié des connexions
          connection.visible = false
        }
      })

      // Ajuster les contrôles pour une meilleure expérience tactile
      if (controlsRef.current) {
        controlsRef.current.rotateSpeed = 0.3
        controlsRef.current.enableZoom = false // Désactiver le zoom sur mobile
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
    // Mettre à jour les couleurs des connexions
    connectionsRef.current.forEach((line, index) => {
      if (line.material instanceof THREE.LineBasicMaterial) {
        line.material.color.set(new THREE.Color(`hsl(${(primaryHue + index * 20) % 360}, 70%, 60%)`))
      }
    })

    // Mettre à jour les couleurs des marqueurs
    if (markersRef.current) {
      markersRef.current.children.forEach((marker, index) => {
        if (marker instanceof THREE.Mesh && marker.material instanceof THREE.MeshBasicMaterial) {
          marker.material.color.set(new THREE.Color(`hsl(${(primaryHue + index * 20) % 360}, 70%, 60%)`))

          // Mettre à jour également le halo
          if (
            marker.children[0] instanceof THREE.Mesh &&
            marker.children[0].material instanceof THREE.MeshBasicMaterial
          ) {
            marker.children[0].material.color.set(new THREE.Color(`hsl(${(primaryHue + index * 20) % 360}, 70%, 60%)`))
          }
        }
      })
    }
  }, [primaryHue])

  if (!isMounted) return null

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  )
}
