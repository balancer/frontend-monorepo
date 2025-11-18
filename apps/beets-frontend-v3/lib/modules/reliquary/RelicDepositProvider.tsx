'use client'

import { useAddLiquidityLogic } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { ReliquaryProportionalAddLiquidityHandler } from '@repo/lib/modules/pool/actions/add-liquidity/handlers/ReliquaryProportionalAddLiquidity.handler'
import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
import { useCallback, useState, createContext, useContext } from 'react'
import { useRelicId } from '@repo/lib/modules/pool/actions/add-liquidity/RelicIdProvider'
import { useReliquaryDepositImpact } from './hooks/useReliquaryDepositImpact'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { Hash } from 'viem'
import { Pool } from '@repo/lib/modules/pool/pool.types'

type RelicDepositContext = ReturnType<typeof useAddLiquidityLogic> & {
  // Relic-specific additions
  relicId?: string
  createNew: boolean
  setCreateNew: (value: boolean) => void
  depositImpactQuery: ReturnType<typeof useReliquaryDepositImpact>
}

const RelicDepositContext = createContext<RelicDepositContext | null>(null)

export function RelicDepositProvider({
  children,
  urlTxHash,
}: {
  children: React.ReactNode
  urlTxHash?: Hash
}) {
  const { relicId } = useRelicId()
  const [createNew, setCreateNew] = useState(!relicId) // Default to create if no relic selected

  // Custom selector that returns reliquary handler
  const reliquaryHandlerSelector = useCallback((pool: Pool) => {
    const networkConfig = getNetworkConfig(pool.chain)
    const batchRelayer = BatchRelayerService.create(
      networkConfig.contracts.balancer.relayerV6,
      true // include reliquary
    )
    // For now, only support proportional. Can add unbalanced later.
    return new ReliquaryProportionalAddLiquidityHandler(pool, batchRelayer)
  }, [])

  // Reuse ALL the add liquidity logic
  const addLiquidityState = useAddLiquidityLogic(urlTxHash, reliquaryHandlerSelector)

  // Add relic-specific queries
  // Calculate deposit impact based on simulated BPT amount
  const bptAmount = addLiquidityState.simulationQuery.data?.bptOut
    ? Number(addLiquidityState.simulationQuery.data.bptOut) / 1e18 // Convert from wei to human amount
    : 0

  const depositImpactQuery = useReliquaryDepositImpact(bptAmount, createNew ? undefined : relicId)

  const value: RelicDepositContext = {
    ...addLiquidityState,
    relicId,
    createNew,
    setCreateNew,
    depositImpactQuery,
  }

  return <RelicDepositContext.Provider value={value}>{children}</RelicDepositContext.Provider>
}

export function useRelicDeposit(): RelicDepositContext {
  const context = useContext(RelicDepositContext)
  if (!context) {
    throw new Error('useRelicDeposit must be used within RelicDepositProvider')
  }
  return context
}
