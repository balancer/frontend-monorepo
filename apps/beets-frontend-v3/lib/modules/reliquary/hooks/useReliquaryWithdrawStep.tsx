import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useCallback, useMemo, useState } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useQuery } from '@tanstack/react-query'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { ensureLastQueryResponse } from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'
import { ReliquaryProportionalRemoveLiquidityHandler } from '../handlers/ReliquaryProportionalRemoveLiquidity.handler'
import { ReliquarySingleTokenRemoveLiquidityHandler } from '../handlers/ReliquarySingleTokenRemoveLiquidity.handler'
import { RemoveLiquidityHandler } from '@repo/lib/modules/pool/actions/remove-liquidity/handlers/RemoveLiquidity.handler'
import { useReliquary } from '../ReliquaryProvider'
import { Address, zeroAddress } from 'viem'

const reliquaryMulticallStepId = 'reliquary-multicall-withdraw'

export type ReliquaryWithdrawStepParams = {
  handler: RemoveLiquidityHandler // Accept base type but check for reliquary handlers in runtime
  simulationQuery: any
  slippage: string
  relicId: number
  singleTokenOutAddress?: Address
}

export type ReliquaryWithdrawSteps = {
  multicallStep: TransactionStep
}

// Custom query for reliquary handler buildCallData
function useReliquaryBuildCallDataQuery({
  handler,
  simulationQuery,
  slippage,
  enabled,
  singleTokenOutAddress,
}: {
  handler: RemoveLiquidityHandler
  simulationQuery: any
  slippage: string
  enabled: boolean
  singleTokenOutAddress?: Address
}) {
  const { userAddress, isConnected } = useUserAccount()

  const queryFn = async () => {
    if (handler instanceof ReliquarySingleTokenRemoveLiquidityHandler) {
      const queryOutput = ensureLastQueryResponse('Reliquary withdraw query', simulationQuery.data)

      const response = await handler.buildCallData({
        account: userAddress,
        slippagePercent: slippage,
        queryOutput,
        tokenOut: singleTokenOutAddress || zeroAddress,
      })

      console.log('Reliquary withdraw call data built:', response)
      return response
    }

    if (handler instanceof ReliquaryProportionalRemoveLiquidityHandler) {
      const queryOutput = ensureLastQueryResponse('Reliquary withdraw query', simulationQuery.data)

      const response = await handler.buildCallData({
        account: userAddress,
        slippagePercent: slippage,
        queryOutput,
      })

      console.log('Reliquary withdraw call data built:', response)
      return response
    }

    {
      throw new Error(
        'Handler must be a ReliquaryProportionalRemoveLiquidityHandler or ReliquarySingleTokenRemoveLiquidityHandler'
      )
    }
  }

  return useQuery({
    queryKey: ['reliquaryWithdrawBuildCallData', userAddress, slippage],
    queryFn,
    enabled: enabled && isConnected && !!simulationQuery.data,
    gcTime: 0,
  })
}

export function useReliquaryWithdrawStep(
  params: ReliquaryWithdrawStepParams
): ReliquaryWithdrawSteps {
  const { pool, refetch: refetchPoolBalances, chainId } = usePool()
  const { refetchRelicPositions } = useReliquary()
  const [isStepActivated, setIsStepActivated] = useState(false)
  const { buildTenderlyUrl } = useTenderly({ chainId })
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { simulationQuery, relicId } = params

  const buildCallDataQuery = useReliquaryBuildCallDataQuery({
    handler: params.handler,
    simulationQuery: params.simulationQuery,
    slippage: params.slippage,
    enabled: isStepActivated,
    singleTokenOutAddress: params.singleTokenOutAddress,
  })

  // Labels for the multicall transaction (withdrawFromReliquary + exitPool)
  const withdrawLabels: TransactionLabels = {
    init: 'Withdraw from Relic',
    title: `Withdraw from Relic #${relicId}`,
    description: `Withdraw liquidity from ${pool.name || 'pool'} and Relic #${relicId}.`,
    confirming: 'Withdrawing from Relic...',
    confirmed: 'Withdrawn from Relic!',
    tooltip: `Withdraw liquidity from ${pool.name || 'pool'} and Relic #${relicId}`,
    poolId: pool.id,
  }

  const gasEstimationMeta = sentryMetaForWagmiSimulation(
    'Error in Reliquary withdraw gas estimation',
    {
      simulationQueryData: simulationQuery.data,
      buildCallQueryData: buildCallDataQuery.data,
      tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
    }
  )

  const isComplete = () => isTransactionSuccess(transaction)

  const onSuccess = useCallback(() => {
    refetchPoolBalances()
    refetchRelicPositions() // Refetch reliquary positions to update landing page
  }, [refetchPoolBalances, refetchRelicPositions])

  // Execute multicall transaction (withdrawFromReliquary + exitPool)
  const multicallStep: TransactionStep = useMemo(
    () => ({
      id: reliquaryMulticallStepId,
      stepType: 'removeLiquidity',
      labels: withdrawLabels,
      details: {
        gasless: false,
        type: 'Gas transaction',
      },
      transaction,
      isComplete,
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      onSuccess,
      renderAction: () => {
        if (!buildCallDataQuery.data) return <DisabledTransactionButton />
        return (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={reliquaryMulticallStepId}
            labels={withdrawLabels}
            onTransactionChange={setTransaction}
            txConfig={buildCallDataQuery.data}
          />
        )
      },
    }),
    [
      transaction,
      simulationQuery.data,
      buildCallDataQuery.data,
      gasEstimationMeta,
      withdrawLabels,
      isComplete,
      onSuccess,
    ]
  )

  return {
    multicallStep,
  }
}
