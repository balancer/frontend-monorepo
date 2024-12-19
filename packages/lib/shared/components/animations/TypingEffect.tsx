'use client'

import { chakra, TextProps } from '@chakra-ui/react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const MotionSpan = motion(chakra.span)

export function TypingEffect({
  text = 'Typing Effect',
  initDelay = 0,
  delay = 0.03,
  duration = 0.1,
  ...rest
}: {
  text: string
  initDelay?: number
  delay?: number
  duration?: number
} & TextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <chakra.span ref={ref} {...rest}>
      {text.split('').map((letter, index) => (
        <MotionSpan
          animate={isInView ? { opacity: 1 } : {}}
          initial={{ opacity: 0 }}
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          transition={{ duration, delay: initDelay + index * delay }}
        >
          {letter}
        </MotionSpan>
      ))}
    </chakra.span>
  )
}
