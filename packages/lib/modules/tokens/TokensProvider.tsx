'use client'

import {
  GetTokenPricesDocument,
  GetTokensDocument,
  GqlChain,
  GqlToken,
} from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { bn, Numberish } from '@repo/lib/shared/utils/numbers'
import { useQuery } from '@apollo/client'
import { createContext, PropsWithChildren, useCallback } from 'react'
import { Address } from 'viem'
import {
  getNativeAssetAddress,
  getWrappedNativeAssetAddress,
  isDev,
  shouldUseAnvilFork,
} from '@repo/lib/config/app.config'
import { mins } from '@repo/lib/shared/utils/time'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { PoolToken } from '../pool/pool.types'
import { ApiToken, ApiOrCustomToken } from './token.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export type UseTokensResult = ReturnType<typeof useTokensLogic>
export const TokensContext = createContext<UseTokensResult | null>(null)

export type GetTokenFn = (address: string, chain: GqlChain) => ApiToken | undefined

const POLL_INTERVAL = mins(3).toMs()
const SUPPORTED_CHAINS = {
  chains: PROJECT_CONFIG.supportedNetworks,
}

export function useTokensLogic() {
  const { data: tokensData, loading: isLoadingTokens } = useQuery(GetTokensDocument, {
    variables: SUPPORTED_CHAINS,
  })
  const tokens = tokensData?.tokens || []

  const {
    data: tokenPricesData,
    loading: isLoadingTokenPrices,
    startPolling,
    stopPolling,
  } = useQuery(GetTokenPricesDocument, {
    variables: SUPPORTED_CHAINS,
    /*
      FIXME: if we use initialFetchPolicy: no-cache in development, the query never finishes (isLoadingTokenPrices is always true)

      This started happening after @apollo/client v3.13.6
      https://github.com/apollographql/apollo-client/blob/main/CHANGELOG.md#3136

      Using undefined is a workaround to avoid the issue in development, but it should be understood and fixed properly
    */
    initialFetchPolicy: isDev ? undefined : 'no-cache',
    nextFetchPolicy: 'cache-and-network',
    pollInterval: POLL_INTERVAL,
    notifyOnNetworkStatusChange: true,
  })
  const prices = tokenPricesData?.tokenPrices || []

  const getToken = (address: string, chain: GqlChain | number): ApiToken | undefined => {
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
      const result = tokens.filter(token => token[chainKey] === chain)
      // Limit to 10 tokens in Anvil fork to avoid Swap performance issues
      return shouldUseAnvilFork ? result.slice(0, 10) : result
    },
    [tokens]
  )

  function usdValueForToken(token: ApiOrCustomToken | undefined, amount: Numberish) {
    if (!token) return '0'
    if (amount === '') return '0'
    return bn(amount)
      .times(priceFor(token.address as Address, token.chain))
      .toFixed()
  }

  function usdValueForTokenAddress(
    address: string,
    chain: GqlChain,
    amount: Numberish,
    customUsdPrice?: string
  ) {
    if (amount === '') return '0'
    return bn(amount)
      .times(customUsdPrice || priceFor(address, chain))
      .toFixed()
  }

  const priceFor = (address: string, chain: GqlChain): number => {
    const chainPrices = prices.filter(price => price.chain === chain)
    const price = chainPrices.find(price => isSameAddress(price.address, address))
    if (!price) return 0

    return price.price
  }

  const calcWeightForBalance = (
    tokenAddress: Address | string,
    tokenBalance: string,
    totalLiquidity: string,
    chain: GqlChain
  ): string => {
    const tokenPrice = priceFor(tokenAddress, chain)

    return bn(tokenPrice).times(tokenBalance).div(totalLiquidity).toString()
  }

  const calcTotalUsdValue = useCallback(
    (poolTokens: PoolToken[], chain: GqlChain) => {
      return poolTokens
        .reduce((total, token) => {
          return total.plus(bn(priceFor(token.address, chain)).times(token.balance))
        }, bn(0))
        .toString()
    },
    [priceFor]
  )

  const vebalBptToken = tokens.find(
    t => t.address === mainnetNetworkConfig.tokens.addresses.veBalBpt
  )

  return {
    tokens,
    prices,
    isLoadingTokenPrices,
    isLoadingTokens,
    getToken,
    getNativeAssetToken,
    getWrappedNativeAssetToken,
    priceFor,
    getTokensByChain,
    usdValueForToken,
    usdValueForTokenAddress,
    calcWeightForBalance,
    calcTotalUsdValue,
    startTokenPricePolling: () => startPolling(POLL_INTERVAL),
    stopTokenPricePolling: stopPolling,
    vebalBptToken,
  }
}

export function TokensProvider({ children }: PropsWithChildren) {
  const tokens = useTokensLogic()

  return <TokensContext.Provider value={tokens}>{children}</TokensContext.Provider>
}

export const useTokens = (): UseTokensResult => useMandatoryContext(TokensContext, 'Tokens')
