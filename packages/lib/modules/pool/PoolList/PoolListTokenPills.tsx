import { Badge, BadgeProps, Box, HStack, Text, Wrap } from '@chakra-ui/react'
import { GqlChain, GqlPoolTokenDetail } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolListItem } from '../pool.types'
import { TokenIcon } from '../../tokens/TokenIcon'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { isStableLike, isWeightedLike } from '../pool.helpers'
import { Pool } from '../PoolProvider'
import { usePoolTokens } from '../tokens/usePoolTokens'
import { useMemo } from 'react'

function NestedTokenPill({
  nestedTokens,
  chain,
  iconSize = 24,
}: {
  nestedTokens: GqlPoolTokenDetail[]
  chain: GqlChain
  iconSize?: number
}) {
  const isFirstToken = (index: number) => index === 0

  return nestedTokens.map((nestedToken, i) => {
    const nestedZIndices = Array.from(
      { length: nestedTokens?.length || 0 },
      (_, index) => index + 1
    ).reverse()

    const token = nestedToken.underlyingToken ?? nestedToken

    return (
      token && (
        <Box key={token.address} ml={isFirstToken(i) ? 0 : -3} zIndex={nestedZIndices[i]}>
          <TokenIcon address={token.address} alt={token.symbol} chain={chain} size={iconSize} />
        </Box>
      )
    )
  })
}

function WeightedTokenPills({
  tokens,
  chain,
  iconSize = 24,
  ...badgeProps
}: { tokens: GqlPoolTokenDetail[]; chain: GqlChain; iconSize?: number } & BadgeProps) {
  return (
    <Wrap spacing="xs">
      {tokens.map(token => {
        return (
          <Badge
            key={token.address}
            {...badgeProps}
            alignItems="center"
            bg="background.level2"
            borderColor="border.base"
            borderRadius="full"
            borderWidth={1}
            display="flex"
            shadow="sm"
            textTransform="none"
          >
            <HStack gap={['xs', 'sm']}>
              {!token.nestedPool && (
                <>
                  <TokenIcon
                    address={token.address}
                    alt={token.symbol}
                    chain={chain}
                    size={iconSize}
                  />
                  <HStack gap={['xs', '1.5']}>
                    {tokens.length < 5 && (
                      <Text fontWeight="bold" noOfLines={1}>
                        {token.symbol}
                      </Text>
                    )}
                    <Text fontSize="xs">{fNum('weight', token.weight || '')}</Text>
                  </HStack>
                </>
              )}
              {token.nestedPool && (
                <>
                  <NestedTokenPill
                    chain={chain}
                    iconSize={iconSize}
                    nestedTokens={token.nestedPool.tokens}
                  />
                  <HStack gap={['xs', '1.5']}>
                    <Text fontWeight="bold" noOfLines={1}>
                      {token.name}
                    </Text>
                    <Text fontSize="xs">{fNum('weight', token.weight || '')}</Text>
                  </HStack>
                </>
              )}
            </HStack>
          </Badge>
        )
      })}
    </Wrap>
  )
}

function StableTokenPills({
  tokens,
  chain,
  iconSize = 24,
  ...badgeProps
}: { tokens: GqlPoolTokenDetail[]; chain: GqlChain; iconSize?: number } & BadgeProps) {
  const isFirstToken = (index: number) => index === 0
  const zIndices = Array.from({ length: tokens.length }, (_, index) => index).reverse()

  return (
    <HStack spacing={0}>
      {tokens.map((token, i) => {
        return (
          <Badge
            key={token.address}
            {...badgeProps}
            alignItems="center"
            bg="background.level2"
            borderColor="border.base"
            borderRadius="full"
            borderWidth={1}
            display="flex"
            ml={isFirstToken(i) ? 0 : -10}
            pl={[isFirstToken(i) ? 1 : 12, isFirstToken(i) ? 2 : 12]}
            shadow="sm"
            textTransform="none"
            zIndex={zIndices[i]}
          >
            <HStack gap={['xs', '1.5']}>
              {!token.nestedPool && (
                <>
                  <TokenIcon
                    address={token.address}
                    alt={token.symbol}
                    chain={chain}
                    size={iconSize}
                  />
                  {tokens.length < 5 && (
                    <Text fontWeight="bold" noOfLines={1}>
                      {token.symbol}
                    </Text>
                  )}
                </>
              )}
              {token.nestedPool && (
                <>
                  <NestedTokenPill
                    chain={chain}
                    iconSize={iconSize}
                    nestedTokens={token.nestedPool.tokens}
                  />
                  <Text fontWeight="bold" noOfLines={1}>
                    {token.name}
                  </Text>
                </>
              )}
            </HStack>
          </Badge>
        )
      })}
    </HStack>
  )
}

type Props = {
  pool: Pool | PoolListItem
  iconSize?: number
}

export function PoolListTokenPills({ pool, iconSize = 24, ...badgeProps }: Props & BadgeProps) {
  const shouldUseWeightedPills = isWeightedLike(pool.type)
  const shouldUseStablePills = isStableLike(pool.type)

  const { getPoolActionTokens } = usePoolTokens(pool)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const poolTokens = useMemo(() => getPoolActionTokens() as unknown as GqlPoolTokenDetail[], [pool])

  if (shouldUseStablePills) {
    return (
      <StableTokenPills
        chain={pool.chain}
        iconSize={iconSize}
        tokens={poolTokens}
        {...badgeProps}
      />
    )
  }

  if (shouldUseWeightedPills) {
    return (
      <WeightedTokenPills
        chain={pool.chain}
        iconSize={iconSize}
        tokens={poolTokens}
        {...badgeProps}
      />
    )
  }

  return (
    <WeightedTokenPills
      chain={pool.chain}
      iconSize={iconSize}
      tokens={poolTokens}
      {...badgeProps}
    />
  )
}
