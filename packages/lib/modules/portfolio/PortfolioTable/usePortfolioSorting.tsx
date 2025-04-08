/* eslint-disable react-hooks/exhaustive-deps */
import { GqlPoolOrderBy } from '@repo/lib/shared/services/api/generated/graphql'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { getCanStake } from '../../pool/actions/stake.helpers'
import { getTotalApr } from '../../pool/pool.utils'
import { ExpandedPoolInfo, ExpandedPoolType } from './useExpandedPools'
import { usePortfolioFilters } from './PortfolioFiltersProvider'
import { usePortfolio } from '../PortfolioProvider'
import { useVebalBoost } from '../../vebal/useVebalBoost'
import { bn } from '@repo/lib/shared/utils/numbers'

export type PortfolioTableSortingId = 'staking' | 'vebal' | 'liquidity' | 'apr'
export interface PortfolioSortingData {
  id: PortfolioTableSortingId | GqlPoolOrderBy
  desc: boolean
}

export const portfolioOrderByFn: (addExtraColumn: boolean) => {
  title: string
  id: PortfolioTableSortingId
}[] = (addExtraColumn: boolean) => [
  {
    title: 'Staking',
    id: 'staking',
  },
  ...(addExtraColumn
    ? [
        {
          title: 'veBAL boost',
          id: 'vebal' as PortfolioTableSortingId,
        },
      ]
    : []),
  {
    title: 'My liquidity',
    id: 'liquidity',
  },
  {
    title: 'APR',
    id: 'apr',
  },
]

const generateStakingWeightForSort = (pool: ExpandedPoolInfo) => {
  const canStake = getCanStake(pool)

  if (canStake) {
    return (
      Number(pool.poolType === ExpandedPoolType.Unlocked) * 50 +
      Number(pool.poolType === ExpandedPoolType.StakedBal) * 20 +
      Number(pool.poolType === ExpandedPoolType.StakedAura) * 15 +
      Number(pool.poolType === ExpandedPoolType.Unstaked) * 10
    )
  } else {
    return 0 // send all pools without staking to the bottom of the table
  }
}

export function usePortfolioSorting() {
  const { filteredExpandedPools, selectedNetworks, selectedPoolTypes, selectedStakingTypes } =
    usePortfolioFilters()

  const { portfolioData } = usePortfolio()
  const { veBalBoostMap } = useVebalBoost(portfolioData.stakedPools)

  const [currentSortingObj, setCurrentSortingObj] = useState<PortfolioSortingData>({
    id: 'staking',
    desc: true,
  })

  const setSorting = useCallback((sorting: PortfolioSortingData) => {
    setCurrentSortingObj(sorting)
  }, [])

  // set sorting to liquidity when any filter is applied
  useEffect(() => {
    if (
      (selectedNetworks && selectedNetworks.length > 0) ||
      (selectedPoolTypes && selectedPoolTypes.length > 0) ||
      (selectedStakingTypes && selectedStakingTypes.length > 0)
    ) {
      setCurrentSortingObj({ id: 'liquidity', desc: true })
    }
  }, [selectedNetworks, selectedPoolTypes, selectedStakingTypes])

  const sortedPools = useMemo(() => {
    if (!filteredExpandedPools?.length) return []
    const arr = [...filteredExpandedPools]

    return arr.sort((a, b) => {
      if (currentSortingObj.id === 'staking') {
        const isALocked = a.poolType === ExpandedPoolType.Locked
        const isBLocked = b.poolType === ExpandedPoolType.Locked

        // Prioritize Locked pools regardless of canStake status
        if (currentSortingObj.desc) {
          if (isALocked && !isBLocked) return -1 // A (Locked) comes before B
          if (!isALocked && isBLocked) return 1 // B (Locked) comes before A
        } else {
          // Ascending sort (Locked comes last)
          if (isALocked && !isBLocked) return 1 // A (Locked) comes after B
          if (!isALocked && isBLocked) return -1 // B (Locked) comes after A
        }

        // If both are Locked or neither is Locked, use the weight function
        const aStakingWeight = generateStakingWeightForSort(a)
        const bStakingWeight = generateStakingWeightForSort(b)

        const weightDiff = currentSortingObj.desc
          ? bStakingWeight - aStakingWeight
          : aStakingWeight - bStakingWeight

        // If weights are equal, use pool position USD as a tie-breaker (higher value first)
        if (weightDiff === 0) {
          const aPositionUsd = a.poolPositionUsd || 0
          const bPositionUsd = b.poolPositionUsd || 0
          // Always sort by position USD descending, regardless of primary sort direction
          return bPositionUsd - aPositionUsd
        }

        return weightDiff
      }

      if (currentSortingObj.id === 'vebal') {
        const aVebalBoost = Number(veBalBoostMap?.[a.id] || 0)
        const bVebalBoost = Number(veBalBoostMap?.[b.id] || 0)
        return currentSortingObj.desc ? bVebalBoost - aVebalBoost : aVebalBoost - bVebalBoost
      }

      if (currentSortingObj.id === 'liquidity') {
        const aTotalBalance = a.poolPositionUsd
        const bTotalBalance = b.poolPositionUsd

        return currentSortingObj.desc
          ? bTotalBalance - aTotalBalance
          : aTotalBalance - bTotalBalance
      }

      if (currentSortingObj.id === 'apr') {
        const [aApr] =
          a.poolType === ExpandedPoolType.StakedAura
            ? [a.staking?.aura?.apr ?? 0]
            : getTotalApr(a.dynamicData.aprItems)
        const [bApr] =
          b.poolType === ExpandedPoolType.StakedAura
            ? [b.staking?.aura?.apr ?? 0]
            : getTotalApr(b.dynamicData.aprItems)
        return currentSortingObj.desc
          ? bn(bApr).minus(aApr).toNumber()
          : bn(aApr).minus(bApr).toNumber()
      }

      return 0
    })
  }, [
    portfolioData?.pools,
    filteredExpandedPools,
    currentSortingObj.id,
    currentSortingObj.desc,
    veBalBoostMap,
  ])

  return { sortedPools, setSorting, currentSortingObj, veBalBoostMap }
}
