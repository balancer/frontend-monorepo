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
  _hideProtocolVersion,
  _hidePoolTypes,
  _hidePoolTags,
}: {
  fixedPoolTypes?: GqlPoolType[]
  _displayType?: PoolListDisplayType
  _hideProtocolVersion?: string[]
  _hidePoolTypes?: GqlPoolType[]
  _hidePoolTags?: string[]
} = {}) {
  const queryState = usePoolListQueryState()
  const { userAddress } = useUserAccount()

  // set options
  const [displayType, setDisplayType] = useState<PoolListDisplayType>(
    PoolListDisplayType.TokenPills
  )

  const [hideProtocolVersion, setHideProtocolVersion] = useState<string[]>([])
  const [hidePoolTypes, setHidePoolTypes] = useState<GqlPoolType[]>([])
  const [hidePoolTags, setHidePoolTags] = useState<string[]>([])

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
    if (_hideProtocolVersion) {
      setHideProtocolVersion(_hideProtocolVersion)
    }
  }, [_hideProtocolVersion])

  useEffect(() => {
    if (_hidePoolTypes) {
      setHidePoolTypes(_hidePoolTypes)
    }
  }, [_hidePoolTypes])

  useEffect(() => {
    if (_hidePoolTags) {
      setHidePoolTags(_hidePoolTags)
    }
  }, [_hidePoolTags])

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
    hideProtocolVersion,
    setHideProtocolVersion,
    hidePoolTypes,
    setHidePoolTypes,
    hidePoolTags,
    setHidePoolTags,
  }
}

export const PoolListContext = createContext<ReturnType<typeof _usePoolList> | null>(null)

export function PoolListProvider({
  fixedPoolTypes,
  displayType,
  hideProtocolVersion,
  hidePoolTypes,
  hidePoolTags,
  children,
}: PropsWithChildren<{
  fixedPoolTypes?: GqlPoolType[]
  displayType?: PoolListDisplayType
  hideProtocolVersion?: string[]
  hidePoolTypes?: GqlPoolType[]
  hidePoolTags?: string[]
}>) {
  const hook = _usePoolList({
    fixedPoolTypes,
    _displayType: displayType,
    _hideProtocolVersion: hideProtocolVersion,
    _hidePoolTypes: hidePoolTypes,
    _hidePoolTags: hidePoolTags,
  })

  return <PoolListContext.Provider value={hook}>{children}</PoolListContext.Provider>
}

export function usePoolList() {
  return useMandatoryContext(PoolListContext, 'PoolList')
}
