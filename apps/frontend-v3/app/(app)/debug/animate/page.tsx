'use client'

import { useEffect, useRef } from 'react'
import { Box, Heading, Text, VStack, HStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import * as THREE from 'three'

function BallAnimation() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
    const frustumSize = 10
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    // Set up isometric view
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)

    // Create procedural sand texture
    const sandTextureSize = 256
    const sandCanvas = document.createElement('canvas')
    sandCanvas.width = sandTextureSize
    sandCanvas.height = sandTextureSize
    const ctx = sandCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#D2B48C' // Base sand color
      ctx.fillRect(0, 0, sandTextureSize, sandTextureSize)

      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * sandTextureSize
        const y = Math.random() * sandTextureSize
        const radius = Math.random() * 2 + 1
        const shade = Math.random() * 30 - 15

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${210 + shade}, ${180 + shade}, ${140 + shade})`
        ctx.fill()
      }
    }

    const sandTexture = new THREE.CanvasTexture(sandCanvas)
    sandTexture.wrapS = THREE.RepeatWrapping
    sandTexture.wrapT = THREE.RepeatWrapping
    sandTexture.repeat.set(5, 5)

    const planeGeometry = new THREE.PlaneGeometry(20, 20)
    const planeMaterial = new THREE.MeshStandardMaterial({ map: sandTexture, roughness: 0.8 })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -0.5
    scene.add(plane)

    // Create balls in Vesica Piscis pattern
    const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32)
    const ballMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3, metalness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.3, metalness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.3, metalness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 0.3, metalness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xff00ff, roughness: 0.3, metalness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0x00ffff, roughness: 0.3, metalness: 0.7 }),
    ]
    const balls: THREE.Mesh[] = []

    const radius = 1.5
    const centerX = 0
    const centerY = 0
    const angleStep = Math.PI / 3

    for (let i = 0; i < 6; i++) {
      const angle = i * angleStep
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      const ball = new THREE.Mesh(ballGeometry, ballMaterials[i])
      ball.position.set(x, 0, y)
      scene.add(ball)
      balls.push(ball)
    }

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 7)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xffffff, 0.5)
    pointLight.position.set(-5, 5, -5)
    scene.add(pointLight)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      balls.forEach((ball, index) => {
        const time = Date.now() * 0.001
        const angle = index * angleStep + time
        const x = centerX + radius * Math.cos(angle)
        const z = centerY + radius * Math.sin(angle)

        ball.position.x = x
        ball.position.z = z
        ball.position.y = Math.sin(time * 2 + index) * 0.2

        ball.rotation.x += 0.02
        ball.rotation.y += 0.02
      })

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return <Box height="300px" ref={mountRef} width="100%" />
}

function ParticleAnimation() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    camera.position.z = 5

    // Create particles
    const particleCount = 1000
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const radius = Math.random() * 2 + 1
      const angle = Math.random() * Math.PI * 2
      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = Math.sin(angle) * radius
      positions[i3 + 2] = 0

      const color = new THREE.Color(0xffffff)
      color.setHSL(Math.random(), 1, 0.5)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    scene.add(particleSystem)

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      const positions = particles.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        const x = positions[i3]
        const y = positions[i3 + 1]
        const angle = Math.atan2(y, x) + 0.01
        const radius = Math.sqrt(x * x + y * y)
        positions[i3] = Math.cos(angle) * radius
        positions[i3 + 1] = Math.sin(angle) * radius
      }
      particles.attributes.position.needsUpdate = true

      particleSystem.rotation.z += 0.001

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return <Box height="300px" ref={mountRef} width="100%" />
}

function Hero() {
  return (
    <VStack align="center" bg="gray.100" justify="center" minHeight="100vh" spacing={8}>
      <Heading as="h1" size="2xl" textAlign="center">
        3D Animations Showcase
      </Heading>
      <Text fontSize="xl" maxWidth="600px" textAlign="center">
        Experience the mesmerizing Vesica Piscis pattern and a colorful particle spiral!
      </Text>
      <HStack justifyContent="center" spacing={8} width="100%">
        <Box borderRadius="lg" boxShadow="xl" maxWidth="400px" overflow="hidden" width="45%">
          <BallAnimation />
        </Box>
        <Box borderRadius="lg" boxShadow="xl" maxWidth="400px" overflow="hidden" width="45%">
          <ParticleAnimation />
        </Box>
      </HStack>
    </VStack>
  )
}

export default function AnimatePage() {
  return (
    <DefaultPageContainer>
      <Hero />
    </DefaultPageContainer>
  )
}
