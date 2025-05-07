'use client'

import { useUserAccount } from '../web3/UserAccountProvider'
import { useBalance, useReadContracts } from 'wagmi'
import { erc20Abi } from 'viem'
import { TokenAmount, TokenBase } from './token.types'
import { Address, formatUnits } from 'viem'
import {
  isLoadingQueries,
  isRefetchingQueries,
  refetchQueries,
} from '@repo/lib/shared/utils/queries'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { PropsWithChildren, createContext, useMemo, useState } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { exclNativeAssetFilter, nativeAssetFilter } from './token.helpers'
import { HumanAmount, Slippage } from '@balancer/sdk'
import { ApiToken } from './token.types'
import { isZero } from '@repo/lib/shared/utils/numbers'

const BALANCE_CACHE_TIME_MS = 30_000

export type UseTokenBalancesResponse = ReturnType<typeof _useTokenBalances>
export const TokenBalancesContext = createContext<UseTokenBalancesResponse | null>(null)

/**
 * @param initTokens If initTokens are provided the tokens state will be managed internally.
 * @param extTokens If extTokens are provided the tokens state will be managed externally.
 * @param bufferPercentage An amount used to reduce the balances of the user's tokens. This is
 * primarily used for forced proportional adds where we need to "reserve"
 * an amount of the user's tokens to ensure the add is successful. In this
 * case the buffer is set to the slippage percentage set by the user.
 */
export function _useTokenBalances(
  initTokens?: ApiToken[],
  extTokens?: ApiToken[],
  bufferPercentage: HumanAmount | string = '0'
) {
  if (!initTokens && !extTokens) throw new Error('initTokens or tokens must be provided')
  if (initTokens && extTokens) throw new Error('initTokens and tokens cannot be provided together')

   
  const [_tokens, _setTokens] = useState<ApiToken[]>(initTokens || [])

  const { userAddress } = useUserAccount()

  const tokens = extTokens || _tokens

  const NO_TOKENS_CHAIN_ID = 1 // this should never be used as the multicall is disabled when no tokens
  const chainId = tokens.length ? tokens[0].chainId : NO_TOKENS_CHAIN_ID
  const networkConfig = getNetworkConfig(chainId)
  const includesNativeAsset = tokens.some(nativeAssetFilter(chainId))
  const tokensExclNativeAsset = tokens.filter(exclNativeAssetFilter(chainId))

  const nativeBalanceQuery = useBalance({
    chainId,
    address: userAddress,
    query: {
      enabled: !!userAddress && includesNativeAsset,
      /*
        Cache without requests in the background
        More info: https://tkdodo.eu/blog/practical-react-query#the-defaults-explained
      */
      staleTime: BALANCE_CACHE_TIME_MS,
    },
  })

  const balanceContractReads = useMemo(() => {
    return tokensExclNativeAsset.map(token => ({
      chainId,
      abi: erc20Abi,
      address: token.address as Address,
      functionName: 'balanceOf',
      args: [(userAddress || '') as Address],
    }))
  }, [tokensExclNativeAsset, userAddress, chainId])

  const tokenBalancesQuery = useReadContracts({
    query: {
      enabled: !!userAddress && tokensExclNativeAsset.length > 0,
      gcTime: BALANCE_CACHE_TIME_MS,
    },
    multicallAddress: networkConfig.contracts.multicall3,
    batchSize: 0, // Remove limit
    allowFailure: true,
    contracts: balanceContractReads,
  })

  async function refetchBalances() {
    if (includesNativeAsset) return refetchQueries(tokenBalancesQuery, nativeBalanceQuery)

    return refetchQueries(tokenBalancesQuery)
  }

  const balances = (tokenBalancesQuery.data || [])
    .map((balance, index) => {
      const token = tokensExclNativeAsset[index]
      if (!token) return

      let amount = balance.status === 'success' ? (balance.result as bigint) : 0n
      const slippage = Slippage.fromPercentage(bufferPercentage as HumanAmount)
      amount = slippage.applyTo(amount, -1)
      if (!isZero(bufferPercentage) && (token.decimals === 6 || token.decimals === 8)) {
        // Apply an extra buffer of 5n to avoid precision issues in tokens with 6/8 decimals
        const extraBuffer = 5n
        amount = amount - extraBuffer
      }

      return {
        chainId,
        address: token.address,
        amount,
        formatted: formatUnits(amount, token.decimals),
        decimals: token.decimals,
      }
    })
    .filter(Boolean) as TokenAmount[]

  if (includesNativeAsset && nativeBalanceQuery.data) {
    balances.push({
      chainId,
      address: networkConfig.tokens.nativeAsset.address,
      amount: nativeBalanceQuery.data.value,
      formatted: formatUnits(
        nativeBalanceQuery.data.value,
        networkConfig.tokens.nativeAsset.decimals
      ),
      decimals: networkConfig.tokens.nativeAsset.decimals,
    })
  }

  function balanceFor(token: TokenBase | string): TokenAmount | undefined {
    const address = typeof token === 'string' ? token : token.address

    return balances.find(balance => isSameAddress(balance.address, address))
  }

  function setTokens(tokens: ApiToken[]) {
    if (extTokens) throw new Error('Cannot set tokens when using external tokens')
    _setTokens(tokens)
  }

  return {
    tokens,
    balances,
    isBalancesLoading: isLoadingQueries(tokenBalancesQuery, nativeBalanceQuery),
    isBalancesRefetching: isRefetchingQueries(tokenBalancesQuery, nativeBalanceQuery),
    setTokens,
    refetchBalances,
    balanceFor,
  }
}

type ProviderProps = PropsWithChildren<{
  initTokens?: ApiToken[]
  extTokens?: ApiToken[]
  bufferPercentage?: HumanAmount | string
}>

export function TokenBalancesProvider({
  initTokens,
  extTokens,
  bufferPercentage,
  children,
}: ProviderProps) {
  const hook = _useTokenBalances(initTokens, extTokens, bufferPercentage)
  return <TokenBalancesContext.Provider value={hook}>{children}</TokenBalancesContext.Provider>
}

export const useTokenBalances = (): UseTokenBalancesResponse =>
  useMandatoryContext(TokenBalancesContext, 'TokenBalances')
