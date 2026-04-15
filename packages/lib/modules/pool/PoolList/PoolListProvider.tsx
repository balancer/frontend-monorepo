'use client'

import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import {
  GetPoolsDocument,
  GqlChain,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery, useReadQuery } from '@apollo/client/react'
import type { QueryRef } from '@apollo/client/react'
import { usePoolListQueryState } from './usePoolListQueryState'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { isAddress } from 'viem'
import { PoolDisplayType } from '../pool.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { removeHookDataFromPoolIfNecessary } from '../pool.utils'
import { PoolListItem } from '../pool.types'
import { poolListDefaultVariables } from './poolListDefaultVariables'

// useReadQuery must always be called (rules of hooks), but we only use its data
// when variables match the preloaded defaults
const DUMMY_QUERY_REF = {} as QueryRef<any>

export function usePoolListLogic({
  fixedPoolTypes,
  fixedChains,
  initialQueryRef,
}: {
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
  initialQueryRef?: QueryRef<any, any>
} = {}) {
  const queryState = usePoolListQueryState()
  const { userAddress } = useUserAccount()
  const [poolDisplayType, setPoolDisplayType] = useState<PoolDisplayType>(
    PROJECT_CONFIG.options.poolDisplayType
  )

  const { queryVariables, toggleUserAddress } = queryState

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
      fetchPolicy: 'cache-and-network',
    }
  )

  const isDefaultQuery = useMemo(
    () => JSON.stringify(variables) === JSON.stringify(poolListDefaultVariables),
    [variables]
  )

  // Hooks must always be called — pass a dummy ref when not available
  const preloadedResult = useReadQuery(initialQueryRef ?? DUMMY_QUERY_REF)
  const preloadedData = initialQueryRef && isDefaultQuery ? preloadedResult.data : null

  const pools =
    loading && previousData ? previousData.pools : data?.pools || (preloadedData?.pools ?? [])

  const poolsData = pools.map((pool: any) =>
    removeHookDataFromPoolIfNecessary(pool)
  ) as PoolListItem[]

  const isFixedPoolType = !!fixedPoolTypes && fixedPoolTypes.length > 0

  // If the user has previously selected to filter by their liquidity and then
  // changes their connected wallet, we want to automatically update the filter.
  useEffect(() => {
    if (isAddress(userAddress) && isAddress(queryVariables.where.userAddress || '')) {
      toggleUserAddress(true, userAddress)
    }
  }, [userAddress])

  return {
    pools: poolsData,
    count: data?.count || previousData?.count || (preloadedData?.count ?? 0),
    queryState,
    loading,
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
  initialQueryRef,
  children,
}: PropsWithChildren<{
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
  initialQueryRef?: QueryRef<any, any>
}>) {
  const hook = usePoolListLogic({
    fixedPoolTypes,
    fixedChains,
    initialQueryRef,
  })

  return <PoolListContext.Provider value={hook}>{children}</PoolListContext.Provider>
}

export function usePoolList() {
  return useMandatoryContext(PoolListContext, 'PoolList')
}
