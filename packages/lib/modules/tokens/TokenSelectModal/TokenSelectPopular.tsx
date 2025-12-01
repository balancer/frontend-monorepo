/* eslint-disable react-hooks/preserve-manual-memoization */
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { GqlChain, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { HStack, Tag, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { useTokens } from '../TokensProvider'
import { useMemo } from 'react'
import { TokenIcon } from '../TokenIcon'
import { nativeAssetFilter } from '../token.helpers'
import { Address } from 'viem'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

type Props = {
  chain: GqlChain
  currentToken?: Address
  excludeNativeAsset?: boolean
  onTokenSelect: (token: GqlToken) => void
  excludedTokens?: Address[]
}

export function TokenSelectPopular({
  chain,
  currentToken,
  excludeNativeAsset,
  onTokenSelect,
  excludedTokens = [],
}: Props) {
  const {
    tokens: { popularTokens },
  } = getNetworkConfig(chain)
  const { getToken } = useTokens()

  const tokens = useMemo(() => {
    const tokens = Object.keys(popularTokens || {})
      .slice(0, 7)
      ?.map(token => getToken(token, chain))
      .filter(Boolean) as GqlToken[]

    return excludeNativeAsset ? tokens.filter(token => !nativeAssetFilter(chain)(token)) : tokens
  }, [popularTokens, excludeNativeAsset, chain])

  const isExcludedToken = (token: GqlToken) =>
    (currentToken && isSameAddress(token.address, currentToken)) ||
    excludedTokens.includes(token.address as Address)

  return (
    <Wrap>
      {tokens?.map(token => (
        <WrapItem key={token.address}>
          <Tag
            _hover={isExcludedToken(token) ? {} : { bg: 'background.level4', shadow: 'none' }}
            cursor={isExcludedToken(token) ? 'not-allowed' : 'pointer'}
            key={token.address}
            onClick={() => !isExcludedToken(token) && onTokenSelect(token)}
            opacity={isExcludedToken(token) ? 0.5 : 1}
            pl="xs"
            role="group"
            shadow="sm"
            size="lg"
            transition="all 0.2s var(--ease-out-cubic)"
          >
            <HStack>
              <TokenIcon address={token.address} alt={token.symbol} chain={chain} size={20} />
              <Text fontSize="sm">{token.symbol}</Text>
            </HStack>
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  )
}
