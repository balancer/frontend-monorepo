'use client'

import { GqlPoolOrderBy } from '@repo/lib/shared/services/api/generated/graphql'
import { useEffect, useRef } from 'react'
import { usePoolList } from './PoolListProvider'

const defaultOrderBy = [GqlPoolOrderBy.TotalLiquidity, GqlPoolOrderBy.Volume24h, GqlPoolOrderBy.Apr]

export function usePoolOrderByState() {
  const {
    queryState: { sorting, setSorting, userAddress },
  } = usePoolList()

  const includeUserBalance = !!userAddress

  const orderBy = includeUserBalance
    ? [GqlPoolOrderBy.UserbalanceUsd, ...defaultOrderBy]
    : defaultOrderBy

  const sortingRef = useRef(sorting)

  useEffect(() => {
    sortingRef.current = sorting
  }, [sorting])

  useEffect(() => {
    const current = sortingRef.current[0]

    if (includeUserBalance) {
      if (current?.id !== GqlPoolOrderBy.UserbalanceUsd) {
        setSorting([{ id: GqlPoolOrderBy.UserbalanceUsd, desc: true }])
      }
    } else if (current?.id === GqlPoolOrderBy.UserbalanceUsd) {
      setSorting([{ id: GqlPoolOrderBy.TotalLiquidity, desc: true }])
    }
  }, [includeUserBalance, setSorting])

  return {
    orderBy,
  }
}
