import { fNum } from '@repo/lib/shared/utils/numbers'
import { PoolCore, PoolToken } from './pool.types'
import { HStack, Text, TextProps, Box } from '@chakra-ui/react'
import { FeaturedPool } from './PoolProvider'
import { getUserReferenceTokens } from './pool-tokens.utils'

interface PoolNameProps extends TextProps {
  pool: PoolCore | FeaturedPool
  MemoizedMainAprTooltip?: React.ComponentType<any>
  isCarousel?: boolean
  showUnderlying?: boolean
}

// Type guard function to check if pool is FeaturedPool
function isFeaturedPool(pool: PoolCore | FeaturedPool): pool is FeaturedPool {
  return (pool as FeaturedPool).dynamicData !== undefined
}

export function PoolName({
  pool,
  MemoizedMainAprTooltip,
  isCarousel,
  showUnderlying,
  ...rest
}: PoolNameProps) {
  const tokens = getUserReferenceTokens(pool).filter(token => token.address !== pool.address)

  return (
    <HStack alignItems="center" gap="xxs" justify="start" px="sm" wrap="wrap">
      {tokens.map((token, idx) => {
        return (
          <HStack alignItems="center" gap="xxs" justify="center" key={token.address}>
            <Text as="span" fontWeight="bold" {...rest} fontSize="sm" lineHeight="1">
              {formatToken(token, showUnderlying)}
              {token.weight && ` ${fNum('weight', token.weight || '')}`}
            </Text>
            <Text {...rest} lineHeight="1">
              {idx <= tokens.length - 2 && '/'}
            </Text>
          </HStack>
        )
      })}
      {isFeaturedPool(pool) && MemoizedMainAprTooltip && (
        <Box
          _hover={{ transform: 'scale(1.1)' }}
          transform="scale(0.9)"
          transition="transform 0.2s var(--ease-out-cubic)"
          width="0"
        >
          <MemoizedMainAprTooltip
            aprItems={pool.dynamicData.aprItems}
            id={`featured-${isCarousel ? 'mobile' : 'desktop'}`}
            onlySparkles
            pool={pool}
            poolId={pool.id}
          />
        </Box>
      )}
    </HStack>
  )
}

function formatToken(token: PoolToken, showUnderlying: boolean | undefined) {
  if (token.nestedPool) return token.name
  if (showUnderlying && token.underlyingToken) return token.underlyingToken?.symbol

  return token.symbol
}
