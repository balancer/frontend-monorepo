'use client'

import { GetFeaturedPoolsQuery } from '@/lib/shared/services/api/generated/graphql'
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
        w="full"
        pos="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        paddingTop="26px !important"
        zIndex={9999}
      >
        <Box position="absolute" top="0">
          <Text color="font.secondary" variant="eyebrow" px="4" py="1.5" fontSize="10px">
            Featured pools
          </Text>
        </Box>
        <Box pos="absolute" w="8" h="full" top="0" left="0" cursor="pointer" onClick={prev} />
        <Box pos="absolute" w="8" h="full" top="0" right="0" cursor="pointer" onClick={next} />
        <FeaturePoolCard
          key={`pool-carousel-card-${currentIndex}`}
          pool={currentPool}
          chain={currentPool.chain}
          bgSize="300px"
          isCarousel
          isSmall
          carouselIndex={currentIndex}
          carouselDirection={direction}
          featuredReason={featuredPools[currentIndex].description}
          graphic={getGraphic(currentIndex)}
        />
      </Card>
      <Center w="full" mt="md">
        {featuredPools.map((featured, index) => (
          <Box
            key={featured.pool.id}
            w="3"
            h="3"
            bg={index === currentIndex ? 'font.highlight' : 'border.base'}
            borderRadius="full"
            cursor="pointer"
            onClick={() => pick(index)}
            mx="xs"
            transition="all 0.2s ease-out"
          />
        ))}
      </Center>
    </Box>
  )
}
