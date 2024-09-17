import React from 'react'
import { Box, Flex, FlexProps } from '@chakra-ui/react'
import { motion, MotionStyle, useAnimation, useReducedMotion } from 'framer-motion'

interface SandPatternsProps extends FlexProps {
  children: React.ReactNode
}

const SandPatterns: React.FC<SandPatternsProps> = ({ children, ...rest }) => {
  const circles = Array.from({ length: 10 }, (_, i) => i + 1)
  const controls = useAnimation()
  const shouldReduceMotion = useReducedMotion()

  const circleStyle: MotionStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: `1px solid var(--chakra-colors-input-borderDefault)`,
    backgroundColor: 'transparent',
    zIndex: '-10',
  }

  React.useEffect(() => {
    if (!shouldReduceMotion) {
      controls.start(i => {
        const calculatedWidth = 30 * (1 + 0.25 * i)
        return {
          width: [`${calculatedWidth}vw`],
          height: [`${calculatedWidth}vw`],
          borderRadius: ['10%', '50%', '10%'],
          opacity: 1 - i * 0.1,
          transition: {
            duration: 90,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 1.5,
            ease: 'easeOut',
          },
        }
      })
    }
  }, [controls, shouldReduceMotion])

  return (
    <Box position="relative" width="100%" height="100vh">
      {circles.map((_, index) => (
        <motion.div
          key={index}
          style={circleStyle}
          initial={{ width: 0, height: 0, borderRadius: 50 }}
          animate={controls}
          custom={index}
        />
      ))}
      <Flex
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        alignItems="center"
        justifyContent="center"
        zIndex={1}
        {...rest}
      >
        {children}
      </Flex>
    </Box>
  )
}

export default SandPatterns
