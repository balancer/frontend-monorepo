/* eslint-disable react-hooks/exhaustive-deps */
import { getNetworkConfig } from '@/lib/config/app.config'
import { GqlChain, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { HStack, Tag, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { useTokens } from '../TokensProvider'
import { useMemo } from 'react'
import { TokenIcon } from '../TokenIcon'
import { nativeAssetFilter } from '../token.helpers'
import { Address } from 'viem'
import { isSameAddress } from '@/lib/shared/utils/addresses'

type Props = {
  chain: GqlChain
  currentToken?: Address
  excludeNativeAsset?: boolean
  onTokenSelect: (token: GqlToken) => void
}

export function TokenSelectPopular({
  chain,
  currentToken,
  excludeNativeAsset,
  onTokenSelect,
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
    return excludeNativeAsset ? tokens.filter(nativeAssetFilter(chain)) : tokens
  }, [popularTokens, excludeNativeAsset, chain])

  const isCurrentToken = (token: GqlToken) =>
    currentToken && isSameAddress(token.address, currentToken)

  return (
    <Wrap>
      {tokens?.map(token => (
        <WrapItem key={token.address}>
          <Tag
            key={token.address}
            onClick={() => !isCurrentToken(token) && onTokenSelect(token)}
            size="lg"
            pl="xs"
            cursor={isCurrentToken(token) ? 'not-allowed' : 'pointer'}
            shadow="sm"
            role="group"
            transition="all 0.2s var(--ease-out-cubic)"
            opacity={isCurrentToken(token) ? 0.5 : 1}
            _hover={isCurrentToken(token) ? {} : { bg: 'background.level4', shadow: 'none' }}
          >
            <HStack>
              <TokenIcon address={token.address} chain={chain} size={20} alt={token.symbol} />
              <Text fontSize="sm">{token.symbol}</Text>
            </HStack>
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  )
}
