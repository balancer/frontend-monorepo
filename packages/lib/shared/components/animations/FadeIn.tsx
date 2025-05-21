'use client'

import { Box, BoxProps } from '@chakra-ui/react'
import { motion, useInView, HTMLMotionProps } from 'framer-motion'
import { Children, isValidElement, ReactNode, useRef } from 'react'

const MotionBox = motion<BoxProps>(Box)

export function FadeIn({
  direction,
  children,
  delay = 0,
  staggerChildren = 0.1,
  delayChildren = 0,
  duration = 0.5,
  ...rest
}: {
  direction: 'up' | 'down'
  children: ReactNode
  className?: string
  staggerChildren?: number
  delayChildren?: number
  delay?: number
  duration?: number
} & Omit<BoxProps, 'transition'>) {
  const FADE_DOWN = {
    show: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { duration, delay, ease: 'easeInOut' },
    },
    hidden: { opacity: 0, filter: 'blur(3px)', y: direction === 'down' ? -15 : 15 },
  }
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const motionProps: HTMLMotionProps<'div'> = {
    animate: isInView ? 'show' : '',
    initial: 'hidden',
    variants: {
      hidden: {},
      show: {
        transition: {
          staggerChildren,
          delayChildren,
          delay,
        },
      },
    },
  }

  return (
    <MotionBox ref={ref} {...motionProps} {...(rest as any)}>
      {Children.map(children, child =>
        isValidElement(child) ? <MotionBox variants={FADE_DOWN}>{child}</MotionBox> : child
      )}
    </MotionBox>
  )
}
