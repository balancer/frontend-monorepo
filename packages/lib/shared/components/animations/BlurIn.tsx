'use client'

import { Box } from '@chakra-ui/react'
import { motion, useInView } from 'framer-motion'
import { ReactNode, useRef } from 'react'

const MotionBox = motion(Box)

export function BlurIn({
  children,
  delay = 0,
  duration = 0.5,
}: {
  children: ReactNode
  delay?: number
  duration?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <MotionBox
      animate={isInView ? { filter: 'blur(0px)', opacity: 1 } : {}}
      initial={{ filter: 'blur(20px)', opacity: 0 }}
      ref={ref}
      transition={{ duration, delay }}
    >
      {children}
    </MotionBox>
  )
}
