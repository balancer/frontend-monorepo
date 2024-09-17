import { GqlChain, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { useTokens } from '../../TokensProvider'
import { isSameAddress } from '@/lib/shared/utils/addresses'
import { orderBy } from 'lodash'
import { useTokenBalances } from '../../TokenBalancesProvider'
import { exclNativeAssetFilter, nativeAssetFilter } from '../../token.helpers'
import { useCallback, useMemo } from 'react'

export function useTokenSelectList(
  chain: GqlChain,
  tokens: GqlToken[],
  excludeNativeAsset: boolean,
  pinNativeAsset: boolean,
  searchTerm?: string
) {
  const { usdValueForToken } = useTokens()
  const { balanceFor } = useTokenBalances()

  const symbolMatch = (token: GqlToken, searchTerm: string) =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())

  const nameMatch = (token: GqlToken, searchTerm: string) =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase())

  const getFilteredTokens = useCallback(() => {
    let filteredTokens = tokens

    if (excludeNativeAsset) {
      filteredTokens = filteredTokens.filter(exclNativeAssetFilter(chain))
    }

    if (searchTerm) {
      filteredTokens = filteredTokens.filter(token => {
        return (
          isSameAddress(token.address, searchTerm) ||
          symbolMatch(token, searchTerm) ||
          nameMatch(token, searchTerm)
        )
      })
    }

    return filteredTokens
  }, [excludeNativeAsset, searchTerm, tokens, chain])

  const orderedTokens = useMemo(() => {
    let _tokens = orderBy(
      getFilteredTokens(),
      [
        token => {
          const userBalance = balanceFor(token)
          return userBalance ? Number(usdValueForToken(token, userBalance?.formatted || 0)) : 0
        },
      ],
      ['desc', 'desc']
    )

    if (pinNativeAsset) {
      const nativeAsset = _tokens.find(nativeAssetFilter(chain))

      if (nativeAsset) {
        _tokens = [nativeAsset, ..._tokens.filter(exclNativeAssetFilter(chain))]
      }
    }

    return _tokens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, pinNativeAsset, searchTerm, tokens])

  return {
    orderedTokens,
  }
}
