'use client'

import { Box, BoxProps } from '@chakra-ui/react'

export interface RadialPatternProps extends BoxProps {
  circleCount?: number
  size?: number | string
  innerSize?: number | string
  borderColor?: string
  borderWidth?: number | string
  maxOpacity?: number
  minOpacity?: number
  children?: React.ReactNode
}

export function RadialPattern({
  circleCount = 3,
  size = '300px',
  innerSize = '50px',
  borderColor = 'gray.200',
  borderWidth = '1px',
  maxOpacity = 1,
  minOpacity = 0.05,
  children,
  ...rest
}: RadialPatternProps) {
  const baseSize = typeof size === 'string' ? parseInt(size) : size
  const minSize = typeof innerSize === 'string' ? parseInt(innerSize) : innerSize

  const totalSizeDifference = baseSize - minSize
  const sizeDifference = totalSizeDifference / (circleCount - 1)
  const opacityStep = (maxOpacity - minOpacity) / (circleCount - 1)

  const renderCircles = () => {
    const circles = []

    for (let i = circleCount; i >= 1; i--) {
      const currentSize = `${baseSize - sizeDifference * (circleCount - i)}px`
      const currentOpacity = maxOpacity - opacityStep * (i - 1)
      const isInnermost = i === 1

      circles.push(
        <Box
          alignItems="center"
          borderRadius="50%"
          // eslint-disable-next-line max-len
          boxShadow="-3px -3px 15px 1px rgba(255, 255, 255, 0.2), inset 3px 3px 15px 1px rgba(0, 0, 0, 0.4), 3px 3px 15px 1px rgba(0, 0, 0, 0.4), inset -3px -3px 15px 1px rgba(255, 255, 255, 0.2)"
          display="flex"
          height={currentSize}
          justifyContent="center"
          key={i}
          left="50%"
          opacity={currentOpacity}
          position="absolute"
          top="50%"
          transform="translate(-50%, -50%)"
          width={currentSize}
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
      height={`${baseSize}px`}
      justifyContent="center"
      position="relative"
      width={`${baseSize}px`}
      {...rest}
    >
      {renderCircles()}
    </Box>
  )
}
