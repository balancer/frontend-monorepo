'use client'

import { GqlPoolOrderByValues } from '@repo/lib/shared/services/api/generated/graphql-enums'
import { useEffect, useRef } from 'react'
import { usePoolList } from './PoolListProvider'

const defaultOrderBy = [
  GqlPoolOrderByValues.TotalLiquidity,
  GqlPoolOrderByValues.Volume24h,
  GqlPoolOrderByValues.Apr,
]

export function usePoolOrderByState() {
  const {
    queryState: { sorting, setSorting, userAddress },
  } = usePoolList()

  const includeUserBalance = !!userAddress

  const orderBy = includeUserBalance
    ? [GqlPoolOrderByValues.UserBalanceUsd, ...defaultOrderBy]
    : defaultOrderBy

  const sortingRef = useRef(sorting)

  useEffect(() => {
    sortingRef.current = sorting
  }, [sorting])

  useEffect(() => {
    const current = sortingRef.current[0]

    if (includeUserBalance) {
      if (current?.id !== GqlPoolOrderByValues.UserBalanceUsd) {
        setSorting([{ id: GqlPoolOrderByValues.UserBalanceUsd, desc: true }])
      }
    } else if (current?.id === GqlPoolOrderByValues.UserBalanceUsd) {
      setSorting([{ id: GqlPoolOrderByValues.TotalLiquidity, desc: true }])
    }
  }, [includeUserBalance, setSorting])

  return {
    orderBy,
  }
}
