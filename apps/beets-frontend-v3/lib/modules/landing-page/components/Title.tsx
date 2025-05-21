'use client'

import { Box, BoxProps, Heading } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { LettersPullUp } from '@repo/lib/shared/components/animations/LettersPullUp'

const words = [
  { word: 'DeFi', color: '#457dff' },
  { word: 'Staking', color: '#00d395' },
  { word: 'Yield', color: '#f97316' },
  //{ word: 'Growth', color: '#F06147' },
]

export function Title({ ...rest }: BoxProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [widths, setWidths] = useState<Record<string, number>>({})
  const measureRef = useRef<HTMLSpanElement>(null)
  const { isMobile } = useBreakpoints()

  // Measure all words once on mount
  useEffect(() => {
    if (measureRef.current) {
      const newWidths: Record<string, number> = {}
      words.forEach(({ word }) => {
        measureRef.current!.textContent = word
        newWidths[word] = measureRef.current!.offsetWidth + 20
      })
      setWidths(newWidths)
    }
  }, [])

  useEffect(() => {
    const wordInterval = setInterval(() => {
      const nextIndex = currentWordIndex === words.length - 1 ? 0 : currentWordIndex + 1
      setCurrentWordIndex(nextIndex)
    }, 5000)

    return () => clearInterval(wordInterval)
  }, [currentWordIndex])

  return (
    <Box textAlign="center" {...rest}>
      <Heading
        alignItems="center"
        as="h1"
        display="flex"
        justifyContent="center"
        pb="sm"
        size={{ base: '2xl', md: '3xl' }}
        textAlign="center"
      >
        Powering{' '}
        <AnimatePresence mode="wait">
          <motion.div
            animate={{
              width: widths[words[currentWordIndex].word] || 'auto',
            }}
            key="width"
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 15,
              mass: 1,
            }}
          >
            {words.map(
              ({ word, color }) =>
                words[currentWordIndex].word === word && (
                  <LettersPullUp
                    finalColorDark="#ffffff"
                    finalColorLight="#ffffff"
                    initialColor={color}
                    key={word}
                    text={word}
                  />
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
        />
        {!isMobile && <> on Sonic</>}
      </Heading>
      {isMobile && (
        <Heading
          justifyContent="center"
          mx="auto"
          size={{ base: '2xl', md: '3xl' }}
          textAlign="center"
        >
          on Sonic
        </Heading>
      )}
    </Box>
  )
}
