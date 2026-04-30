'use client'

import { Box, BoxProps } from '@chakra-ui/react'
import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from 'motion/react'
import { ReactNode, useEffect, useMemo, useRef } from 'react'

export interface RadialPatternProps extends BoxProps {
  circleCount?: number
  width?: number
  height?: number
  innerWidth?: number
  innerHeight?: number
  maxOpacity?: number
  minOpacity?: number
  intensity?: number
  progress?: number
  spotlight?: boolean
  pulse?: boolean
  children?: React.ReactNode
}

const MotionBox = motion(Box)

function Circle({
  progress,
  circleProgressStage,
  currentOpacity,
  currentHeight,
  currentWidth,
  borderRadius,
  shadowWhiteOpacity,
  shadowBlackOpacity,
  isInnermost,
  pulse,
  ringIndex,
  children,
}: {
  progress: number | undefined
  circleProgressStage: number
  currentOpacity: number
  currentHeight: string
  currentWidth: string
  borderRadius: number
  shadowWhiteOpacity: number
  shadowBlackOpacity: number
  isInnermost: boolean
  pulse: boolean
  ringIndex: number
  children: ReactNode
}) {
  const pulseSx = pulse
    ? {
        '--ring-opacity': currentOpacity.toString(),
        '@keyframes radialPulse': {
          '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
          '20%, 80%': { opacity: 'var(--ring-opacity)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.15)', opacity: 0 },
        },
        animation: 'radialPulse 20s linear infinite',
        animationDelay: `-${4 + ringIndex * 0.25}s`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }
    : undefined

  return (
    <MotionBox
      alignItems="center"
      animate={
        progress !== undefined
          ? {
              opacity: progress > circleProgressStage ? currentOpacity : 0,
            }
          : undefined
      }
      borderRadius={`${borderRadius}px`}
      boxShadow={`-3px -3px 15px 1px rgba(255, 255, 255, ${shadowWhiteOpacity}), inset 3px 3px 15px 1px rgba(0, 0, 0, ${shadowBlackOpacity}), 3px 3px 15px 1px rgba(0, 0, 0, ${shadowBlackOpacity}), inset -3px -3px 15px 1px rgba(255, 255, 255, ${shadowWhiteOpacity})`}
      display="flex"
      height={currentHeight}
      initial={progress !== undefined ? { opacity: 0 } : false}
      justifyContent="center"
      left="50%"
      opacity={progress !== undefined ? undefined : currentOpacity}
      position="absolute"
      sx={pulseSx}
      top="50%"
      transform="translate(-50%, -50%)"
      transition={
        progress !== undefined
          ? {
              duration: 0.5,
              ease: 'easeOut',
            }
          : undefined
      }
      width={currentWidth}
    >
      {isInnermost && children}
    </MotionBox>
  )
}

export function RadialPattern({
  circleCount = 3,
  width = 300,
  height = 300,
  innerWidth = 50,
  innerHeight = 50,
  maxOpacity = 1,
  minOpacity = 0.05,
  children,
  intensity = 1,
  progress,
  spotlight = false,
  pulse = false,
  ...rest
}: RadialPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(-9999)
  const mouseY = useMotionValue(-9999)

  useEffect(() => {
    if (!spotlight) return
    const onMove = (e: MouseEvent) => {
      const el = overlayRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      mouseX.set(e.clientX - r.left)
      mouseY.set(e.clientY - r.top)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [spotlight, mouseX, mouseY])

  const spotlightGradient = useMotionTemplate`radial-gradient(380px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.03), transparent 70%)`
  const baseWidth = typeof width === 'string' ? parseInt(width) : width
  const baseHeight = typeof height === 'string' ? parseInt(height) : height
  const minWidth = typeof innerWidth === 'string' ? parseInt(innerWidth) : innerWidth
  const minHeight = typeof innerHeight === 'string' ? parseInt(innerHeight) : innerHeight

  const totalWidthDifference = baseWidth - minWidth
  const totalHeightDifference = baseHeight - minHeight
  const widthDifference = totalWidthDifference / (circleCount - 1)
  const heightDifference = totalHeightDifference / (circleCount - 1)
  const opacityStep = (maxOpacity - minOpacity) / (circleCount - 1)

  const shadowBlackOpacity = intensity * 0.3
  const shadowWhiteOpacity = intensity * 0.1

  const circles = useMemo(() => {
    const circles = []
    for (let i = circleCount; i >= 1; i--) {
      const currentWidth = `${baseWidth - widthDifference * (circleCount - i)}px`
      const currentHeight = `${baseHeight - heightDifference * (circleCount - i)}px`
      circles.push({
        currentWidth,
        currentHeight,
        currentOpacity: maxOpacity - opacityStep * (i - 1),
        isInnermost: i === 1,
        borderRadius: Math.max(parseInt(currentHeight), parseInt(currentWidth)) / 2,
        circleProgressStage: (100 / circleCount) * (circleCount - i),
      })
    }
    return circles
  }, [
    circleCount,
    baseWidth,
    baseHeight,
    widthDifference,
    heightDifference,
    maxOpacity,
    opacityStep,
  ])

  return (
    <Box
      alignItems="center"
      display="flex"
      height={`${baseHeight}px`}
      justifyContent="center"
      position="relative"
      ref={containerRef}
      width={`${baseWidth}px`}
      {...rest}
    >
      <AnimatePresence>
        {circles.map((circle, i) => (
          <Circle
            key={i}
            progress={progress}
            pulse={pulse}
            ringIndex={i}
            shadowBlackOpacity={shadowBlackOpacity}
            shadowWhiteOpacity={shadowWhiteOpacity}
            {...circle}
          >
            {children}
          </Circle>
        ))}
      </AnimatePresence>
      {spotlight && (
        <MotionBox
          bottom="-100vh"
          left="-100vw"
          pointerEvents="none"
          position="absolute"
          ref={overlayRef}
          right="-100vw"
          style={{ background: spotlightGradient }}
          top="-100vh"
        />
      )}
    </Box>
  )
}
