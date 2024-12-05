'use client'

import { HStack, Box, BoxProps } from '@chakra-ui/react'
import { motion, useInView } from 'framer-motion'
import * as React from 'react'
import { useEffect, useState } from 'react'

const MotionBox = motion(Box)

export function WordsPullUp({ text, ...rest }: { text: string } & BoxProps) {
  const splittedText = text.split(' ')
  const [shouldAnimate, setShouldAnimate] = useState(false)

  const pullupVariant = {
    initial: { y: 10, opacity: 0, willChange: 'transform, opacity' },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  }

  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView && !shouldAnimate) {
      setShouldAnimate(true)
    }
  }, [isInView, shouldAnimate])

  return (
    <HStack justify="center" {...rest}>
      {splittedText.map((current, i) => (
        <MotionBox
          animate={shouldAnimate ? 'animate' : ''}
          custom={i}
          initial="initial"
          key={i}
          pr="2"
          ref={ref}
          variants={pullupVariant}
        >
          {current == '' ? <span>&nbsp;</span> : current}
        </MotionBox>
      ))}
    </HStack>
  )
}
