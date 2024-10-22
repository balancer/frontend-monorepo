'use client'

import { GetFeaturedPoolsQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { useState } from 'react'
import { Box, BoxProps, Card, Center, Text } from '@chakra-ui/react'
import { FeaturePoolCard } from './FeaturePoolCard'
import { Pool } from '../pool/PoolProvider'
import { useSwipeable } from 'react-swipeable'

type Props = {
  featuredPools: GetFeaturedPoolsQuery['featuredPools']
  getGraphic: (index: number) => JSX.Element | null
}

export function PoolCarousel({ featuredPools, getGraphic, ...rest }: Props & BoxProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('left')
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => next(),
    onSwipedRight: () => prev(),
  })

  function next() {
    setDirection('right')
    setCurrentIndex(prevIndex => (prevIndex + 1 === featuredPools.length ? 0 : prevIndex + 1))
  }

  function prev() {
    setDirection('left')
    setCurrentIndex(prevIndex => (prevIndex - 1 < 0 ? featuredPools.length - 1 : prevIndex - 1))
  }

  function pick(index: number) {
    setDirection(index > currentIndex ? 'right' : 'left')
    setCurrentIndex(index)
  }

  const currentPool = featuredPools[currentIndex].pool as Pool

  return (
    <Box {...swipeHandlers} {...rest} zIndex={9999}>
      <Card
        alignItems="center"
        display="flex"
        justifyContent="center"
        paddingTop="26px !important"
        pos="relative"
        position="relative"
        w="full"
        zIndex={9999}
      >
        <Box position="absolute" top="0">
          <Text color="font.secondary" fontSize="10px" px="4" py="1.5" variant="eyebrow">
            Featured pools
          </Text>
        </Box>
        <Box cursor="pointer" h="full" left="0" onClick={prev} pos="absolute" top="0" w="8" />
        <Box cursor="pointer" h="full" onClick={next} pos="absolute" right="0" top="0" w="8" />
        <FeaturePoolCard
          bgSize="300px"
          carouselDirection={direction}
          carouselIndex={currentIndex}
          chain={currentPool.chain}
          featuredReason={featuredPools[currentIndex].description}
          graphic={getGraphic(currentIndex)}
          isCarousel
          isSmall
          key={`pool-carousel-card-${currentIndex}`}
          pool={currentPool}
        />
      </Card>
      <Center mt="md" w="full">
        {featuredPools.map((featured, index) => (
          <Box
            bg={index === currentIndex ? 'font.highlight' : 'border.base'}
            borderRadius="full"
            cursor="pointer"
            h="3"
            key={featured.pool.id}
            mx="xs"
            onClick={() => pick(index)}
            transition="all 0.2s ease-out"
            w="3"
          />
        ))}
      </Center>
    </Box>
  )
}
