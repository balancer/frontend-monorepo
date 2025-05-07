'use client'

import { Box, BoxProps } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { ReactNode, useMemo } from 'react'

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
  children: ReactNode
}) {
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
  ...rest
}: RadialPatternProps) {
  const isDarkMode = useIsDarkMode()
  const baseWidth = typeof width === 'string' ? parseInt(width) : width
  const baseHeight = typeof height === 'string' ? parseInt(height) : height
  const minWidth = typeof innerWidth === 'string' ? parseInt(innerWidth) : innerWidth
  const minHeight = typeof innerHeight === 'string' ? parseInt(innerHeight) : innerHeight

  const totalWidthDifference = baseWidth - minWidth
  const totalHeightDifference = baseHeight - minHeight
  const widthDifference = totalWidthDifference / (circleCount - 1)
  const heightDifference = totalHeightDifference / (circleCount - 1)
  const opacityStep = (maxOpacity - minOpacity) / (circleCount - 1)

  const shadowBlackOpacity = isDarkMode ? intensity * 0.3 : intensity * 0.1
  const shadowWhiteOpacity = isDarkMode ? intensity * 0.1 : intensity * 0.3

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
      width={`${baseWidth}px`}
      {...rest}
    >
      <AnimatePresence>
        {circles.map((circle, i) => (
          <Circle
             
            key={i}
            progress={progress}
            shadowBlackOpacity={shadowBlackOpacity}
            shadowWhiteOpacity={shadowWhiteOpacity}
            {...circle}
          >
            {children}
          </Circle>
        ))}
      </AnimatePresence>
    </Box>
  )
}
