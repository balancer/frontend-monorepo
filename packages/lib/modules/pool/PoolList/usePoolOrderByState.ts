'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import { GqlPoolOrderBy } from '@repo/lib/shared/services/api/generated/graphql'
import { useState, useEffect } from 'react'
import { usePoolList } from './PoolListProvider'

const defaultOrderBy = [GqlPoolOrderBy.TotalLiquidity, GqlPoolOrderBy.Volume24h, GqlPoolOrderBy.Apr]

export function usePoolOrderByState() {
  const {
    queryState: { sorting, setSorting, userAddress },
  } = usePoolList()
  const [orderBy, setOrderBy] = useState(defaultOrderBy)

  useEffect(() => {
    if (userAddress) {
      setOrderBy([GqlPoolOrderBy.UserbalanceUsd, ...defaultOrderBy])
      setSorting([{ id: GqlPoolOrderBy.UserbalanceUsd, desc: true }])
    } else {
      setOrderBy(orderBy.filter(item => item !== GqlPoolOrderBy.UserbalanceUsd))
      if (sorting[0]?.id === GqlPoolOrderBy.UserbalanceUsd) {
        setSorting([{ id: GqlPoolOrderBy.TotalLiquidity, desc: true }])
      }
    }
  }, [userAddress])

  return {
    orderBy,
  }
}
