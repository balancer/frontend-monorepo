'use client'

import { createContext, PropsWithChildren, useState } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { uniq } from 'lodash'
import { PoolFilterType } from '../../pool/pool.types'

export type UsePortfolioFiltersResult = ReturnType<typeof _usePortfolioFilters>

function _usePortfolioFilters() {
  const [selectedNetworks, setSelectedNetworks] = useState<GqlChain[]>([])
  const [availableNetworks, setAvailableNetworks] = useState<GqlChain[]>([])
  const [selectedPoolTypes, setSelectedPoolTypes] = useState<PoolFilterType[]>([])
  const [availablePoolTypes, setAvailablePoolTypes] = useState<PoolFilterType[]>([])

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

  function resetFilters() {
    setSelectedNetworks([])
    setSelectedPoolTypes([])
  }

  const totalFilterCount = selectedNetworks.length + selectedPoolTypes.length

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
