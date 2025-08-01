import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokens } from '../../TokensProvider'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { orderBy } from 'lodash'
import { useTokenBalances } from '../../TokenBalancesProvider'
import { exclNativeAssetFilter, nativeAssetFilter } from '../../token.helpers'
import { useCallback, useMemo } from 'react'
import { ApiToken } from '../../token.types'

export function useTokenSelectList(
  chain: GqlChain,
  tokens: ApiToken[],
  excludeNativeAsset: boolean,
  pinNativeAsset: boolean,
  searchTerm?: string
) {
  const { usdValueForToken } = useTokens()
  const { balanceFor } = useTokenBalances()

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

function symbolMatch(token: ApiToken, searchTerm: string) {
  return normalize(token.symbol).includes(normalize(searchTerm))
}

function nameMatch(token: ApiToken, searchTerm: string) {
  return normalize(token.name).includes(normalize(searchTerm))
}

function normalize(term: string) {
  return term.toLowerCase().replaceAll('₮', 't')
}
