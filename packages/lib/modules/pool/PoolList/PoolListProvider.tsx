'use client'

import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import {
  GetPoolsDocument,
  GqlChain,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useApolloClient, useQuery } from '@apollo/client/react'
import { usePoolListQueryState } from './usePoolListQueryState'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { Address, erc20Abi, formatUnits, isAddress } from 'viem'
import { PoolDisplayType } from '../pool.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { removeHookDataFromPoolIfNecessary } from '../pool.utils'
import { PoolListItem } from '../pool.types'
import {
  getNativeAssetAddress,
  getNetworkConfig,
  getWrappedNativeAssetAddress,
} from '@repo/lib/config/app.config'
import { useConfig } from 'wagmi'
import { getBalance, multicall } from 'wagmi/actions'
import { useQueries, useQuery as useReactQuery } from '@tanstack/react-query'
import { includesAddress } from '@repo/lib/shared/utils/addresses'
import { useTokens } from '../../tokens/TokensProvider'
import { bn } from '@repo/lib/shared/utils/numbers'

export function usePoolListLogic({
  fixedPoolTypes,
  fixedChains,
}: {
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
} = {}) {
  const queryState = usePoolListQueryState()
  const { userAddress, isConnected } = useUserAccount()
  const config = useConfig()
  const apolloClient = useApolloClient()
  const { getTokensByChain, priceFor, isLoadingTokens, isLoadingTokenPrices } = useTokens()
  const [poolDisplayType, setPoolDisplayType] = useState<PoolDisplayType>(
    PROJECT_CONFIG.options.poolDisplayType
  )

  const { queryVariables, toggleUserAddress, joinablePools } = queryState

  const variables = {
    ...queryVariables,
    where: {
      ...queryVariables.where,
      poolTypeIn: fixedPoolTypes || queryVariables.where.poolTypeIn,
      chainIn: fixedChains || queryVariables.where.chainIn,
    },
  }

  const { data, loading, previousData, refetch, networkStatus, error } = useQuery(
    GetPoolsDocument,
    {
      variables,
    }
  )

  const pools = loading && previousData ? previousData.pools : data?.pools || []

  const poolsData = pools.map(pool => removeHookDataFromPoolIfNecessary(pool)) as PoolListItem[]

  const selectedChains = useMemo(() => {
    return variables.where.chainIn || []
  }, [variables.where.chainIn])

  const walletBalanceQueries = useQueries({
    queries: selectedChains.map(chain => {
      const networkConfig = getNetworkConfig(chain)
      const chainTokens = getTokensByChain(chain)
      const nativeAddress = getNativeAssetAddress(chain)
      const erc20Tokens = chainTokens.filter(
        token => !includesAddress([nativeAddress], token.address)
      )

      return {
        queryKey: [
          'pool-list-wallet-balances',
          chain,
          userAddress,
          erc20Tokens.length,
          chainTokens.length,
        ],
        queryFn: async () => {
          const nativeBalance = await getBalance(config, {
            chainId: networkConfig.chainId,
            address: userAddress as Address,
          })

          const contracts = erc20Tokens.map(token => ({
            chainId: networkConfig.chainId,
            abi: erc20Abi,
            address: token.address as Address,
            functionName: 'balanceOf',
            args: [userAddress as Address],
          }))

          const tokenBalances =
            contracts.length > 0
              ? await multicall(config, {
                  chainId: networkConfig.chainId,
                  contracts,
                  allowFailure: true,
                  batchSize: 0,
                })
              : []

          return {
            nativeBalance,
            tokenBalances,
            erc20Tokens,
          }
        },
        enabled:
          joinablePools &&
          isConnected &&
          isAddress(userAddress) &&
          !isLoadingTokens &&
          selectedChains.length > 0,
        staleTime: 30_000,
      }
    }),
  })

  const walletTokenAddressesByChain = useMemo(() => {
    const addressesByChain = new Map<GqlChain, string[]>()
    if (!joinablePools) return addressesByChain

    selectedChains.forEach((chain, index) => {
      const query = walletBalanceQueries[index]
      if (!query?.data) return

      const currentAddresses: string[] = []
      const nativeAddress = getNativeAssetAddress(chain)
      const wrappedNativeAddress = getWrappedNativeAssetAddress(chain)
      const nativeDecimals = query.data.nativeBalance.decimals
      const nativePrice = priceFor(nativeAddress, chain)
      const nativeBalanceUsd = bn(
        formatUnits(query.data.nativeBalance.value, nativeDecimals)
      ).times(nativePrice)

      if (nativeBalanceUsd.gte(1)) {
        currentAddresses.push(nativeAddress, wrappedNativeAddress)
      }

      query.data.erc20Tokens.forEach((token, tokenIndex) => {
        const balanceResult = query.data.tokenBalances[tokenIndex]
        if (balanceResult?.status !== 'success') return

        const amount = balanceResult.result as bigint
        if (amount <= 0n) return

        const usdValue = bn(formatUnits(amount, token.decimals)).times(
          priceFor(token.address, chain)
        )
        if (usdValue.gte(1) && !includesAddress(currentAddresses, token.address)) {
          currentAddresses.push(token.address)
        }
      })

      if (currentAddresses.length > 0) {
        addressesByChain.set(chain, currentAddresses)
      }
    })

    return addressesByChain
  }, [joinablePools, selectedChains, walletBalanceQueries, priceFor])

  const joinablePoolsQuery = useReactQuery({
    queryKey: [
      'pool-list-joinable-pools',
      selectedChains.join(','),
      selectedChains
        .map(chain => `${chain}:${(walletTokenAddressesByChain.get(chain) || []).join(',')}`)
        .join('|'),
      queryVariables.first,
      queryVariables.skip,
      queryVariables.orderBy,
      queryVariables.orderDirection,
      queryVariables.textSearch || '',
      queryVariables.where.protocolVersionIn?.join(',') || '',
      queryVariables.where.poolTypeIn?.join(',') || '',
      queryVariables.where.poolTypeNotIn?.join(',') || '',
      queryVariables.where.tagIn?.join(',') || '',
      queryVariables.where.tagNotIn?.join(',') || '',
    ],
    queryFn: async () => {
      const chainsWithTokens = selectedChains
        .map(chain => ({
          chain,
          tokensIn: (walletTokenAddressesByChain.get(chain) || []).map(address =>
            address.toLowerCase()
          ),
        }))
        .filter(({ tokensIn }) => tokensIn.length > 0)

      const results = await Promise.allSettled(
        chainsWithTokens.map(async ({ chain, tokensIn }) => {
          const response = await apolloClient.query({
            query: GetPoolsDocument,
            variables: {
              ...queryVariables,
              where: {
                ...queryVariables.where,
                chainIn: [chain],
                tokensIn,
                minTvl: 50_000,
              },
            },
          })

          return response.data?.pools || []
        })
      )

      return results.flatMap(result => (result.status === 'fulfilled' ? result.value : []))
    },
    enabled:
      joinablePools &&
      isConnected &&
      isAddress(userAddress) &&
      !isLoadingTokens &&
      !isLoadingTokenPrices &&
      selectedChains.some(chain => (walletTokenAddressesByChain.get(chain) || []).length > 0),
    staleTime: 30_000,
  })

  const joinablePoolsData = useMemo(() => {
    if (!joinablePools || !isConnected || !isAddress(userAddress)) return poolsData
    if (walletBalanceQueries.some(query => query.isError)) return poolsData

    const allJoinablePools = joinablePoolsQuery.data || []
    const uniquePools = new Map<string, PoolListItem>()

    allJoinablePools.forEach(pool => {
      if (!uniquePools.has(pool.id)) {
        uniquePools.set(pool.id, removeHookDataFromPoolIfNecessary(pool) as PoolListItem)
      }
    })

    return Array.from(uniquePools.values())
  }, [
    joinablePools,
    poolsData,
    isConnected,
    userAddress,
    joinablePoolsQuery.data,
    walletBalanceQueries,
  ])

  const isJoinableBalanceLoading =
    joinablePools &&
    (isLoadingTokens ||
      isLoadingTokenPrices ||
      walletBalanceQueries.some(query => query.isLoading || query.isFetching) ||
      joinablePoolsQuery.isLoading ||
      joinablePoolsQuery.isFetching)

  function hasWalletTokenBalance(chain: GqlChain, tokenAddress: string) {
    if (!tokenAddress) return false

    const tokenAddresses = walletTokenAddressesByChain.get(chain) || []
    return includesAddress(tokenAddresses, tokenAddress)
  }

  const filteredPools = joinablePools
    ? isJoinableBalanceLoading
      ? poolsData
      : joinablePoolsData
    : poolsData

  const isFixedPoolType = !!fixedPoolTypes && fixedPoolTypes.length > 0

  // If the user has previously selected to filter by their liquidity and then
  // changes their connected wallet, we want to automatically update the filter.
  useEffect(() => {
    if (isAddress(userAddress) && isAddress(queryVariables.where.userAddress || '')) {
      toggleUserAddress(true, userAddress)
    }
  }, [userAddress])

  return {
    pools: filteredPools,
    count: joinablePools ? filteredPools.length : data?.count || previousData?.count,
    queryState,
    loading: loading || (joinablePools && isJoinableBalanceLoading),
    error,
    networkStatus,
    isFixedPoolType,
    hasWalletTokenBalance,
    refetch,
    poolDisplayType,
    setPoolDisplayType,
  }
}

export const PoolListContext = createContext<ReturnType<typeof usePoolListLogic> | null>(null)

export function PoolListProvider({
  fixedPoolTypes,
  fixedChains,
  children,
}: PropsWithChildren<{
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
}>) {
  const hook = usePoolListLogic({
    fixedPoolTypes,
    fixedChains,
  })

  return <PoolListContext.Provider value={hook}>{children}</PoolListContext.Provider>
}

export function usePoolList() {
  return useMandatoryContext(PoolListContext, 'PoolList')
}
