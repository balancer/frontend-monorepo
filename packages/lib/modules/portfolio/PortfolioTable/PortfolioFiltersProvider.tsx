'use client'

import { createContext, PropsWithChildren, useState } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { uniq } from 'lodash'
import { PoolFilterType } from '../../pool/pool.types'
import { ExpandedPoolType } from './useExpandedPools'

export type UsePortfolioFiltersResult = ReturnType<typeof _usePortfolioFilters>

function _usePortfolioFilters() {
  const [selectedNetworks, setSelectedNetworks] = useState<GqlChain[]>([])
  const [availableNetworks, setAvailableNetworks] = useState<GqlChain[]>([])
  const [selectedPoolTypes, setSelectedPoolTypes] = useState<PoolFilterType[]>([])
  const [availablePoolTypes, setAvailablePoolTypes] = useState<PoolFilterType[]>([])
  const [availableStakingTypes, setAvailableStakingTypes] = useState<ExpandedPoolType[]>([])
  const [selectedStakingTypes, setSelectedStakingTypes] = useState<ExpandedPoolType[]>([])

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

  function toggleStakingType(checked: boolean, stakingType: ExpandedPoolType) {
    if (checked) {
      setSelectedStakingTypes(current => uniq([...current, stakingType]))
    } else {
      setSelectedStakingTypes(current => current.filter(type => type !== stakingType))
    }
  }

  function resetFilters() {
    setSelectedNetworks([])
    setSelectedPoolTypes([])
    setSelectedStakingTypes([])
  }

  const totalFilterCount =
    selectedNetworks.length + selectedPoolTypes.length + selectedStakingTypes.length

  return {
    selectedNetworks,
    setSelectedNetworks,
    toggleNetwork,
    resetFilters,
    totalFilterCount,
    availableNetworks,
    setAvailableNetworks,
    selectedPoolTypes,
    setSelectedPoolTypes,
    togglePoolType,
    availablePoolTypes,
    setAvailablePoolTypes,
    selectedStakingTypes,
    setSelectedStakingTypes,
    toggleStakingType,
    availableStakingTypes,
    setAvailableStakingTypes,
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
