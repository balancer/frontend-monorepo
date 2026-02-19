import { Badge, BadgeProps, Box, Heading, HStack, Text, Wrap } from '@chakra-ui/react'
import {
  GqlChain,
  GqlPoolTokenDetail,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { TokenIcon } from '../../tokens/TokenIcon'
import { TokenIconStack } from '../../tokens/TokenIconStack'
import { usePoolMetadata } from '../metadata/usePoolMetadata'
import { isLiquidityBootstrapping, isStableLike, isWeightedLike } from '../pool.helpers'
import { getUserReferenceTokens } from '../pool-tokens.utils'
import { PoolCore, PoolToken } from '../pool.types'
import { VotingPoolWithData } from '../../vebal/vote/vote.types'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { voteToPool } from '@repo/lib/modules/vebal/vote/vote.helpers'

type IsTokenInWallet = (tokenAddress: string) => boolean

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
          <TokenIcon
            address={token.address}
            alt={token.symbol}
            chain={chain}
            logoURI={token.logoURI}
            size={iconSize}
          />
        </Box>
      )
    )
  })
}

function WeightedTokenPills({
  tokens,
  chain,
  iconSize = 24,
  isTokenInWallet,
  nameSize,
  preciseWeight = false,
  ...badgeProps
}: {
  tokens: (PoolToken | ApiToken)[]
  chain: GqlChain
  iconSize?: number
  isTokenInWallet?: IsTokenInWallet
  nameSize?: string
  preciseWeight?: boolean
} & BadgeProps) {
  return (
    <Wrap spacing="xs">
      {tokens.map((token, index) => {
        const nestedPool = 'nestedPool' in token ? token.nestedPool : undefined
        const hasWalletBalance = Boolean(isTokenInWallet?.(token.address))

        return (
          <Badge
            key={`${token.address}-${index}`}
            {...badgeProps}
            _after={
              hasWalletBalance
                ? {
                    bg: 'green.500',
                    content: '""',
                    inset: 0,
                    opacity: 0.08,
                    pointerEvents: 'none',
                    position: 'absolute',
                    zIndex: 0,
                  }
                : undefined
            }
            _before={
              hasWalletBalance
                ? {
                    border: '1px solid',
                    borderColor: 'green.500',
                    borderRadius: 'full',
                    content: '""',
                    inset: 0,
                    opacity: 0.25,
                    pointerEvents: 'none',
                    position: 'absolute',
                    zIndex: 1,
                  }
                : undefined
            }
            alignItems="center"
            bg="background.level2"
            borderColor={hasWalletBalance ? 'transparent' : 'border.base'}
            borderRadius="full"
            borderWidth={1}
            display="flex"
            overflow="hidden"
            position="relative"
            shadow="sm"
            textTransform="none"
          >
            <HStack gap={['xs', 'sm']} position="relative" zIndex={2}>
              {!nestedPool && (
                <>
                  <TokenIcon
                    address={token.address}
                    alt={token.symbol}
                    chain={chain}
                    logoURI={token.logoURI}
                    size={iconSize}
                  />
                  <HStack gap={['xs', '1.5']}>
                    {tokens.length < 5 && (
                      <Text
                        _groupHover={{ color: 'font.maxContrast' }}
                        fontWeight="bold"
                        noOfLines={1}
                        size={nameSize}
                        transition="color 0.2s var(--ease-out-cubic)"
                      >
                        {token.symbol}
                      </Text>
                    )}
                    <Text
                      _groupHover={{ color: 'font.maxContrast' }}
                      fontSize="xs"
                      transition="color 0.2s var(--ease-out-cubic)"
                    >
                      {preciseWeight
                        ? fNum('weight', token.weight || '', { abbreviated: false, decimals: 1 })
                        : fNum('weight', token.weight || '')}
                    </Text>
                  </HStack>
                </>
              )}
              {nestedPool && (
                <>
                  <NestedTokenPill
                    chain={chain}
                    iconSize={iconSize}
                    nestedTokens={nestedPool.tokens}
                  />
                  <HStack gap={['xs', '1.5']}>
                    <Text
                      _groupHover={{ color: 'font.maxContrast' }}
                      fontWeight="bold"
                      noOfLines={1}
                      size={nameSize}
                      transition="color 0.2s var(--ease-out-cubic)"
                    >
                      {token.name}
                    </Text>
                    <Text
                      _groupHover={{ color: 'font.maxContrast' }}
                      fontSize="xs"
                      transition="color 0.2s var(--ease-out-cubic)"
                    >
                      {preciseWeight
                        ? fNum('weight', token.weight || '', { abbreviated: false, decimals: 1 })
                        : fNum('weight', token.weight || '')}
                    </Text>
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
  isTokenInWallet,
  nameSize,
  ...badgeProps
}: {
  tokens: (PoolToken | ApiToken)[]
  chain: GqlChain
  iconSize?: number
  isTokenInWallet?: IsTokenInWallet
  nameSize?: string
} & BadgeProps) {
  const isFirstToken = (index: number) => index === 0
  const zIndices = Array.from({ length: tokens.length }, (_, index) => index + 1).reverse()

  return (
    <HStack spacing={0}>
      {tokens.map((token, i) => {
        const nestedPool = 'nestedPool' in token ? token.nestedPool : undefined
        const hasWalletBalance = Boolean(isTokenInWallet?.(token.address))

        return (
          <Badge
            key={[token.address, token.chain, i].join('-')}
            {...badgeProps}
            _after={
              hasWalletBalance
                ? {
                    bg: 'green.500',
                    content: '""',
                    inset: 0,
                    opacity: 0.08,
                    pointerEvents: 'none',
                    position: 'absolute',
                    zIndex: 0,
                  }
                : undefined
            }
            _before={
              hasWalletBalance
                ? {
                    border: '1px solid',
                    borderColor: 'green.500',
                    borderRadius: 'full',
                    content: '""',
                    inset: 0,
                    opacity: 0.25,
                    pointerEvents: 'none',
                    position: 'absolute',
                    zIndex: 1,
                  }
                : undefined
            }
            alignItems="center"
            bg="background.level2"
            borderColor={hasWalletBalance ? 'transparent' : 'border.base'}
            borderRadius="full"
            borderWidth={1}
            display="flex"
            ml={isFirstToken(i) ? 0 : -10}
            overflow="hidden"
            pl={[isFirstToken(i) ? 1 : 12, isFirstToken(i) ? 2 : 12]}
            position="relative"
            shadow="sm"
            textTransform="none"
            zIndex={zIndices[i]}
          >
            <HStack gap={['xs', '1.5']} position="relative" zIndex={2}>
              {!nestedPool && (
                <>
                  <TokenIcon
                    address={token.address}
                    alt={token.symbol}
                    chain={chain}
                    logoURI={token.logoURI}
                    size={iconSize}
                  />
                  {tokens.length < 5 && (
                    <Text
                      _groupHover={{ color: 'font.maxContrast' }}
                      fontWeight="bold"
                      noOfLines={1}
                      size={nameSize}
                      transition="color 0.2s var(--ease-out-cubic)"
                    >
                      {token.symbol}
                    </Text>
                  )}
                </>
              )}
              {nestedPool && (
                <>
                  <NestedTokenPill
                    chain={chain}
                    iconSize={iconSize}
                    nestedTokens={nestedPool.tokens}
                  />
                  <Text
                    _groupHover={{ color: 'font.maxContrast' }}
                    fontWeight="bold"
                    noOfLines={1}
                    size={nameSize}
                    transition="color 0.2s var(--ease-out-cubic)"
                  >
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

type VotingListTokenPillsProps = {
  vote: VotingPoolWithData
  iconSize?: number
  nameSize?: string
} & BadgeProps

export function VotingListTokenPills({ vote, ...props }: VotingListTokenPillsProps) {
  const pool = voteToPool(vote)
  const { name } = usePoolMetadata(pool)
  const tokens = getUserReferenceTokens(pool)

  return (
    <PoolTokenPills
      chain={pool.chain}
      poolName={name}
      poolType={pool.type}
      protocolVersion={pool.protocolVersion}
      tokens={tokens}
      {...props}
    />
  )
}

type PoolListTokenPillsProps = {
  pool: PoolCore
  iconSize?: number
  isTokenInWallet?: IsTokenInWallet
  nameSize?: string
} & BadgeProps

export function PoolListTokenPills({ pool, ...props }: PoolListTokenPillsProps) {
  const { name, iconUrl } = usePoolMetadata(pool)
  const tokens = getUserReferenceTokens(pool)

  return (
    <PoolTokenPills
      chain={pool.chain}
      iconUrl={iconUrl}
      poolName={name}
      poolType={pool.type}
      protocolVersion={pool.protocolVersion}
      tokens={tokens}
      {...props}
    />
  )
}

type PoolTokenPillsProps = {
  chain: GqlChain
  isTokenInWallet?: IsTokenInWallet
  poolName: string | undefined
  poolType: GqlPoolType
  protocolVersion: number
  tokens: (PoolToken | ApiToken)[]
  iconUrl?: string
  iconSize?: number
  nameSize?: string
} & BadgeProps

function PoolTokenPills({
  chain,
  isTokenInWallet,
  poolName,
  poolType,
  protocolVersion,
  tokens,
  iconSize = 24,
  iconUrl,
  nameSize = 'md',
  ...badgeProps
}: PoolTokenPillsProps) {
  const shouldUseStablePills = isStableLike(poolType)
  const shouldUseWeightedPills = isWeightedLike(poolType)
  const isV3LBP = isLiquidityBootstrapping(poolType) && protocolVersion === 3

  if (poolName) {
    return (
      <HStack>
        {iconUrl ? (
          <TokenIcon alt={poolName} logoURI={iconUrl} size={iconSize} />
        ) : (
          <TokenIconStack chain={chain} size={iconSize} tokens={tokens} />
        )}
        <Heading size={nameSize}>{poolName}</Heading>
      </HStack>
    )
  }

  if (shouldUseStablePills) {
    return (
      <StableTokenPills
        chain={chain}
        iconSize={iconSize}
        isTokenInWallet={isTokenInWallet}
        tokens={tokens}
        {...badgeProps}
      />
    )
  }

  if (shouldUseWeightedPills) {
    return (
      <WeightedTokenPills
        chain={chain}
        iconSize={iconSize}
        isTokenInWallet={isTokenInWallet}
        preciseWeight={isV3LBP}
        tokens={tokens}
        {...badgeProps}
      />
    )
  }

  return (
    <WeightedTokenPills
      chain={chain}
      iconSize={iconSize}
      isTokenInWallet={isTokenInWallet}
      preciseWeight={isV3LBP}
      tokens={tokens}
      {...badgeProps}
    />
  )
}
