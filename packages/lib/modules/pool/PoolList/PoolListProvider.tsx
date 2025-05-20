'use client'

/* eslint-disable react-hooks/exhaustive-deps */

import { createContext, PropsWithChildren, useEffect, useState } from 'react'
import {
  GetPoolsDocument,
  GqlChain,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { usePoolListQueryState } from './usePoolListQueryState'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { isAddress } from 'viem'
import { PoolDisplayType } from '../pool.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function usePoolListLogic({
  fixedPoolTypes,
  fixedChains,
}: {
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
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
    }
  )

  const pools = loading && previousData ? previousData.pools : data?.pools || []

  const isFixedPoolType = !!fixedPoolTypes && fixedPoolTypes.length > 0

  // If the user has previously selected to filter by their liquidity and then
  // changes their connected wallet, we want to automatically update the filter.
  useEffect(() => {
    if (isAddress(userAddress) && isAddress(queryVariables.where.userAddress || '')) {
      toggleUserAddress(true, userAddress)
    }
  }, [userAddress])

  return {
    pools,
    count: data?.count || previousData?.count,
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
