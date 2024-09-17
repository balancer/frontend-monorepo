import { Box, BoxProps, CardProps, chakra, useColorModeValue } from '@chakra-ui/react'
import { ReactNode, MouseEvent } from 'react'
import { motion, useMotionTemplate, useMotionValue, isValidMotionProp } from 'framer-motion'

type NoisyCardProps = {
  cardProps?: CardProps
  contentProps?: BoxProps
  shadowContainerProps?: BoxProps
  children?: ReactNode | ReactNode[]
}

const MotionBox = chakra(motion.div, {
  shouldForwardProp: prop => isValidMotionProp(prop) || prop === 'children',
})

export function NoisyCard({
  children,
  cardProps = {},
  contentProps = {},
  shadowContainerProps = {},
}: NoisyCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const gradientColor = useColorModeValue(
    'rgba(255, 255, 255, 0.4)', // Light mode color
    'rgba(255, 255, 255, 0.03)' // Dark mode color
  )

  const gradient = useMotionTemplate`
    radial-gradient(
      200px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 80%
    )
  `

  return (
    <Box
      as={motion.div}
      backgroundImage={`url('/images/background-noise.png')`}
      borderWidth={0}
      onMouseMove={handleMouseMove}
      position="relative"
      rounded="sm"
      width="full"
      {...cardProps}
      role="group"
    >
      <MotionBox
        _groupHover={{ opacity: 1 }}
        borderRadius="xl"
        inset="-1px"
        opacity="0"
        position="absolute"
        style={{
          background: gradient,
        }}
        transition="opacity 300ms"
        zIndex="0"
      />
      <Box
        content=""
        height="full"
        position="absolute"
        shadow="innerXl"
        width="full"
        {...shadowContainerProps}
      />
      <Box
        backgroundColor="background.level0WithOpacity"
        height="full"
        width="full"
        {...contentProps}
      >
        {children}
      </Box>
    </Box>
  )
}
