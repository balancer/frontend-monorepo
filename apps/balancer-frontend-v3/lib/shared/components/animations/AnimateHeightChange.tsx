'use client'

import { StackProps, VStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { PropsWithChildren } from 'react'
import useMeasure from 'react-use-measure'

export function AnimateHeightChange({ children, ...rest }: PropsWithChildren & StackProps) {
  const [ref, { height }] = useMeasure()

  return (
    <motion.div animate={{ height: height || 'auto ' }}>
      <AnimatePresence initial={false} mode="wait">
        <VStack align="start" ref={ref} {...rest}>
          {children}
        </VStack>
      </AnimatePresence>
    </motion.div>
  )
}
