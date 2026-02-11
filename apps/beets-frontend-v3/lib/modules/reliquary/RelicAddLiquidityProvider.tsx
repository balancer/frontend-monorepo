'use client'

import { AddLiquidityProvider } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { ReliquaryProportionalAddLiquidityHandler } from './handlers/ReliquaryProportionalAddLiquidity.handler'
import { ReliquaryUnbalancedAddLiquidityHandler } from './handlers/ReliquaryUnbalancedAddLiquidity.handler'
import { BeetsBatchRelayerService } from '@/lib/services/batch-relayer/beets-batch-relayer.service'
import { useCallback } from 'react'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { Hash } from 'viem'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { useReliquaryAddLiquiditySteps } from './hooks/useReliquaryAddLiquiditySteps'
import { AddLiquidityStepsParams } from '@repo/lib/modules/pool/actions/add-liquidity/useAddLiquiditySteps'
import { bn } from '@repo/lib/shared/utils/numbers'
import { ReliquaryAddLiquidityHandler } from './hooks/useReliquaryAddLiquidityStep'

export function RelicAddLiquidityProvider({
  children,
  urlTxHash,
  relicId,
}: {
  children: React.ReactNode
  urlTxHash?: Hash
  relicId?: string
}) {
  // If no relicId is provided, we're creating a new one
  const createNew = !relicId

  // Convert relicId string to number for handler
  const relicIdNumber = relicId ? bn(relicId).toNumber() : undefined

  // Custom selector that returns reliquary handler based on mode
  const reliquaryHandlerSelector = useCallback(
    (pool: Pool, wantsProportional: boolean) => {
      const networkConfig = getNetworkConfig(pool.chain)
      const batchRelayer = BeetsBatchRelayerService.create(
        networkConfig.contracts.balancer.relayerV6
      )

      if (wantsProportional) {
        return new ReliquaryProportionalAddLiquidityHandler(pool, batchRelayer, relicIdNumber)
      } else {
        return new ReliquaryUnbalancedAddLiquidityHandler(pool, batchRelayer, relicIdNumber)
      }
    },
    [relicIdNumber]
  )

  function useReliquarySteps(params: AddLiquidityStepsParams<ReliquaryAddLiquidityHandler>) {
    return useReliquaryAddLiquiditySteps({
      ...params,
      createNew,
      relicId,
    })
  }

  return (
    <AddLiquidityProvider
      addLiquidityHandlerSelector={reliquaryHandlerSelector}
      enablePoolRedirect={false}
      urlTxHash={urlTxHash}
      useAddLiquiditySteps={useReliquarySteps}
    >
      {children}
    </AddLiquidityProvider>
  )
}
