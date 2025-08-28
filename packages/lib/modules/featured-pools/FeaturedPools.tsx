'use client'

import { BoxProps, Card, Box, Text, HStack, useColorMode } from '@chakra-ui/react'
import { FeaturePoolCard } from './FeaturePoolCard'
import { GetFeaturedPoolsQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolCarousel } from './PoolCarousel'
import {
  FeaturedPool1SVG,
  FeaturedPool2SVG,
  FeaturedPool3SVG,
} from '@repo/lib/shared/components/imgs/FeaturedPoolSvgs'

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

  const { colorMode } = useColorMode()

  return (
    <>
      <PoolCarousel
        display="block"
        featuredPools={featuredPools}
        getGraphic={getGraphicCarousel}
        opacity={{ base: '1', md: '0' }}
        position={{ base: 'relative', md: 'absolute' }}
        visibility={{ base: 'visible', md: 'hidden' }}
        w="full"
      />
      <Card
        alignItems="center"
        display={{ base: 'none', md: 'flex' }}
        justifyContent="center"
        position="relative"
        variant="level2"
        width="full"
      >
        <Box position="absolute" top="0">
          <Text
            color="font.secondary"
            fontSize="11px"
            opacity="0.75"
            position="relative"
            textShadow={
              colorMode === 'dark'
                ? '0px 1px 1px rgba(0, 0, 0, 0.9)'
                : '0px 1px 1px rgba(0, 0, 0, 0.15)'
            }
            top="7px"
            variant="eyebrow"
          >
            New / Interesting pools
          </Text>
        </Box>
        <HStack gap="md" pt="13px" w="full">
          {featuredPools.slice(0, 3).map((featured, index) => {
            return (
              <FeaturePoolCard
                bgSize="300px"
                chain={featured.pool.chain}
                featuredReason={featured.description}
                graphic={getGraphic(index)}
                isSmall
                key={featured.pool.id}
                pool={featured.pool}
              />
            )
          })}
        </HStack>
      </Card>
    </>
  )
}
