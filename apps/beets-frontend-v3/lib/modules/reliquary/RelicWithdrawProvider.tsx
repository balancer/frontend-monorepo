'use client'

import {
  RemoveLiquidityProvider,
  useRemoveLiquidity,
} from '@repo/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { ReliquaryProportionalRemoveLiquidityHandler } from './handlers/ReliquaryProportionalRemoveLiquidity.handler'
import { ReliquarySingleTokenRemoveLiquidityHandler } from './handlers/ReliquarySingleTokenRemoveLiquidity.handler'
import { BeetsBatchRelayerService } from '@/lib/services/batch-relayer/beets-batch-relayer.service'
import { useCallback, useEffect, useMemo } from 'react'
import { useReliquary } from './ReliquaryProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { Hash } from 'viem'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { RemoveLiquidityType } from '@repo/lib/modules/pool/actions/remove-liquidity/remove-liquidity.types'
import { HumanAmount } from '@balancer/sdk'
import { useReliquaryWithdrawSteps } from './hooks/useReliquaryWithdrawSteps'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { RemoveLiquidityStepParams } from '@repo/lib/modules/pool/actions/remove-liquidity/useRemoveLiquidityStep'
import { bn } from '@repo/lib/shared/utils/numbers'

export function RelicWithdrawProvider({
  children,
  urlTxHash,
  relicId,
}: {
  children: React.ReactNode
  urlTxHash?: Hash
  relicId: string
}) {
  const { relicPositions, refetchRelicPositions } = useReliquary()

  // Find the Relic from positions
  const relic = relicPositions.find(r => r.relicId === relicId)

  // Convert relicId string to number for handler
  const relicIdNumber = bn(relicId).toNumber()

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

  const customStepsHook = useMemo(() => {
    return (params: RemoveLiquidityStepParams): TransactionStep[] => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useReliquaryWithdrawSteps({
        handler: params.handler,
        simulationQuery: params.simulationQuery,
        relicId: relicIdNumber,
        singleTokenOutAddress: params.singleTokenOutAddress,
      })
    }
  }, [relicIdNumber])

  return (
    <RemoveLiquidityProvider
      customStepsHook={customStepsHook}
      handlerSelector={reliquaryHandlerSelector}
      maxHumanBptIn={relic?.amount as HumanAmount | undefined}
      urlTxHash={urlTxHash}
    >
      <WithdrawSuccessHandler refetchRelicPositions={refetchRelicPositions} />
      {children}
    </RemoveLiquidityProvider>
  )
}

// Helper component to handle success
function WithdrawSuccessHandler({ refetchRelicPositions }: { refetchRelicPositions: () => void }) {
  const { removeLiquidityTxHash } = useRemoveLiquidity()

  useEffect(() => {
    if (removeLiquidityTxHash) {
      // Transaction succeeded, refetch reliquary positions
      refetchRelicPositions()
    }
  }, [removeLiquidityTxHash, refetchRelicPositions])

  return null
}
