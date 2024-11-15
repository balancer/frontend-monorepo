/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { GetPoolsDocument, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { usePoolListQueryState } from './usePoolListQueryState'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { isAddress } from 'viem'
import { PoolListDisplayType } from '../pool.types'

export function _usePoolList({
  fixedPoolTypes,
  _displayType,
  _filterProtocolVersion,
}: {
  fixedPoolTypes?: GqlPoolType[]
  _displayType?: PoolListDisplayType
  _filterProtocolVersion?: string[]
} = {}) {
  const queryState = usePoolListQueryState()
  const { userAddress } = useUserAccount()

  // set options
  const [displayType, setDisplayType] = useState<PoolListDisplayType>(
    PoolListDisplayType.TokenPills
  )

  const [filterProtocolVersion, setFilterProtocolVersion] = useState<string[]>([])

  const { queryVariables, toggleUserAddress } = queryState

  const variables = {
    ...queryVariables,
    where: {
      ...queryVariables.where,
      poolTypeIn: fixedPoolTypes || queryVariables.where.poolTypeIn,
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

  useEffect(() => {
    if (_displayType) {
      setDisplayType(_displayType)
    }
  }, [_displayType])

  useEffect(() => {
    if (_filterProtocolVersion) {
      setFilterProtocolVersion(_filterProtocolVersion)
    }
  }, [_filterProtocolVersion])

  return {
    pools,
    count: data?.count || previousData?.count,
    queryState,
    loading,
    error,
    networkStatus,
    isFixedPoolType,
    refetch,
    displayType,
    setDisplayType,
    filterProtocolVersion,
    setFilterProtocolVersion,
  }
}

export const PoolListContext = createContext<ReturnType<typeof _usePoolList> | null>(null)

export function PoolListProvider({
  fixedPoolTypes,
  displayType,
  filterProtocolVersion,
  children,
}: PropsWithChildren<{
  fixedPoolTypes?: GqlPoolType[]
  displayType?: PoolListDisplayType
  filterProtocolVersion?: string[]
}>) {
  const hook = _usePoolList({
    fixedPoolTypes,
    _displayType: displayType,
    _filterProtocolVersion: filterProtocolVersion,
  })

  return <PoolListContext.Provider value={hook}>{children}</PoolListContext.Provider>
}

export function usePoolList() {
  return useMandatoryContext(PoolListContext, 'PoolList')
}
