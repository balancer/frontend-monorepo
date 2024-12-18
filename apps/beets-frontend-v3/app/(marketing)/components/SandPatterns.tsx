import React, { PropsWithChildren } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { motion, MotionStyle, useAnimation, useReducedMotion } from 'framer-motion'

function SandPatterns({ children, ...rest }: PropsWithChildren) {
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
    <Box height="100vh" position="relative" width="100%">
      {circles.map(circleNum => (
        <motion.div
          animate={controls}
          custom={circleNum - 1} // Keep the same index for animation
          initial={{ width: 0, height: 0, borderRadius: 50 }}
          key={`circle-${circleNum}`}
          style={circleStyle}
        />
      ))}
      <Flex
        alignItems="center"
        bottom="0"
        justifyContent="center"
        left="0"
        position="absolute"
        right="0"
        top="0"
        zIndex={1}
        {...rest}
      >
        {children}
      </Flex>
    </Box>
  )
}

export default SandPatterns
