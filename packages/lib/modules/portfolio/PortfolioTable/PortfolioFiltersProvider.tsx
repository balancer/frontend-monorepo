'use client'

import { createContext, useMemo, useState } from 'react'
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
  STAKING_FILTER_MAP,
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
      setSelectedStakingTypes(current => current.filter(type => type !== stakingTypeKey))
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

  // Calculate filtered pools based on all filters
  const filteredExpandedPools = useMemo(() => {
    let filtered = [...expandedPools]

    // Filter by selected networks if any are selected
    if (selectedNetworks.length > 0) {
      filtered = filtered.filter(pool => selectedNetworks.includes(pool.chain))
    }

    // Filter by selected pool types if any are selected
    if (selectedPoolTypes.length > 0) {
      filtered = filtered.filter(pool =>
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
      filtered = filtered.filter(pool => targetPoolTypes.includes(pool.poolType))
    }

    return filtered
  }, [expandedPools, selectedNetworks, selectedPoolTypes, selectedStakingTypes])

  return {
    selectedNetworks,
    setSelectedNetworks,
    toggleNetwork,
    totalFilterCount,
    resetFilters,
    availableNetworks,
    selectedPoolTypes,
    setSelectedPoolTypes,
    togglePoolType,
    availablePoolTypes,
    selectedStakingTypes,
    toggleStakingType,
    availableStakingTypes,
    shouldFilterTinyBalances,
    setShouldFilterTinyBalances,
    hasTinyBalances,
    expandedPools,
    filteredExpandedPools,
  }
}

export const PortfolioFiltersContext = createContext<UsePortfolioFiltersResult | null>(null)

export function PortfolioFiltersProvider({ children }: { children: React.ReactNode }) {
  const filters = _usePortfolioFilters()

  return (
    <PortfolioFiltersContext.Provider value={filters}>{children}</PortfolioFiltersContext.Provider>
  )
}

export function usePortfolioFilters() {
  return useMandatoryContext(PortfolioFiltersContext, 'PortfolioFilters')
}
