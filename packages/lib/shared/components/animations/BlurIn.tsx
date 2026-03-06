'use client'

import { Box, BoxProps } from '@chakra-ui/react'
import { motion, useInView, HTMLMotionProps } from 'framer-motion'
import { ReactNode, useRef } from 'react'

const MotionBox = motion<BoxProps>(Box)

export function BlurIn({
  children,
  delay = 0,
  duration = 0.5,
  ...rest
}: {
  children: ReactNode
  delay?: number
  duration?: number
} & Omit<BoxProps, 'transition'>) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const motionProps: HTMLMotionProps<'div'> = {
    animate: isInView ? { filter: 'blur(0px)', opacity: 1 } : {},
    initial: { filter: 'blur(20px)', opacity: 0 },
    transition: { duration, delay },
  }

  return (
    <MotionBox ref={ref} {...motionProps} {...(rest as any)}>
      {children}
    </MotionBox>
  )
}
