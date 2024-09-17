import { fNum } from '@/lib/shared/utils/numbers'
import { PoolListItem } from './pool.types'
import { HStack, Text, TextProps, Box } from '@chakra-ui/react'
import { FeaturedPool, Pool } from './PoolProvider'

interface PoolNameProps extends TextProps {
  pool: PoolListItem | Pool | FeaturedPool
  MemoizedMainAprTooltip?: React.ComponentType<any>
  isCarousel?: boolean
}

// Type guard function to check if pool is FeaturedPool
function isFeaturedPool(pool: PoolListItem | Pool | FeaturedPool): pool is FeaturedPool {
  return (pool as FeaturedPool).dynamicData !== undefined
}

export function PoolName({ pool, MemoizedMainAprTooltip, isCarousel, ...rest }: PoolNameProps) {
  const displayTokens = pool.displayTokens

  return (
    <HStack alignItems="center" justify="start" wrap="wrap" gap="xxs" px="sm">
      {displayTokens.map((token, idx) => {
        return (
          <HStack key={token.address} alignItems="center" justify="center" gap="xxs">
            <Text as="span" fontWeight="bold" {...rest} fontSize="sm" lineHeight="1">
              {token.nestedTokens ? token.name : token.symbol}
              {token.weight && ` ${fNum('weight', token.weight || '')}`}
            </Text>
            <Text {...rest} lineHeight="1">
              {idx <= displayTokens.length - 2 && '/'}
            </Text>
          </HStack>
        )
      })}
      {isFeaturedPool(pool) && MemoizedMainAprTooltip && (
        <Box
          width="0"
          transform="scale(0.9)"
          transition="transform 0.2s var(--ease-out-cubic)"
          _hover={{ transform: 'scale(1.1)' }}
        >
          <MemoizedMainAprTooltip
            poolId={pool.id}
            aprItems={pool.dynamicData.aprItems}
            pool={pool}
            onlySparkles
            id={`featured-${isCarousel ? 'mobile' : 'desktop'}`}
          />
        </Box>
      )}
    </HStack>
  )
}
