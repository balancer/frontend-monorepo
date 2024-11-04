import { Badge, BadgeProps, HStack, Text, Wrap } from '@chakra-ui/react'
import { GqlChain, GqlPoolTokenDisplay } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolListItem } from '../pool.types'
import { TokenIcon } from '../../tokens/TokenIcon'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { isStableLike, isWeightedLike } from '../pool.helpers'
import { Pool } from '../PoolProvider'

function WeightedTokenPills({
  tokens,
  chain,
  iconSize = 24,
  ...badgeProps
}: { tokens: GqlPoolTokenDisplay[]; chain: GqlChain; iconSize?: number } & BadgeProps) {
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
              <TokenIcon address={token.address} alt={token.symbol} chain={chain} size={iconSize} />
              <HStack gap={['xs', '1.5']}>
                {tokens.length < 5 && (
                  <Text fontWeight="bold" noOfLines={1}>
                    {token.symbol}
                  </Text>
                )}
                <Text fontSize="xs">{fNum('weight', token.weight || '')}</Text>
              </HStack>
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
}: { tokens: GqlPoolTokenDisplay[]; chain: GqlChain; iconSize?: number } & BadgeProps) {
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
              <TokenIcon address={token.address} alt={token.symbol} chain={chain} size={iconSize} />
              {tokens.length < 5 && (
                <Text fontWeight="bold" noOfLines={1}>
                  {token.symbol}
                </Text>
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

  if (shouldUseStablePills) {
    return (
      <StableTokenPills
        chain={pool.chain}
        iconSize={iconSize}
        tokens={pool.displayTokens}
        {...badgeProps}
      />
    )
  }

  if (shouldUseWeightedPills) {
    return (
      <WeightedTokenPills
        chain={pool.chain}
        iconSize={iconSize}
        tokens={pool.displayTokens}
        {...badgeProps}
      />
    )
  }

  return (
    <WeightedTokenPills
      chain={pool.chain}
      iconSize={iconSize}
      tokens={pool.displayTokens}
      {...badgeProps}
    />
  )
}
