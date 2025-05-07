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
  ...rest
}: {
  text: string
  delay?: number
  pr?: BoxProps['pr']
} & Omit<BoxProps, 'transition'>) {
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

  const isInView = useInView(ref, {
    once: true,
    amount: 0.3,
  })

  useEffect(() => {
    if (isInView && !shouldAnimate) {
      setShouldAnimate(true)
    }
  }, [isInView, shouldAnimate])

  return (
    <HStack justify="center" {...rest}>
      {splittedText.map((current, i) => {
        const motionProps = {
          animate: shouldAnimate ? 'animate' : '',
          custom: i,
          initial: 'initial',
          variants: pullupVariant,
          pr,
        } as any

        return (
          <MotionBox
             
            key={i}
            ref={i === 0 ? ref : undefined}
            {...motionProps}
          >
            {current === '' ? <span>&nbsp;</span> : current}
          </MotionBox>
        )
      })}
    </HStack>
  )
}
