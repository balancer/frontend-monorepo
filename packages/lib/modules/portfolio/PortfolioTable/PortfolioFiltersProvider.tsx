'use client'

import { createContext, PropsWithChildren, useState } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { uniq } from 'lodash'

interface PortfolioFiltersState {
  networks: GqlChain[]
  setNetworks: (networks: GqlChain[]) => void
  toggleNetwork: (checked: boolean, network: GqlChain) => void
  resetFilters: () => void
  totalFilterCount: number
}

function _usePortfolioFilters(): PortfolioFiltersState {
  const [networks, setNetworks] = useState<GqlChain[]>([])

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
  }
}

export const PortfolioFiltersContext = createContext<PortfolioFiltersState | null>(null)

export function PortfolioFiltersProvider({ children }: PropsWithChildren) {
  const value = _usePortfolioFilters()

  return (
    <PortfolioFiltersContext.Provider value={value}>{children}</PortfolioFiltersContext.Provider>
  )
}

export function usePortfolioFilters() {
  return useMandatoryContext(PortfolioFiltersContext, 'PortfolioFilters')
}
