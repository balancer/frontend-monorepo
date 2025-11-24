'use client'

import { AddLiquidityProvider } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { ReliquaryProportionalAddLiquidityHandler } from './handlers/ReliquaryProportionalAddLiquidity.handler'
import { ReliquaryUnbalancedAddLiquidityHandler } from './handlers/ReliquaryUnbalancedAddLiquidity.handler'
import { BeetsBatchRelayerService } from '@/lib/services/batch-relayer/beets-batch-relayer.service'
import { useCallback, useMemo } from 'react'
import { useReliquary } from './ReliquaryProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { Hash } from 'viem'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { useReliquaryDepositSteps } from './hooks/useReliquaryDepositSteps'

export function RelicDepositProvider({
  children,
  urlTxHash,
}: {
  children: React.ReactNode
  urlTxHash?: Hash
}) {
  const { selectedRelicId: relicId } = useReliquary()

  // If no relic is selected, we're creating a new one
  // This will be overridden by the page's createNew state toggle if provided
  const createNew = !relicId

  // Convert relicId string to number for handler
  const relicIdNumber = relicId ? parseInt(relicId, 10) : undefined

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

  // Create a wrapper hook factory that captures createNew and relicId
  const customStepsHook = useMemo(() => {
    // This function signature matches what AddLiquidityProvider expects
    return (params: any) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useReliquaryDepositSteps({
        ...params,
        createNew,
        relicId,
      })
    }
  }, [createNew, relicId])

  return (
    <AddLiquidityProvider
      customStepsHook={customStepsHook}
      handlerSelector={reliquaryHandlerSelector}
      urlTxHash={urlTxHash}
    >
      {children}
    </AddLiquidityProvider>
  )
}
