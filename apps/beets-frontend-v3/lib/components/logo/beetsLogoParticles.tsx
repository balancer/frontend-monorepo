'use client'

import { useRef, useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { drawBeetsLogo } from './beetsLogoPath'

export function BeetsLogoParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const fadeProgressRef = useRef(0)
  const fadeAnimationRef = useRef<number | null>(null)
  const isReadyRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setIsMobile(window.innerWidth < 768)
    }

    updateCanvasSize()

    let particles: {
      x: number
      y: number
      baseX: number
      baseY: number
      size: number
      baseSize: number
      color: string
      life: number
      colorType: 'white' | 'green' | 'red' | 'dark'
    }[] = []

    let textImageData: ImageData | null = null

    function createTextImage() {
      if (!ctx || !canvas) return 0

      ctx.fillStyle = 'white'
      ctx.save()

      // Make logo fit screen height with some padding
      const logoSize = Math.min(canvas.height * 0.8, canvas.width * 0.8)
      ctx.translate(canvas.width / 2 - logoSize / 2, canvas.height / 2 - logoSize / 2)
      drawBeetsLogo(ctx, logoSize, logoSize)
      ctx.restore()

      textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      return 1
    }

    function createParticle() {
      if (!ctx || !canvas || !textImageData) return null

      const data = textImageData.data

      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width)
        const y = Math.floor(Math.random() * canvas.height)

        if (data[(y * canvas.width + x) * 4 + 3] > 128) {
          const r = data[(y * canvas.width + x) * 4]
          const g = data[(y * canvas.width + x) * 4 + 1]
          const b = data[(y * canvas.width + x) * 4 + 2]

          let particleColor = 'rgba(255, 255, 255, 0.33)'
          let colorType: 'white' | 'green' | 'red' | 'dark' = 'white'

          if (g > 200 && r < 100 && b < 200) {
            particleColor = 'rgba(5, 214, 144, 0.4)'
            colorType = 'green'
          } else if (r > 200 && g < 100 && b < 100) {
            particleColor = 'rgba(255, 0, 0, 0.4)'
            colorType = 'red'
          } else if (r < 50 && g < 50 && b < 50) {
            particleColor = 'rgba(26, 26, 26, 0.33)'
            colorType = 'dark'
          } else {
            particleColor = 'rgba(255, 255, 255, 0.33)'
            colorType = 'white'
          }

          const baseSize = Math.random() * 1.5 + 0.5

          return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: baseSize,
            baseSize: baseSize,
            color: particleColor,
            colorType: colorType,
            life: Math.random() * 100 + 50,
          }
        }
      }

      return null
    }

    function createInitialParticles() {
      if (!canvas) return
      const baseParticleCount = 10000 // Keep high count for good definition
      const particleCount = Math.floor(
        baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080))
      )
      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle()
        if (particle) particles.push(particle)
      }
    }

    // Fade in animation
    function startFadeIn() {
      const startTime = Date.now()
      const duration = 5000 // 5 second fade in

      function updateFade() {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Smooth ease-in-out curve
        fadeProgressRef.current =
          progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

        if (progress < 1) {
          fadeAnimationRef.current = requestAnimationFrame(updateFade)
        } else {
          fadeProgressRef.current = 1
          fadeAnimationRef.current = null
        }
      }

      fadeAnimationRef.current = requestAnimationFrame(updateFade)
    }

    let animationFrameId: number

    function animate(scale: number) {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Apply fade effect to entire canvas
      ctx.globalAlpha = fadeProgressRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // No transformations - particles stay in their original positions
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size)

        p.life--
        if (p.life <= 0) {
          const newParticle = createParticle()
          if (newParticle) {
            particles[i] = newParticle
          } else {
            particles.splice(i, 1)
            i--
          }
        }
      }

      ctx.globalAlpha = 1 // Reset global alpha

      animationFrameId = requestAnimationFrame(() => animate(scale))
    }

    // Initialize everything
    const scale = createTextImage()
    createInitialParticles()

    // Mark as ready and start fade in
    isReadyRef.current = true
    startFadeIn()

    animate(scale)

    const handleResize = () => {
      updateCanvasSize()
      particles = []
      createInitialParticles()

      // If we were already ready, restart fade in
      if (isReadyRef.current) {
        fadeProgressRef.current = 0
        if (fadeAnimationRef.current) {
          cancelAnimationFrame(fadeAnimationRef.current)
        }
        startFadeIn()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (fadeAnimationRef.current) {
        cancelAnimationFrame(fadeAnimationRef.current)
      }
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  return (
    <Box h="100vh" left={0} pointerEvents="none" position="fixed" top={0} w="100vw" zIndex={-1}>
      <canvas
        aria-label="Static particle background logo with fade in effect"
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  )
}
