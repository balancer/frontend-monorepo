'use client'

import { StackProps, VStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { PropsWithChildren } from 'react'

export function AnimateHeightChange({ children, ...rest }: PropsWithChildren & StackProps) {
  return (
    <motion.div animate={{ height: 'auto' }}>
      <AnimatePresence initial={false} mode="wait">
        <VStack align="start" {...rest}>
          {children}
        </VStack>
      </AnimatePresence>
    </motion.div>
  )
}
