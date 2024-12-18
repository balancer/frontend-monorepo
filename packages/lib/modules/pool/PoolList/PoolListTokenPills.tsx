import { Badge, BadgeProps, Box, Heading, HStack, Text, Wrap } from '@chakra-ui/react'
import {
  GqlChain,
  GqlPoolTokenDetail,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { TokenIcon } from '../../tokens/TokenIcon'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { isStableLike, isV3Pool, isWeightedLike } from '../pool.helpers'
import { usePoolMetadata } from '../metadata/usePoolMetadata'
import { TokenIconStack } from '../../tokens/TokenIconStack'

type DisplayToken = Pick<
  GqlPoolTokenDetail,
  'address' | 'symbol' | 'weight' | 'nestedPool' | 'name'
>

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
}: { tokens: DisplayToken[]; chain: GqlChain; iconSize?: number } & BadgeProps) {
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
}: { tokens: DisplayToken[]; chain: GqlChain; iconSize?: number } & BadgeProps) {
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

type PoolData = {
  type: GqlPoolType
  chain: GqlChain
  address: string
  displayTokens: DisplayToken[]
  poolTokens: GqlPoolTokenDetail[]
  hasErc4626?: boolean
  hasAnyAllowedBuffer?: boolean
  protocolVersion: number
}

type Props = {
  pool: PoolData
  iconSize?: number
  nameSize?: string
}

export function PoolListTokenPills({
  pool,
  iconSize = 24,
  nameSize = 'md',
  ...badgeProps
}: Props & BadgeProps) {
  const shouldUseWeightedPills = isWeightedLike(pool.type)
  const shouldUseStablePills = isStableLike(pool.type)
  const { name } = usePoolMetadata(pool)

  // TODO: fix difference between Pool and PoolListItem types
  let poolTokens = pool.poolTokens.filter(
    token => token.address !== pool.address
  ) as GqlPoolTokenDetail[]

  // TODO: Move this into a general 'displayTokens' helper function.
  if (isV3Pool(pool) && pool.hasErc4626 && pool.hasAnyAllowedBuffer) {
    poolTokens = poolTokens.map(token =>
      token.isErc4626 && token.isBufferAllowed
        ? ({ ...token, ...token.underlyingToken } as unknown as GqlPoolTokenDetail)
        : token
    )
  }

  if (name) {
    return (
      <HStack>
        <TokenIconStack chain={pool.chain} size={iconSize} tokens={poolTokens} />
        <Heading size={nameSize}>{name}</Heading>
      </HStack>
    )
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
