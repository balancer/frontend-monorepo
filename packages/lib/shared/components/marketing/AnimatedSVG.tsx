import { useRef, type JSX } from 'react'
import { Box, useToken } from '@chakra-ui/react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

export function AnimatedSVG(): JSX.Element {
  const [bgColor] = useToken('colors', ['background.level2'])
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const pathLength: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [0, 1])
  const pathD: MotionValue<string> = useTransform(
    scrollYProgress,
    [0, 1],
    ['M 0 0 C 71 0 58 0 100 0 Q 50 0 0 0 Z', 'M 0 0 C 70 2 58 22 100 0 Q 50 0 0 0 Z']
  )

  return (
    <Box h="400px" position="relative" ref={containerRef} w="100%">
      <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 10" width="100%">
        <motion.path d={pathD} fill={bgColor} strokeWidth={0.1} style={{ pathLength }} />
      </svg>
    </Box>
  )
}
