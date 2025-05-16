/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import {
  GetTokenPricesDocument,
  GetTokenPricesQuery,
  GetTokensDocument,
  GetTokensQuery,
  GetTokensQueryVariables,
  GqlChain,
  GqlToken,
} from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { bn, Numberish } from '@repo/lib/shared/utils/numbers'
import { useQuery } from '@apollo/client'
import { Dictionary, zipObject } from 'lodash'
import { createContext, PropsWithChildren, useCallback } from 'react'
import { Address } from 'viem'
import { useSkipInitialQuery } from '@repo/lib/shared/hooks/useSkipInitialQuery'
import { getNativeAssetAddress, getWrappedNativeAssetAddress } from '@repo/lib/config/app.config'
import { mins } from '@repo/lib/shared/utils/time'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { PoolToken } from '../pool/pool.types'
import { ApiToken } from './token.types'

export type UseTokensResult = ReturnType<typeof useTokensLogic>
export const TokensContext = createContext<UseTokensResult | null>(null)

export type GetTokenFn = (address: string, chain: GqlChain) => ApiToken | undefined

export function useTokensLogic(
  initTokenData: GetTokensQuery,
  initTokenPricesData: GetTokenPricesQuery,
  variables: GetTokensQueryVariables
) {
  const skipQuery = useSkipInitialQuery(variables)
  const pollInterval = mins(3).toMs()

  // skip initial fetch on mount so that initialData is used
  const { data: tokensData } = useQuery(GetTokensDocument, {
    variables,
    skip: skipQuery,
  })
  const {
    data: tokenPricesData,
    loading: isLoadingTokenPrices,
    startPolling,
    stopPolling,
  } = useQuery(GetTokenPricesDocument, {
    variables,
    // The server provides us with an initial data set, but we immediately reload the potentially
    // stale data to ensure the prices we show are up to date. Every 3 mins, we requery token prices
    initialFetchPolicy: 'no-cache',
    nextFetchPolicy: 'cache-and-network',
    pollInterval,
    notifyOnNetworkStatusChange: true,
  })

  const tokens = tokensData?.tokens || initTokenData.tokens
  const prices = tokenPricesData?.tokenPrices || initTokenPricesData.tokenPrices

  /*
    It can return undefined when the token address belongs to a pool token (not included in the provided tokens)
    // TODO: should we avoid calling getToken with pool tokens?
   */
  function getToken(address: string, chain: GqlChain | number): ApiToken | undefined {
    const chainKey = typeof chain === 'number' ? 'chainId' : 'chain'
    return tokens.find(token => isSameAddress(token.address, address) && token[chainKey] === chain)
  }

  function getNativeAssetToken(chain: GqlChain | number) {
    return getToken(getNativeAssetAddress(chain), chain)
  }

  function getWrappedNativeAssetToken(chain: GqlChain | number) {
    return getToken(getWrappedNativeAssetAddress(chain), chain)
  }

  const getTokensByChain = useCallback(
    (chain: number | GqlChain): GqlToken[] => {
      const chainKey = typeof chain === 'number' ? 'chainId' : 'chain'
      return tokens.filter(token => token[chainKey] === chain)
    },
    [tokens]
  )

  const getPricesForChain = useCallback(
    (chain: GqlChain): GetTokenPricesQuery['tokenPrices'] => {
      return prices.filter(price => price.chain === chain)
    },
    [prices]
  )

  function getTokensByTokenAddress(
    tokenAddresses: Address[],
    chain: GqlChain
  ): Dictionary<GqlToken> {
    return zipObject(
      tokenAddresses,
      tokenAddresses.map(t => getToken(t, chain) as GqlToken)
    )
  }

  function priceForToken(token: ApiToken): number {
    const price = getPricesForChain(token.chain).find(price =>
      isSameAddress(price.address, token.address)
    )
    if (!price) return 0

    return price.price
  }

  // this also fetches the price for a bpt
  function priceForAddress(address: string, chain: GqlChain): number {
    const price = getPricesForChain(chain).find(price => isSameAddress(price.address, address))
    if (!price) return 0

    return price.price
  }

  function usdValueForToken(token: ApiToken | undefined, amount: Numberish) {
    if (!token) return '0'
    if (amount === '') return '0'
    return bn(amount).times(priceForToken(token)).toFixed()
  }

  function usdValueForBpt(address: string, chain: GqlChain, amount: Numberish) {
    if (amount === '') return '0'
    return bn(amount).times(priceFor(address, chain)).toFixed()
  }

  function priceFor(address: string, chain: GqlChain): number {
    const token = getToken(address, chain)

    if (token) {
      return priceForToken(token)
    } else {
      return priceForAddress(address, chain)
    }
  }

  const calcWeightForBalance = useCallback(
    (
      tokenAddress: Address | string,
      tokenBalance: string,
      totalLiquidity: string,
      chain: GqlChain
    ): string => {
      const tokenPrice = priceFor(tokenAddress, chain)

      return bn(tokenPrice).times(tokenBalance).div(totalLiquidity).toString()
    },
    []
  )

  const calcTotalUsdValue = useCallback((poolTokens: PoolToken[], chain: GqlChain) => {
    return poolTokens
      .reduce((total, token) => {
        return total.plus(bn(priceFor(token.address, chain)).times(token.balance))
      }, bn(0))
      .toString()
  }, [])

  const vebalBptToken = tokens.find(
    t => t.address === mainnetNetworkConfig.tokens.addresses.veBalBpt
  )

  return {
    tokens,
    prices,
    isLoadingTokenPrices,
    getToken,
    getNativeAssetToken,
    getWrappedNativeAssetToken,
    priceFor,
    priceForToken,
    getTokensByChain,
    getTokensByTokenAddress,
    usdValueForToken,
    calcWeightForBalance,
    calcTotalUsdValue,
    startTokenPricePolling: () => startPolling(pollInterval),
    stopTokenPricePolling: stopPolling,
    priceForAddress,
    usdValueForBpt,
    vebalBptToken,
  }
}

export function TokensProvider({
  children,
  tokensData,
  tokenPricesData,
  variables,
}: PropsWithChildren & {
  tokensData: GetTokensQuery
  tokenPricesData: GetTokenPricesQuery
  variables: GetTokensQueryVariables
}) {
  const tokens = useTokensLogic(tokensData, tokenPricesData, variables)

  return <TokensContext.Provider value={tokens}>{children}</TokensContext.Provider>
}

export const useTokens = (): UseTokensResult => useMandatoryContext(TokensContext, 'Tokens')
