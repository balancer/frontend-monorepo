'use client'

import { useRemoveLiquidityLogic } from '@repo/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { ReliquaryProportionalRemoveLiquidityHandler } from '@repo/lib/modules/pool/actions/remove-liquidity/handlers/ReliquaryProportionalRemoveLiquidity.handler'
import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
import { useCallback, createContext, useContext } from 'react'
import { useRelicId } from '@repo/lib/modules/pool/actions/add-liquidity/RelicIdProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { Hash } from 'viem'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { RemoveLiquidityType } from '@repo/lib/modules/pool/actions/remove-liquidity/remove-liquidity.types'

type RelicWithdrawContext = ReturnType<typeof useRemoveLiquidityLogic> & {
  // Relic-specific additions
  relicId?: string
}

const RelicWithdrawContext = createContext<RelicWithdrawContext | null>(null)

export function RelicWithdrawProvider({
  children,
  urlTxHash,
}: {
  children: React.ReactNode
  urlTxHash?: Hash
}) {
  const { relicId } = useRelicId()

  // Custom selector that returns reliquary handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reliquaryHandlerSelector = useCallback((pool: Pool, removalType: RemoveLiquidityType) => {
    const networkConfig = getNetworkConfig(pool.chain)
    const batchRelayer = BatchRelayerService.create(
      networkConfig.contracts.balancer.relayerV6,
      true // include reliquary
    )
    // For now, only support proportional. Can add single token later.
    return new ReliquaryProportionalRemoveLiquidityHandler(pool, batchRelayer)
  }, [])

  // Reuse ALL the remove liquidity logic
  const removeLiquidityState = useRemoveLiquidityLogic(urlTxHash, reliquaryHandlerSelector)

  const value: RelicWithdrawContext = {
    ...removeLiquidityState,
    relicId,
  }

  return <RelicWithdrawContext.Provider value={value}>{children}</RelicWithdrawContext.Provider>
}

export function useRelicWithdraw(): RelicWithdrawContext {
  const context = useContext(RelicWithdrawContext)
  if (!context) {
    throw new Error('useRelicWithdraw must be used within RelicWithdrawProvider')
  }
  return context
}
