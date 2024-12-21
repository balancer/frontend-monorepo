'use client'

import { HStack, Box, BoxProps } from '@chakra-ui/react'
import { motion, useInView } from 'framer-motion'
import * as React from 'react'
import { useEffect, useState } from 'react'

const MotionBox = motion(Box)

export function WordsPullUp({
  text,
  delay = 0,
  pr = '0.9',
  animateMargin = '-50px',
  ...rest
}: { text: string; delay?: number; pr?: BoxProps['pr']; animateMargin?: string } & BoxProps) {
  const splittedText = text.split(' ')
  const [shouldAnimate, setShouldAnimate] = useState(false)

  const pullupVariant = {
    initial: { y: 10, opacity: 0, filter: 'blur(3px)', willChange: 'transform, opacity, filter' },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: delay + i * 0.1,
        duration: 1,
      },
    }),
  }

  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: animateMargin })

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
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          pr={pr}
          ref={ref}
          variants={pullupVariant}
        >
          {current == '' ? <span>&nbsp;</span> : current}
        </MotionBox>
      ))}
    </HStack>
  )
}
