'use client'

import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react'
import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { useReliquary } from '../ReliquaryProvider'
import { RelicCard } from './RelicCard'
import { ChevronLeft, ChevronRight } from 'react-feather'

type Props = {
  focusRelicId?: string | null
}

export function RelicCarousel({ focusRelicId }: Props = {}) {
  const { relicPositions } = useReliquary()

  const focusRelicIndex = relicPositions.findIndex(r => r.relicId === focusRelicId)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(focusRelicIndex !== -1 ? focusRelicIndex : 0)
  const [allRelicsVisible, setAllRelicsVisible] = useState(false)

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

  // Auto-scroll to focused Relic when specified

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cards = container.querySelectorAll('[data-relic-card]')
      const targetCard = cards[index] as HTMLElement

      if (targetCard) {
        // Calculate positions to center the card horizontally
        const containerRect = container.getBoundingClientRect()
        const cardRect = targetCard.getBoundingClientRect()

        const cardCenter = cardRect.left + cardRect.width / 2
        const containerCenter = containerRect.left + containerRect.width / 2
        const scrollOffset = cardCenter - containerCenter

        // Scroll horizontally only (no vertical scrolling)
        container.scrollTo({
          left: container.scrollLeft + scrollOffset,
          behavior: 'smooth',
        })
      }
    }
  }

  // Used only for URL-based focus (focusRelicId), not user navigation
  const scrollToCardWithVerticalCenter = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cards = container.querySelectorAll('[data-relic-card]')
      const targetCard = cards[index] as HTMLElement

      if (targetCard) {
        // 1. Horizontal scroll (same as scrollToCard)
        const containerRect = container.getBoundingClientRect()
        const cardRect = targetCard.getBoundingClientRect()
        const cardCenter = cardRect.left + cardRect.width / 2
        const containerCenter = containerRect.left + containerRect.width / 2
        const scrollOffset = cardCenter - containerCenter

        container.scrollTo({
          left: container.scrollLeft + scrollOffset,
        })

        // 2. Vertical scroll to center carousel in viewport
        // Get the carousel container's position relative to viewport
        const containerTop = containerRect.top + window.scrollY
        const containerHeight = containerRect.height
        const viewportHeight = window.innerHeight

        // Calculate scroll position to center the carousel vertically
        const targetScrollY = containerTop - viewportHeight / 2 + containerHeight / 2

        window.scrollTo({
          top: targetScrollY,
        })
      }
    }
  }

  useEffect(() => {
    if (focusRelicIndex !== -1) {
      scrollToCardWithVerticalCenter(focusRelicIndex)
    }
  }, [focusRelicIndex])

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
          No maBEETS positions yet — your first Relic will appear here.
        </Text>
      </Box>
    )
  }

  return (
    <Box position="relative" width="full">
      <Box
        display="flex"
        gap="4"
        justifyContent={allRelicsVisible ? 'center' : 'flex-start'}
        mb="6"
        overflowX={allRelicsVisible ? 'hidden' : 'auto'}
        p="6"
        ref={scrollContainerRef}
        sx={{
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
      </Box>
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
            isDisabled={selectedIndex === 0}
            leftIcon={<ChevronLeft size={20} />}
            onClick={scrollToPrev}
            size="sm"
          >
            Previous
          </Button>
        )}
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
