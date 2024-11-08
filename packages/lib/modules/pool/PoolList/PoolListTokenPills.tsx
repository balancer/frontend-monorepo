import { Badge, BadgeProps, Box, HStack, Text, Wrap } from '@chakra-ui/react'
import { GqlChain, GqlPoolTokenDisplay } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolListItem } from '../pool.types'
import { TokenIcon } from '../../tokens/TokenIcon'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { isStableLike, isWeightedLike } from '../pool.helpers'
import { Pool } from '../PoolProvider'

function NestedTokenPill({
  nestedTokens,
  chain,
  iconSize = 24,
}: {
  nestedTokens: GqlPoolTokenDisplay[]
  chain: GqlChain
  iconSize?: number
}) {
  const isFirstToken = (index: number) => index === 0

  return nestedTokens.map((nestedToken, i) => {
    const nestedZIndices = Array.from(
      { length: nestedTokens?.length || 0 },
      (_, index) => index
    ).reverse()
    return (
      <Box key={nestedToken.address} ml={isFirstToken(i) ? 0 : -3} zIndex={nestedZIndices[i]}>
        <TokenIcon
          address={nestedToken.address}
          alt={nestedToken.symbol}
          chain={chain}
          size={iconSize}
        />
      </Box>
    )
  })
}

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
              {!token.nestedTokens && (
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

              {token.nestedTokens && (
                <>
                  <NestedTokenPill
                    chain={chain}
                    iconSize={iconSize}
                    nestedTokens={token.nestedTokens}
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
              {!token.nestedTokens && (
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
              {token.nestedTokens && (
                <>
                  <NestedTokenPill
                    chain={chain}
                    iconSize={iconSize}
                    nestedTokens={token.nestedTokens}
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

function BoostedTokenPills({
  pool,
  chain,
  iconSize = 24,
  ...badgeProps
}: { pool: Pool | PoolListItem; chain: GqlChain; iconSize?: number } & BadgeProps) {
  return (
    <HStack spacing={0}>
      <Badge
        {...badgeProps}
        alignItems="center"
        bg="background.level2"
        borderColor="border.base"
        borderRadius="full"
        borderWidth={1}
        shadow="sm"
        textTransform="none"
      >
        <HStack gap={['xs', '1.5']}>
          <HStack>
            {pool.displayTokens.map(token => (
              <TokenIcon
                address={token.address}
                alt={token.symbol}
                chain={chain}
                key={token.address}
                size={iconSize}
              />
            ))}
          </HStack>
          <Text fontWeight="bold" noOfLines={1}>
            {pool.name}
          </Text>
        </HStack>
      </Badge>
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

  if (pool.hasErc4626 && !pool.hasNestedErc4626) {
    return <BoostedTokenPills chain={pool.chain} iconSize={iconSize} pool={pool} {...badgeProps} />
  }

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
