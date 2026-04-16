import { Box, BoxProps } from '@chakra-ui/react'

export interface StaticRadialPatternProps extends BoxProps {
  circleCount?: number
  width?: number
  height?: number
  innerWidth?: number
  innerHeight?: number
  maxOpacity?: number
  minOpacity?: number
  intensity?: number
}

export function StaticRadialPattern({
  circleCount = 3,
  width = 300,
  height = 300,
  innerWidth = 50,
  innerHeight = 50,
  maxOpacity = 1,
  minOpacity = 0.05,
  intensity = 1,
  ...rest
}: StaticRadialPatternProps) {
  const baseWidth = typeof width === 'string' ? parseInt(width) : width
  const baseHeight = typeof height === 'string' ? parseInt(height) : height
  const minWidth = typeof innerWidth === 'string' ? parseInt(innerWidth) : innerWidth
  const minHeight = typeof innerHeight === 'string' ? parseInt(innerHeight) : innerHeight

  const totalWidthDifference = baseWidth - minWidth
  const totalHeightDifference = baseHeight - minHeight
  const widthDifference = totalWidthDifference / (circleCount - 1)
  const heightDifference = totalHeightDifference / (circleCount - 1)
  const opacityStep = (maxOpacity - minOpacity) / (circleCount - 1)

  // Always use dark mode values (app defaults to dark)
  const shadowBlackOpacity = intensity * 0.3
  const shadowWhiteOpacity = intensity * 0.1

  const circles = []
  for (let i = circleCount; i >= 1; i--) {
    const currentWidth = baseWidth - widthDifference * (circleCount - i)
    const currentHeight = baseHeight - heightDifference * (circleCount - i)
    const currentOpacity = maxOpacity - opacityStep * (i - 1)
    const borderRadius = Math.max(currentHeight, currentWidth) / 2

    circles.push(
      <Box
        key={i}
        alignItems="center"
        borderRadius={`${borderRadius}px`}
        boxShadow={`-3px -3px 15px 1px rgba(255, 255, 255, ${shadowWhiteOpacity}), inset 3px 3px 15px 1px rgba(0, 0, 0, ${shadowBlackOpacity}), 3px 3px 15px 1px rgba(0, 0, 0, ${shadowBlackOpacity}), inset -3px -3px 15px 1px rgba(255, 255, 255, ${shadowWhiteOpacity})`}
        display="flex"
        height={`${currentHeight}px`}
        justifyContent="center"
        left="50%"
        opacity={currentOpacity}
        position="absolute"
        top="50%"
        transform="translate(-50%, -50%)"
        width={`${currentWidth}px`}
      />
    )
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
      {circles}
    </Box>
  )
}
