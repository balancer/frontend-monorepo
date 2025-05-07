'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'
import { motion, useInView } from 'framer-motion'
import * as React from 'react'

export function LettersPullUp({
  text,
  initialColor = '#457dff',
  finalColorLight = '#000000',
  finalColorDark = '#ffffff',
}: {
  text: string
  initialColor?: string
  finalColorLight?: string
  finalColorDark?: string
}) {
  const splittedText = text.split('')
  const finalColor = useColorModeValue(finalColorLight, finalColorDark)

  const pullupVariant = {
    initial: { y: -20, x: -10, opacity: 0, color: initialColor, filter: 'blur(10px)' },
    animate: (i: number) => ({
      y: 0,
      x: 0,
      opacity: 1,
      color: finalColor,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.07,
        color: {
          duration: 1.5,
        },
        filter: {
          duration: 1,
        },
      },
    }),
  }

  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <Box display="flex" justifyContent="center">
      {splittedText.map((letter, i) => (
        <motion.div
          animate={isInView ? 'animate' : ''}
          custom={i}
          initial="initial"
           
          key={`${i}-${letter}`}
          layout
          ref={ref}
          style={{
            color: initialColor,
          }}
          variants={pullupVariant}
        >
          {letter == ' ' ? <span>&nbsp;</span> : letter}
        </motion.div>
      ))}
    </Box>
  )
}
