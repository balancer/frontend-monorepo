import { Box, SystemStyleObject } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import React from 'react'

const shineAnimation = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: -200% 0; }
`

interface TextShineProps {
  children: React.ReactNode
  className?: string
  sx?: SystemStyleObject
  animationDuration?: string
  animationDelay?: string
  animationTimingFunction?: string
  animationFillMode?: 'both' | 'forwards' | 'backwards' | 'none'
  animationIterationCount?: string
  gradient?: string
  color?: string
  fontSize?: string
  textAlign?: SystemStyleObject['textAlign']
}

export const TextShine: React.FC<TextShineProps> = ({
  children,
  className,
  sx = {},
  animationDuration = '2s',
  animationDelay = '0s',
  animationTimingFunction = 'ease-out',
  animationFillMode = 'both',
  color = 'font.primary',
  fontSize = 'md',
  animationIterationCount = '1',
  gradient = 'linear-gradient(110deg, font.primary 45%, font.opposite 55%, font.primary 65%)',
}) => {
  return (
    <Box
      as="span"
      color={'white'}
      fontSize={fontSize}
      className={className}
      sx={{
        display: 'inline-flex',
        animation: `${shineAnimation} ${animationDuration} ${animationDelay} ${animationTimingFunction} ${animationIterationCount} ${animationFillMode}`,
        backgroundImage: gradient,
        backgroundSize: '250% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'white',
        WebkitTextFillColor: 'transparent',
        lineHeight: 'shorter',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
