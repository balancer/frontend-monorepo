/* eslint-disable react-hooks/exhaustive-deps */
import { GqlPoolOrderBy } from '@repo/lib/shared/services/api/generated/graphql'
import { useState, useMemo } from 'react'
import { getCanStake } from '../../pool/actions/stake.helpers'
import { POOL_TYPE_MAP } from '../../pool/pool.types'
import { getTotalApr } from '../../pool/pool.utils'
import { ExpandedPoolInfo, ExpandedPoolType, STAKING_FILTER_MAP } from './useExpandedPools'
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
  const { selectedNetworks, selectedPoolTypes, selectedStakingTypes, expandedPools } =
    usePortfolioFilters()

  const { portfolioData } = usePortfolio()
  const { veBalBoostMap } = useVebalBoost(portfolioData.stakedPools)

  const [currentSortingObj, setCurrentSortingObj] = useState<PortfolioSortingData>({
    id: 'staking',
    desc: true,
  })

  const sortedPools = useMemo(() => {
    if (!portfolioData?.pools) return []
    let arr = [...expandedPools]

    // Filter by selected networks if any are selected
    if (selectedNetworks.length > 0) {
      arr = arr.filter(pool => selectedNetworks.includes(pool.chain))
    }

    // Filter by selected pool types if any are selected
    if (selectedPoolTypes.length > 0) {
      arr = arr.filter(pool =>
        selectedPoolTypes.some(selectedFilterKey => {
          const correspondingGqlTypes = POOL_TYPE_MAP[selectedFilterKey]

          return correspondingGqlTypes && correspondingGqlTypes.includes(pool.type)
        })
      )
    }

    // Filter by selected staking types if any are selected
    if (selectedStakingTypes.length > 0) {
      // Get all ExpandedPoolType values corresponding to the selected filter keys
      const targetPoolTypes = selectedStakingTypes.flatMap(key => STAKING_FILTER_MAP[key])
      arr = arr.filter(pool => targetPoolTypes.includes(pool.poolType))
    }

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

        // If weights are equal, use veBAL boost as a tie-breaker (higher boost first)
        if (weightDiff === 0) {
          const aVebalBoost = Number(veBalBoostMap?.[a.id] || 0)
          const bVebalBoost = Number(veBalBoostMap?.[b.id] || 0)
          // Always sort by boost descending, regardless of primary sort direction
          return bVebalBoost - aVebalBoost
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
    expandedPools,
    currentSortingObj.id,
    currentSortingObj.desc,
    veBalBoostMap,
  ])

  return { sortedPools, setCurrentSortingObj, currentSortingObj, veBalBoostMap }
}
