/* eslint-disable max-len */
'use client'

import { Box, BoxProps } from '@chakra-ui/react'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'

export interface RadialPatternProps extends BoxProps {
  circleCount?: number
  width?: number
  height?: number
  innerWidth?: number
  innerHeight?: number
  maxOpacity?: number
  minOpacity?: number
  children?: React.ReactNode
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

  const renderCircles = () => {
    const circles = []

    for (let i = circleCount; i >= 1; i--) {
      const currentWidth = `${baseWidth - widthDifference * (circleCount - i)}px`
      const currentHeight = `${baseHeight - heightDifference * (circleCount - i)}px`
      const currentOpacity = maxOpacity - opacityStep * (i - 1)
      const isInnermost = i === 1
      const borderRadius = Math.max(parseInt(currentHeight), parseInt(currentWidth)) / 2

      const shadowBlackOpacity = isDarkMode ? 0.3 : 0.1
      const shadowWhiteOpacity = isDarkMode ? 0.1 : 0.3

      circles.push(
        <Box
          alignItems="center"
          borderRadius={`${borderRadius}px`}
          boxShadow={`-3px -3px 15px 1px rgba(255, 255, 255, ${shadowWhiteOpacity}), inset 3px 3px 15px 1px rgba(0, 0, 0, ${shadowBlackOpacity}), 3px 3px 15px 1px rgba(0, 0, 0, ${shadowBlackOpacity}), inset -3px -3px 15px 1px rgba(255, 255, 255, ${shadowWhiteOpacity})`}
          display="flex"
          height={currentHeight}
          justifyContent="center"
          key={i}
          left="50%"
          opacity={currentOpacity}
          position="absolute"
          top="50%"
          transform="translate(-50%, -50%)"
          width={currentWidth}
        >
          {isInnermost && children}
        </Box>
      )
    }

    return circles
  }

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
      {renderCircles()}
    </Box>
  )
}
