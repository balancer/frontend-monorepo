'use client'

import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import {
  GetPoolsDocument,
  GqlChain,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client/react'
import { usePoolListQueryState } from './usePoolListQueryState'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { Address, erc20Abi, isAddress } from 'viem'
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
import { useQueries } from '@tanstack/react-query'
import { includesAddress } from '@repo/lib/shared/utils/addresses'

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

  const poolChains = useMemo(() => {
    return Array.from(new Set(poolsData.map(pool => pool.chain)))
  }, [poolsData])

  const nativeBalanceQueries = useQueries({
    queries: poolChains.map(chain => {
      const networkConfig = getNetworkConfig(chain)

      return {
        queryKey: ['pool-list-native-balance', chain, userAddress],
        queryFn: async () =>
          getBalance(config, {
            chainId: networkConfig.chainId,
            address: userAddress as Address,
          }),
        enabled: joinablePools && isConnected && isAddress(userAddress),
        staleTime: 30_000,
      }
    }),
  })

  const chainsWithNativeBalance = useMemo(() => {
    const chains = new Set<GqlChain>()

    nativeBalanceQueries.forEach((query, index) => {
      if ((query.data?.value || 0n) > 0n) {
        const chain = poolChains[index]
        if (chain) chains.add(chain)
      }
    })

    return chains
  }, [nativeBalanceQueries, poolChains])

  const tokenAddressesByChain = useMemo(() => {
    const addressesByChain = new Map<GqlChain, string[]>()

    poolsData.forEach(pool => {
      if (!chainsWithNativeBalance.has(pool.chain)) return

      const currentAddresses = addressesByChain.get(pool.chain) || []

      pool.poolTokens.forEach(token => {
        if (token.address && !includesAddress(currentAddresses, token.address)) {
          currentAddresses.push(token.address)
        }
      })

      addressesByChain.set(pool.chain, currentAddresses)
    })

    return addressesByChain
  }, [poolsData, chainsWithNativeBalance])

  const tokenBalanceQueries = useQueries({
    queries: poolChains.map(chain => {
      const networkConfig = getNetworkConfig(chain)
      const tokenAddresses = tokenAddressesByChain.get(chain) || []

      return {
        queryKey: ['pool-list-token-balances', chain, userAddress, tokenAddresses.join(',')],
        queryFn: async () => {
          const contracts = tokenAddresses.map(tokenAddress => ({
            chainId: networkConfig.chainId,
            abi: erc20Abi,
            address: tokenAddress as Address,
            functionName: 'balanceOf',
            args: [userAddress as Address],
          }))

          return multicall(config, {
            chainId: networkConfig.chainId,
            contracts,
            allowFailure: true,
            batchSize: 0,
          })
        },
        enabled:
          joinablePools &&
          isConnected &&
          isAddress(userAddress) &&
          chainsWithNativeBalance.has(chain) &&
          tokenAddresses.length > 0,
        staleTime: 30_000,
      }
    }),
  })

  const walletTokenAddressesByChain = useMemo(() => {
    const addressesByChain = new Map<GqlChain, string[]>()

    poolChains.forEach((chain, index) => {
      if (!chainsWithNativeBalance.has(chain)) return

      const tokenAddresses = tokenAddressesByChain.get(chain) || []
      const tokenBalances = tokenBalanceQueries[index]?.data || []
      const heldTokenAddresses = tokenAddresses.filter((tokenAddress, tokenIndex) => {
        const balanceResult = tokenBalances[tokenIndex]

        return balanceResult?.status === 'success' && (balanceResult.result as bigint) > 0n
      })

      // Apply native/wrapped equivalence for pool-token matching.
      heldTokenAddresses.push(getNativeAssetAddress(chain), getWrappedNativeAssetAddress(chain))
      addressesByChain.set(chain, heldTokenAddresses)
    })

    return addressesByChain
  }, [poolChains, chainsWithNativeBalance, tokenAddressesByChain, tokenBalanceQueries])

  const joinablePoolsData = useMemo(() => {
    if (!joinablePools || !isConnected || !isAddress(userAddress)) return poolsData

    return poolsData.filter(pool => {
      const tokenAddresses = walletTokenAddressesByChain.get(pool.chain) || []
      return pool.poolTokens.some(poolToken => includesAddress(tokenAddresses, poolToken.address))
    })
  }, [joinablePools, poolsData, isConnected, userAddress, walletTokenAddressesByChain])

  const isJoinableBalanceLoading =
    joinablePools &&
    (nativeBalanceQueries.some(query => query.isLoading || query.isFetching) ||
      tokenBalanceQueries.some(query => query.isLoading || query.isFetching))

  const filteredPools = isJoinableBalanceLoading ? poolsData : joinablePoolsData

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
