'use client'

import { BoxProps, Card, Box, Text, HStack } from '@chakra-ui/react'
import { FeaturePoolCard } from './FeaturePoolCard'
import { GetFeaturedPoolsQuery } from '@/lib/shared/services/api/generated/graphql'
import { PoolCarousel } from './PoolCarousel'
import {
  FeaturedPool1SVG,
  FeaturedPool2SVG,
  FeaturedPool3SVG,
} from '@/lib/shared/components/imgs/FeaturedPoolSvgs'

export const commonNoisyCardProps: { contentProps: BoxProps; cardProps: BoxProps } = {
  contentProps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardProps: {
    position: 'relative',
    overflow: 'hidden',
  },
}

export function FeaturedPools({
  featuredPools,
}: {
  featuredPools: GetFeaturedPoolsQuery['featuredPools']
}) {
  const getGraphicCarousel = (index: number) => {
    switch (index) {
      case 0:
        return <FeaturedPool1SVG key="featured-pool-carousel-1" />
      case 1:
        return <FeaturedPool2SVG key="featured-pool-carousel-2" />
      case 2:
        return <FeaturedPool3SVG key="featured-pool-carousel-3" />
      default:
        return null
    }
  }

  const getGraphic = (index: number) => {
    switch (index) {
      case 0:
        return <FeaturedPool1SVG key="featured-pool-1" />
      case 1:
        return <FeaturedPool2SVG key="featured-pool-2" />
      case 2:
        return <FeaturedPool3SVG key="featured-pool-3" />
      default:
        return null
    }
  }

  return (
    <>
      <PoolCarousel
        featuredPools={featuredPools}
        display="block"
        visibility={{ base: 'visible', md: 'hidden' }}
        opacity={{ base: '1', md: '0' }}
        position={{ base: 'relative', md: 'absolute' }}
        w="full"
        getGraphic={getGraphicCarousel}
      />
      <Card
        display={{ base: 'none', md: 'flex' }}
        variant="level2"
        width="full"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Box position="absolute" top="0">
          <Text
            color="font.secondary"
            variant="eyebrow"
            px="4"
            py="1.5"
            top="-2px"
            fontSize="11px"
            position="relative"
          >
            Featured pools
          </Text>
        </Box>
        <HStack w="full" pt="2" gap="md">
          {featuredPools.slice(0, 3).map((featured, index) => {
            return (
              <FeaturePoolCard
                key={index}
                pool={featured.pool}
                chain={featured.pool.chain}
                featuredReason={featured.description}
                isSmall
                bgSize="300px"
                graphic={getGraphic(index)}
              />
            )
          })}
        </HStack>
      </Card>
    </>
  )
}
