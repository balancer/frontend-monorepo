'use client'

import { Heading } from '@chakra-ui/react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { LettersPullUp } from './LettersPullUp'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { is } from 'date-fns/locale'

const words = [
  { word: 'DeFi', color: '#457dff' },
  { word: 'AMMs', color: '#00d395' },
  { word: 'hooks', color: '#f97316' },
  { word: 'a DEX', color: '#F06147' },
  { word: 'LBPs', color: '#F06147' },
  { word: 'custom pools', color: '#ea6249' },
]

export function Title() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [widths, setWidths] = useState<Record<string, number>>({})
  const measureRef = useRef<HTMLSpanElement>(null)
  const { isMobile } = useBreakpoints()

  // Measure all words once on mount
  useEffect(() => {
    if (measureRef.current) {
      const newWidths: Record<string, number> = {}
      words.forEach(({ word }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        measureRef.current!.textContent = word
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex])

  return (
    <>
      <Heading
        alignItems="center"
        as="h1"
        display="flex"
        justifyContent="center"
        size={{ base: 'xl', md: '3xl' }}
        textAlign="center"
      >
        Build{' '}
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
                  <LettersPullUp initialColor={color} key={word} text={word} />
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
        {!isMobile && <> on Balancer V3</>}
      </Heading>
      {isMobile && (
        <Heading
          justifyContent="center"
          mt="-4"
          size={{ base: 'xl', md: '3xl' }}
          textAlign="center"
        >
          on Balancer V3
        </Heading>
      )}
    </>
  )
}
