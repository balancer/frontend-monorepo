/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useBalTokenRewards } from '@/lib/modules/portfolio/PortfolioClaim/useBalRewards'
import { useClaimableBalances } from '@/lib/modules/portfolio/PortfolioClaim/useClaimableBalances'
import { safeSum } from '@/lib/shared/utils/numbers'
import { useMemo } from 'react'
import { ClaimablePool } from './ClaimProvider'

export function useClaimsData(pools: ClaimablePool[]) {
  const claimableBalancesQuery = useClaimableBalances(pools)
  const nonBalRewards = claimableBalancesQuery.claimableRewards
  const balTokenRewardsQuery = useBalTokenRewards(pools)
  const balRewards = balTokenRewardsQuery.balRewardsData

  const allClaimableRewards = useMemo(
    () => [...balRewards, ...nonBalRewards],
    [balRewards, nonBalRewards]
  )

  const totalClaimableUsd = useMemo(
    () => safeSum(allClaimableRewards.map(reward => reward.fiatBalance)),
    [allClaimableRewards]
  )

  const hasNoRewards = !nonBalRewards.length && !balRewards.length

  return {
    isLoading:
      claimableBalancesQuery.isLoadingClaimableRewards || balTokenRewardsQuery.isLoadingBalRewards,
    nonBalRewards,
    balRewards,
    allClaimableRewards,
    totalClaimableUsd,
    hasNoRewards,
    claimableBalancesQuery,
    balTokenRewardsQuery,
  }
}
