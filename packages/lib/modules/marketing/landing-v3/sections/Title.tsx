'use client'

import { Heading } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

const buildWords = ['AMMs', 'custom pools', 'hooks', 'a DEX']

export function Title() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [widths, setWidths] = useState<Record<string, number>>({})
  const measureRef = useRef<HTMLSpanElement>(null)

  // Measure all words once on mount
  useEffect(() => {
    if (measureRef.current) {
      const newWidths: Record<string, number> = {}
      buildWords.forEach(word => {
        measureRef.current!.textContent = word
        newWidths[word] = measureRef.current!.offsetWidth + 20
      })
      setWidths(newWidths)
    }
  }, [])

  useEffect(() => {
    const wordInterval = setInterval(() => {
      const nextIndex = currentWordIndex === buildWords.length - 1 ? 0 : currentWordIndex + 1
      setCurrentWordIndex(nextIndex)
    }, 5000)

    return () => clearInterval(wordInterval)
  }, [currentWordIndex])

  return (
    <Heading alignItems="center" as="h1" display="flex" justifyContent="center" size="2xl">
      Build{' '}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          animate={{
            width: widths[buildWords[currentWordIndex]] || 'auto',
          }}
          key="width"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {buildWords.map(
            word =>
              buildWords[currentWordIndex] === word && (
                <motion.span
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key={word}
                  style={{
                    marginLeft: '10px',
                    marginRight: '10px',
                    whiteSpace: 'nowrap',
                    color: 'red',
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {word}
                </motion.span>
              )
          )}
        </motion.div>
      </AnimatePresence>
      {/* Hidden measurement element */}
      <span
        ref={measureRef}
        style={{
          visibility: 'hidden',
          position: 'absolute',
          whiteSpace: 'nowrap',
        }}
      />{' '}
      on Balancer V3
    </Heading>
  )
}
