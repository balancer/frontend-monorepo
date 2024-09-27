import { Box } from '@chakra-ui/react'
import { useRef, ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxImageProps {
  children: ReactNode
  scaleStart?: string
  scaleEnd?: string
  yStart?: string
  yEnd?: string
  transformOrigin?: string
  overflow?: string
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({
  children,
  scaleStart = '90%',
  scaleEnd = '110%',
  yStart = '-20%',
  yEnd = '20%',
  transformOrigin = 'bottom',
  overflow = 'hidden',
}) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [yStart, yEnd])
  const scale = useTransform(scrollYProgress, [0, 1], [scaleStart, scaleEnd])

  return (
    <Box overflow={overflow} position="relative" h="100%">
      <div ref={ref}>
        <Box as={motion.div} style={{ y, scale, transformOrigin }}>
          {children}
        </Box>
      </div>
    </Box>
  )
}
