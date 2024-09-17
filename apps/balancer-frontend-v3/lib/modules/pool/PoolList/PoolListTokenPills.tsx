import { Badge, BadgeProps, HStack, Text, Wrap } from '@chakra-ui/react'
import { GqlChain, GqlPoolTokenDisplay } from '@/lib/shared/services/api/generated/graphql'
import { PoolListItem } from '../pool.types'
import { TokenIcon } from '../../tokens/TokenIcon'
import { fNum } from '@/lib/shared/utils/numbers'
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
            display="flex"
            alignItems="center"
            bg="background.level2"
            borderRadius="full"
            borderWidth={1}
            borderColor="border.base"
            shadow="sm"
            textTransform="none"
          >
            <HStack gap={['xs', 'sm']}>
              <TokenIcon chain={chain} address={token.address} size={iconSize} alt={token.symbol} />
              <HStack gap={['xs', '1.5']}>
                <Text fontWeight="bold" noOfLines={1}>
                  {token.symbol}
                </Text>
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
            display="flex"
            alignItems="center"
            pl={[isFirstToken(i) ? 1 : 12, isFirstToken(i) ? 2 : 12]}
            bg="background.level2"
            borderRadius="full"
            borderWidth={1}
            borderColor="border.base"
            shadow="sm"
            ml={isFirstToken(i) ? 0 : -10}
            zIndex={zIndices[i]}
            textTransform="none"
          >
            <HStack gap={['xs', '1.5']}>
              <TokenIcon chain={chain} address={token.address} size={iconSize} alt={token.symbol} />
              <Text fontWeight="bold" noOfLines={1} maxW="20">
                {token.symbol}
              </Text>
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
        tokens={pool.displayTokens}
        chain={pool.chain}
        iconSize={iconSize}
        {...badgeProps}
      />
    )
  }

  if (shouldUseWeightedPills) {
    return (
      <WeightedTokenPills
        tokens={pool.displayTokens}
        chain={pool.chain}
        iconSize={iconSize}
        {...badgeProps}
      />
    )
  }

  return (
    <WeightedTokenPills
      tokens={pool.displayTokens}
      chain={pool.chain}
      iconSize={iconSize}
      {...badgeProps}
    />
  )
}
