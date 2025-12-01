'use client'

import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react'
import { useRef, useState, useLayoutEffect } from 'react'
import { useReliquary } from '../ReliquaryProvider'
import { RelicCard } from './RelicCard'
import { ChevronLeft, ChevronRight } from 'react-feather'

export function RelicCarousel() {
  const { relicPositions: relics } = useReliquary()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [allRelicsVisible, setAllRelicsVisible] = useState(false)

  const relicPositions = [...relics, ...relics]
  useLayoutEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const checkOverflow = () => {
      setAllRelicsVisible(el.scrollWidth <= el.clientWidth)
    }

    // Run once on mount
    checkOverflow()

    // Listen for window resize
    window.addEventListener('resize', checkOverflow)

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', checkOverflow)
  }, [relicPositions])

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cards = scrollContainerRef.current.querySelectorAll('[data-relic-card]')
      const targetCard = cards[index] as HTMLElement
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }

  const scrollToNext = () => {
    const nextIndex = Math.min(selectedIndex + 1, relicPositions.length - 1)
    setSelectedIndex(nextIndex)
    scrollToCard(nextIndex)
  }

  const scrollToPrev = () => {
    const prevIndex = Math.max(selectedIndex - 1, 0)
    setSelectedIndex(prevIndex)
    scrollToCard(prevIndex)
  }

  if (relicPositions.length === 0) {
    return (
      <Box py="16" textAlign="center">
        <Text color="gray.400" fontSize="lg">
          Get started by minting your own relic
        </Text>
      </Box>
    )
  }

  return (
    <Box position="relative" width="full">
      {/* Scroll Container */}
      <Box
        display="flex"
        gap="4"
        justifyContent={allRelicsVisible ? 'center' : 'flex-start'}
        mb="6"
        overflowX={allRelicsVisible ? 'hidden' : 'auto'}
        p="6"
        ref={scrollContainerRef}
        sx={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          scrollBehavior: 'smooth',
          pointerEvents: 'none',
          '::-webkit-scrollbar': {
            display: 'none',
          },
          '> *': {
            pointerEvents: 'auto',
          },
        }}
        w="full"
      >
        {relicPositions.map((relic, index) => (
          <Flex
            cursor={selectedIndex === index ? 'default' : 'pointer'}
            data-index={index}
            data-relic-card
            flex="0 0 auto"
            key={relic.relicId}
            onClick={() => {
              setSelectedIndex(index)
              scrollToCard(index)
            }}
            width={{ base: '80vw', sm: '400px' }}
          >
            <RelicCard isSelected={index === selectedIndex} relic={relic} />
          </Flex>
        ))}
        {/* </Flex> */}
      </Box>

      {/* Navigation Buttons with Pagination Dots */}
      <HStack justify="center" spacing="4">
        {!allRelicsVisible && (
          <Button
            _disabled={{
              opacity: 0.3,
              cursor: 'not-allowed',
            }}
            _hover={{
              opacity: selectedIndex === 0 ? 0.3 : 0.8,
            }}
            bg="transparent"
            color="white"
            disabled={selectedIndex === 0}
            leftIcon={<ChevronLeft size={20} />}
            onClick={scrollToPrev}
            size="sm"
          >
            Previous
          </Button>
        )}

        {/* Pagination Dots */}
        {!allRelicsVisible && (
          <HStack spacing="2">
            {relicPositions.map((relic, index) => (
              <Box
                _hover={{
                  transform: 'scale(1.2)',
                }}
                bg={index === selectedIndex ? 'whiteAlpha.800' : 'whiteAlpha.400'}
                borderRadius="full"
                cursor="pointer"
                h="10px"
                key={relic.relicId}
                onClick={() => {
                  setSelectedIndex(index)
                  scrollToCard(index)
                }}
                transition="all 200ms"
                w="10px"
              />
            ))}
          </HStack>
        )}

        {!allRelicsVisible && (
          <Button
            _disabled={{
              opacity: 0.3,
              cursor: 'not-allowed',
            }}
            _hover={{
              opacity: selectedIndex === relicPositions.length - 1 ? 0.3 : 0.8,
            }}
            bg="transparent"
            color="white"
            disabled={selectedIndex === relicPositions.length - 1}
            onClick={scrollToNext}
            rightIcon={<ChevronRight size={20} />}
            size="sm"
          >
            Next
          </Button>
        )}
      </HStack>
    </Box>
  )
}
