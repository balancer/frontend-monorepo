'use client'

import { createContext, PropsWithChildren, useState } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { uniq } from 'lodash'

export type UsePortfolioFiltersResult = ReturnType<typeof _usePortfolioFilters>

function _usePortfolioFilters() {
  const [networks, setNetworks] = useState<GqlChain[]>([])
  const [availableNetworks, setAvailableNetworks] = useState<GqlChain[]>([])

  function toggleNetwork(checked: boolean, network: GqlChain) {
    if (checked) {
      setNetworks(current => uniq([...current, network]))
    } else {
      setNetworks(current => current.filter(chain => chain !== network))
    }
  }

  function resetFilters() {
    setNetworks([])
  }

  const totalFilterCount = networks.length

  return {
    networks,
    setNetworks,
    toggleNetwork,
    resetFilters,
    totalFilterCount,
    availableNetworks,
    setAvailableNetworks,
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
