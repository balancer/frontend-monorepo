'use client'

import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { FeaturedPool, Pool } from '../pool/PoolProvider'
import { useRouter } from 'next/navigation'
import { VStack, Text, Box, HStack, Image } from '@chakra-ui/react'
import { poolClickHandler, poolMouseEnterHandler, getPoolTypeLabel } from '../pool/pool.utils'
import { PoolName } from '../pool/PoolName'
import { NoisyCard } from '@/lib/shared/components/containers/NoisyCard'
import { PoolZenGarden } from '@/lib/shared/components/zen/ZenGarden'
import { motion } from 'framer-motion'
import MainAprTooltip from '@/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { memo, ReactNode } from 'react'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'

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
        key={carouselIndex}
        height={{ base: '100%', md: '280px' }}
        position="relative"
        width="100%"
        padding="1.25rem 0.5rem"
        transition="all 0.2s var(--ease-out-cubic)"
        {...anim}
        role="group"
      >
        <VStack cursor="pointer" justifyContent="center" spacing={isSmall ? 'sm' : 'md'} h="full">
          <VStack spacing="4">
            <Box
              textAlign="center"
              transform="translateY(2px)"
              _groupHover={{ opacity: '1', transform: 'translateY(0)' }}
              transition="all 0.3s var(--ease-out-cubic)"
              css={{
                '@media(pointer: fine)': {
                  opacity: '0',
                },
                '@media(pointer: coarse)': {
                  opacity: '1',
                },
              }}
            >
              <Text variant="special" fontWeight="bold" fontSize="sm" textAlign="center" mb="1">
                {featuredReason}
              </Text>
            </Box>
            <FadeInOnView>
              <Box position="relative">
                <Box
                  color="background.level0"
                  transition="transform 0.2s var(--ease-out-cubic)"
                  _groupHover={{ transform: 'scale(1.1) rotate(60deg)' }}
                >
                  {graphic}
                </Box>

                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transformOrigin="center"
                  transform="translate(-50%, -50%)"
                  zIndex={5}
                  transition="all 0.2s var(--ease-out-cubic)"
                  _groupHover={{
                    background: 'background.level4',
                    transform: 'translateX(-50%, -50%) scale(1.5)',
                  }}
                  background="background.level2"
                  height="44px"
                  width="44px"
                  rounded="full"
                  shadow="2xl"
                >
                  <Image
                    position="absolute"
                    top="50%"
                    left="50%"
                    transformOrigin="center"
                    transition="transform 0.3s var(--ease-out-cubic)"
                    transform="translate(-50%, -50%)"
                    src={`/images/chains/${chain}.svg`}
                    alt={`Chain icon for ${chain.toLowerCase()}`}
                    width="28px"
                    height="28px"
                    _groupHover={{
                      transform: 'translate(-50%, -50%) scale(1.15)',
                    }}
                  />
                </Box>
              </Box>
            </FadeInOnView>
            <VStack spacing="0" zIndex={1}>
              <HStack mb="1" gap="0">
                <PoolName
                  pool={pool}
                  fontSize="md"
                  noOfLines={1}
                  MemoizedMainAprTooltip={MemoizedMainAprTooltip}
                  isCarousel={isCarousel}
                />
              </HStack>
              <Text mb="0.5" variant="secondary" fontWeight="medium" fontSize="sm">
                {getPoolTypeLabel(pool.type)} pool
              </Text>
            </VStack>
          </VStack>
        </VStack>

        <Box
          transition="transform 0.2s var(--ease-out-cubic)"
          position="relative"
          opacity={{ base: '0', md: '1' }}
          top="-50%"
          _groupHover={{ transformOrigin: '50%', transform: 'scale(1.03)' }}
        >
          <PoolZenGarden repetitions={10} subdued={isSmall} sizePx={bgSize} />
        </Box>
      </Box>
    </NoisyCard>
  )
}
