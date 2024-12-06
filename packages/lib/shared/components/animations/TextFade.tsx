'use client'

import { Box } from '@chakra-ui/react'
import { motion, useInView } from 'framer-motion'
import { Children, isValidElement, ReactNode, useRef } from 'react'

const MotionBox = motion(Box)

export function TextFade({
  direction,
  children,
  delay = 0,
  staggerChildren = 0.1,
  delayChildren = 0,
  duration = 0.5,
}: {
  direction: 'up' | 'down'
  children: ReactNode
  className?: string
  staggerChildren?: number
  delayChildren?: number
  delay?: number
  duration?: number
}) {
  const FADE_DOWN = {
    show: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { duration, ease: 'easeInOut' },
    },
    hidden: { opacity: 0, filter: 'blur(3px)', y: direction === 'down' ? -15 : 15 },
  }
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <MotionBox
      animate={isInView ? 'show' : ''}
      initial="hidden"
      ref={ref}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren,
            delay,
          },
        },
      }}
    >
      {Children.map(children, child =>
        isValidElement(child) ? <MotionBox variants={FADE_DOWN}>{child}</MotionBox> : child
      )}
    </MotionBox>
  )
}
