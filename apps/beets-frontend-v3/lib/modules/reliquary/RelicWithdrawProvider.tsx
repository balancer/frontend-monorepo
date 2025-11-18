'use client'

import { RemoveLiquidityProvider } from '@repo/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { ReliquaryProportionalRemoveLiquidityHandler } from './handlers/ReliquaryProportionalRemoveLiquidity.handler'
import { ReliquarySingleTokenRemoveLiquidityHandler } from './handlers/ReliquarySingleTokenRemoveLiquidity.handler'
import { BeetsBatchRelayerService } from '@/lib/services/batch-relayer/beets-batch-relayer.service'
import { useCallback } from 'react'
import { useReliquary } from './ReliquaryProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { Hash } from 'viem'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { RemoveLiquidityType } from '@repo/lib/modules/pool/actions/remove-liquidity/remove-liquidity.types'

export function RelicWithdrawProvider({
  children,
  urlTxHash,
}: {
  children: React.ReactNode
  urlTxHash?: Hash
}) {
  const { selectedRelicId: relicId } = useReliquary()

  // Convert relicId string to number for handler
  const relicIdNumber = relicId ? parseInt(relicId, 10) : undefined

  // Custom selector that returns reliquary handler based on removal type
  const reliquaryHandlerSelector = useCallback(
    (pool: Pool, removalType: RemoveLiquidityType) => {
      const networkConfig = getNetworkConfig(pool.chain)
      const batchRelayer = BeetsBatchRelayerService.create(
        networkConfig.contracts.balancer.relayerV6
      )

      if (removalType === RemoveLiquidityType.Proportional) {
        return new ReliquaryProportionalRemoveLiquidityHandler(pool, batchRelayer, relicIdNumber)
      } else {
        return new ReliquarySingleTokenRemoveLiquidityHandler(pool, batchRelayer, relicIdNumber)
      }
    },
    [relicIdNumber]
  )

  return (
    <RemoveLiquidityProvider handlerSelector={reliquaryHandlerSelector} urlTxHash={urlTxHash}>
      {children}
    </RemoveLiquidityProvider>
  )
}
