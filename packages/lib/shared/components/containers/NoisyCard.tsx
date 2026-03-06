import { Box, BoxProps, CardProps, chakra } from '@chakra-ui/react'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { ReactNode, MouseEvent } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'

type NoisyCardProps = {
  cardProps?: CardProps
  contentProps?: BoxProps
  shadowContainerProps?: BoxProps
  children?: ReactNode | ReactNode[]
}

const MotionBox = chakra(motion.div)

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

  const colorMode = useThemeColorMode()
  const gradientColor =
    colorMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.4)'

  const gradient = useMotionTemplate`
    radial-gradient(
      200px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 80%
    )
  `

  return (
    <Box
      backgroundImage={`url('/images/background-noise.png')`}
      borderWidth={0}
      position="relative"
      rounded="sm"
      width="full"
      {...cardProps}
      asChild
      role="group"
    >
      <motion.div onMouseMove={handleMouseMove}>
        <MotionBox
          _groupHover={{ opacity: 1 }}
          borderRadius="xl"
          h="full"
          inset="-1px"
          opacity="0"
          pointerEvents="none"
          position="absolute"
          style={{
            background: gradient,
          }}
          transition="opacity 300ms"
          w="full"
          zIndex="0"
        />
        <Box
          content=""
          height="full"
          pointerEvents="none"
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
      </motion.div>
    </Box>
  )
}
