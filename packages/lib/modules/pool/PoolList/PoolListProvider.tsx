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
import { isAddress } from 'viem'
import { PoolDisplayType } from '../pool.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { removeHookDataFromPoolIfNecessary } from '../pool.utils'
import { PoolListItem } from '../pool.types'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { useTokens } from '../../tokens/TokensProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useWalletTokenBalances } from '../../tokens/useWalletTokenBalances'

export function usePoolListLogic({
  fixedPoolTypes,
  fixedChains,
}: {
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
} = {}) {
  const queryState = usePoolListQueryState()
  const { userAddress, isConnected } = useUserAccount()
  const apolloClient = useApolloClient()
  const { isLoadingTokens, isLoadingTokenPrices } = useTokens()
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

  const selectedChains = variables.where.chainIn || []
  const joinableChains = selectedChains.filter(chain => chain !== GqlChain.Sepolia)

  const {
    tokenBalancesByChain: walletTokenAddressesByChain,
    isLoading: isWalletBalancesLoading,
    errors: walletBalanceErrors,
    hasBalance: hasWalletTokenBalance,
  } = useWalletTokenBalances(joinableChains, joinablePools)

  const joinablePoolsQuery = useReactQuery({
    queryKey: [
      'pool-list-joinable-pools',
      joinableChains.join(','),
      joinableChains
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
      const chainsWithTokens = joinableChains
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
      joinableChains.some(chain => (walletTokenAddressesByChain.get(chain) || []).length > 0),
    staleTime: 30_000,
  })

  const joinablePoolsData = useMemo(() => {
    if (!joinablePools || !isConnected || !isAddress(userAddress)) return poolsData
    if (walletBalanceErrors.length > 0) return poolsData

    const allJoinablePools = joinablePoolsQuery.data || []
    const uniquePools = new Map<string, PoolListItem>()

    allJoinablePools.forEach(pool => {
      if (!uniquePools.has(pool.id)) {
        uniquePools.set(pool.id, removeHookDataFromPoolIfNecessary(pool) as PoolListItem)
      }
    })

    return Array.from(uniquePools.values()).sort((a, b) => {
      return bn(b.dynamicData.totalLiquidity).comparedTo(bn(a.dynamicData.totalLiquidity)) ?? 0
    })
  }, [
    joinablePools,
    poolsData,
    isConnected,
    userAddress,
    joinablePoolsQuery.data,
    walletBalanceErrors,
  ])

  const isJoinableBalanceLoading =
    joinablePools &&
    (isLoadingTokens ||
      isLoadingTokenPrices ||
      isWalletBalancesLoading ||
      joinablePoolsQuery.isLoading ||
      joinablePoolsQuery.isFetching)

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
    loading: loading || isJoinableBalanceLoading,
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
