'use client'

import { createContext, PropsWithChildren, useMemo, useState } from 'react'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { uniq } from 'lodash'
import { POOL_TYPE_MAP, PoolFilterType } from '../../pool/pool.types'
import {
  ExpandedPoolType,
  STAKING_LABEL_MAP,
  StakingFilterKey,
  StakingFilterKeyType,
  useExpandedPools,
} from './useExpandedPools'
import { usePortfolio } from '../PortfolioProvider'
import { poolTypeLabel } from '../../pool/pool.helpers'
import { hasTinyBalance } from '../../pool/user-balance.helpers'

export type UsePortfolioFiltersResult = ReturnType<typeof _usePortfolioFilters>

function _usePortfolioFilters() {
  const [selectedNetworks, setSelectedNetworks] = useState<GqlChain[]>([])
  const [selectedPoolTypes, setSelectedPoolTypes] = useState<PoolFilterType[]>([])
  const [selectedStakingTypes, setSelectedStakingTypes] = useState<StakingFilterKeyType[]>([])
  const [shouldFilterTinyBalances, setShouldFilterTinyBalances] = useState(true)
  const { portfolioData } = usePortfolio()

  // Filter out pools with tiny balances (<0.01 USD)
  const minUsdBalance = 0.01

  const filteredBalancePools = useMemo(
    () =>
      shouldFilterTinyBalances
        ? portfolioData.pools.filter(pool => !hasTinyBalance(pool, minUsdBalance))
        : portfolioData.pools,
    [portfolioData.pools, shouldFilterTinyBalances]
  )

  const expandedPools = useExpandedPools(filteredBalancePools)

  function toggleNetwork(checked: boolean, network: GqlChain) {
    if (checked) {
      setSelectedNetworks(current => uniq([...current, network]))
    } else {
      setSelectedNetworks(current => current.filter(chain => chain !== network))
    }
  }

  function togglePoolType(checked: boolean, poolType: PoolFilterType) {
    if (checked) {
      setSelectedPoolTypes(current => uniq([...current, poolType]))
    } else {
      setSelectedPoolTypes(current => current.filter(type => type !== poolType))
    }
  }

  function toggleStakingType(checked: boolean, stakingTypeKey: StakingFilterKeyType) {
    if (checked) {
      setSelectedStakingTypes(current => uniq([...current, stakingTypeKey]))
    } else {
      setSelectedStakingTypes(current => current.filter(p => p !== stakingTypeKey))
    }
  }

  function resetFilters() {
    setSelectedNetworks([])
    setSelectedPoolTypes([])
    setSelectedStakingTypes([])
  }

  const totalFilterCount =
    selectedNetworks.length + selectedPoolTypes.length + selectedStakingTypes.length

  const availableNetworks = useMemo(
    () =>
      [...new Set(filteredBalancePools.map(pool => pool.chain))].sort((a, b) => a.localeCompare(b)),
    [filteredBalancePools]
  )

  const availablePoolTypes = useMemo(() => {
    const gqlTypeToFilterKeyMap = new Map<GqlPoolType, PoolFilterType>()

    for (const key in POOL_TYPE_MAP) {
      const filterTypeKey = key as PoolFilterType
      const gqlTypes = POOL_TYPE_MAP[filterTypeKey]
      gqlTypes.forEach(gqlType => {
        gqlTypeToFilterKeyMap.set(gqlType, filterTypeKey)
      })
    }

    const foundFilterKeys = new Set<PoolFilterType>()

    filteredBalancePools.forEach(pool => {
      if (pool.type) {
        const filterKey = gqlTypeToFilterKeyMap.get(pool.type)
        if (filterKey) {
          foundFilterKeys.add(filterKey)
        }
      }
    })

    return Array.from(foundFilterKeys).sort((a, b) =>
      poolTypeLabel(a).localeCompare(poolTypeLabel(b))
    )
  }, [filteredBalancePools])

  const availableStakingTypes = useMemo(() => {
    const foundFilterKeys = new Set<StakingFilterKeyType>()

    expandedPools.forEach(pool => {
      if (pool.poolType) {
        if (
          pool.poolType === ExpandedPoolType.StakedBal ||
          pool.poolType === ExpandedPoolType.StakedAura
        ) {
          foundFilterKeys.add(StakingFilterKey.Staked)
        } else if (pool.poolType === ExpandedPoolType.Locked) {
          foundFilterKeys.add(StakingFilterKey.Locked)
        } else if (pool.poolType === ExpandedPoolType.Unlocked) {
          foundFilterKeys.add(StakingFilterKey.Unlocked)
        } else if (pool.poolType === ExpandedPoolType.Unstaked) {
          foundFilterKeys.add(StakingFilterKey.Unstaked)
        } else if (pool.poolType === ExpandedPoolType.Default) {
          foundFilterKeys.add(StakingFilterKey.Default)
        }
      }
    })

    // Sort the staking types alphabetically with 'Default' coming last
    const defaultValue = StakingFilterKey.Default

    return Array.from(foundFilterKeys).sort((a, b) => {
      if (a === defaultValue && b === defaultValue) {
        return 0
      }
      if (a === defaultValue) {
        return 1 // a is default, should come after b
      }
      if (b === defaultValue) {
        return -1 // b is default, should come after a
      }
      // Neither is default, sort alphabetically by label
      return STAKING_LABEL_MAP[a].localeCompare(STAKING_LABEL_MAP[b])
    })
  }, [expandedPools])

  const hasTinyBalances = portfolioData.pools.some(pool => hasTinyBalance(pool, minUsdBalance))

  return {
    selectedNetworks,
    setSelectedNetworks,
    toggleNetwork,
    resetFilters,
    totalFilterCount,
    availableNetworks,
    selectedPoolTypes,
    setSelectedPoolTypes,
    togglePoolType,
    availablePoolTypes,
    selectedStakingTypes,
    setSelectedStakingTypes,
    toggleStakingType,
    availableStakingTypes,
    setShouldFilterTinyBalances,
    hasTinyBalances,
    shouldFilterTinyBalances,
    expandedPools,
  }
}

export const PortfolioFiltersContext = createContext<UsePortfolioFiltersResult | null>(null)

export function PortfolioFiltersProvider({ children }: PropsWithChildren) {
  const value = _usePortfolioFilters()

  return (
    <PortfolioFiltersContext.Provider value={value}>{children}</PortfolioFiltersContext.Provider>
  )
}

export function usePortfolioFilters() {
  return useMandatoryContext(PortfolioFiltersContext, 'PortfolioFilters')
}
