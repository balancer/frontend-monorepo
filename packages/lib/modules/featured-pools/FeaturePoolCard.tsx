'use client'

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { FeaturedPool, Pool } from '../pool/PoolProvider'
import { useRouter } from 'next/navigation'
import { VStack, Text, Box, HStack, Image } from '@chakra-ui/react'
import { poolClickHandler, poolMouseEnterHandler, getPoolTypeLabel } from '../pool/pool.utils'
import { PoolName } from '../pool/PoolName'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { motion } from 'framer-motion'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { memo, ReactNode } from 'react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

interface Props {
  pool: FeaturedPool
  chain: GqlChain
  bgSize?: string
  isSmall?: boolean
  isCarousel?: boolean
  carouselDirection?: 'left' | 'right'
  carouselIndex?: number
  featuredReason?: string
  graphic: ReactNode
}

const slideVariants = {
  hiddenRight: {
    x: '100%',
    opacity: 0,
  },
  hiddenLeft: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: '0',
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.5,
    },
  },
}

export function FeaturePoolCard({
  pool,
  chain,
  featuredReason,
  bgSize = '500px',
  isSmall = false,
  isCarousel = false,
  carouselDirection = 'left',
  carouselIndex = 1,
  graphic,
}: Props) {
  const router = useRouter()

  const MemoizedMainAprTooltip = memo(MainAprTooltip)

  const anim = isCarousel
    ? {
        initial: carouselDirection === 'left' ? 'hiddenLeft' : 'hiddenRight',
        animate: 'visible',
        exit: 'exit',
        variants: slideVariants,
      }
    : {}

  return (
    <NoisyCard
      cardProps={{
        position: 'relative',
        overflow: 'hidden',
        onClick: event => poolClickHandler(event, pool as Pool, router),
        onMouseEnter: event => poolMouseEnterHandler(event, pool as Pool, router),
        cursor: 'pointer',
        _hover: { bg: 'background.level0' },
        _dark: { _hover: { bg: 'gray.900' } },
      }}
      contentProps={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        as={motion.div}
        height={{ base: '100%', md: '280px' }}
        key={carouselIndex}
        padding="1.25rem 0.5rem"
        position="relative"
        transition="all 0.2s var(--ease-out-cubic)"
        width="100%"
        {...anim}
        role="group"
      >
        <VStack cursor="pointer" h="full" justifyContent="center" spacing={isSmall ? 'sm' : 'md'}>
          <VStack spacing="4">
            <Box
              _groupHover={{ opacity: '1', transform: 'translateY(0)' }}
              css={{
                '@media(pointer: fine)': {
                  opacity: '0',
                },
                '@media(pointer: coarse)': {
                  opacity: '1',
                },
              }}
              textAlign="center"
              transform="translateY(2px)"
              transition="all 0.3s var(--ease-out-cubic)"
            >
              <Text fontSize="sm" fontWeight="bold" mb="1" textAlign="center" variant="special">
                {featuredReason}
              </Text>
            </Box>
            <FadeInOnView>
              <Box position="relative">
                <Box
                  _groupHover={{ transform: 'scale(1.1) rotate(60deg)' }}
                  color="background.level0"
                  transition="transform 0.2s var(--ease-out-cubic)"
                >
                  {graphic}
                </Box>

                <Box
                  _groupHover={{
                    background: 'background.level4',
                    transform: 'translateX(-50%, -50%) scale(1.5)',
                  }}
                  background="background.level2"
                  height="44px"
                  left="50%"
                  position="absolute"
                  rounded="full"
                  shadow="2xl"
                  top="50%"
                  transform="translate(-50%, -50%)"
                  transformOrigin="center"
                  transition="all 0.2s var(--ease-out-cubic)"
                  width="44px"
                  zIndex={5}
                >
                  <Image
                    _groupHover={{
                      transform: 'translate(-50%, -50%) scale(1.15)',
                    }}
                    alt={`Chain icon for ${chain.toLowerCase()}`}
                    height="28px"
                    left="50%"
                    position="absolute"
                    src={`/images/chains/${chain}.svg`}
                    top="50%"
                    transform="translate(-50%, -50%)"
                    transformOrigin="center"
                    transition="transform 0.3s var(--ease-out-cubic)"
                    width="28px"
                  />
                </Box>
              </Box>
            </FadeInOnView>
            <VStack spacing="0" zIndex={1}>
              <HStack gap="0" mb="1">
                <PoolName
                  MemoizedMainAprTooltip={MemoizedMainAprTooltip}
                  fontSize="md"
                  isCarousel={isCarousel}
                  noOfLines={1}
                  pool={pool}
                />
              </HStack>
              <Text fontSize="sm" fontWeight="medium" mb="0.5" variant="secondary">
                {getPoolTypeLabel(pool.type)} pool
              </Text>
            </VStack>
          </VStack>
        </VStack>

        <Box
          _groupHover={{ transformOrigin: '50%', transform: 'scale(1.03)' }}
          opacity={{ base: '0', md: '1' }}
          position="relative"
          top="-50%"
          transition="transform 0.2s var(--ease-out-cubic)"
        >
          <PoolZenGarden repetitions={10} sizePx={bgSize} subdued={isSmall} />
        </Box>
      </Box>
    </NoisyCard>
  )
}
