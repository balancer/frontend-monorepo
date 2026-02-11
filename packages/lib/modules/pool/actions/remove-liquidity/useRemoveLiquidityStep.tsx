import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useEffect, useMemo, useState } from 'react'
import { usePool } from '../../PoolProvider'
import {
  RemoveLiquidityBuildQueryParams,
  useRemoveLiquidityBuildCallDataQuery,
} from './queries/useRemoveLiquidityBuildCallDataQuery'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { TransactionBatchButton } from '@repo/lib/modules/transactions/transaction-steps/safe/TransactionBatchButton'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { RemoveLiquidityHandler } from './handlers/RemoveLiquidity.handler'

const removeLiquidityStepId = 'remove-liquidity'

export type RemoveLiquidityStepParams<
  THandler extends RemoveLiquidityHandler = RemoveLiquidityHandler,
> = RemoveLiquidityBuildQueryParams<THandler>

export function useRemoveLiquidityStep<
  THandler extends RemoveLiquidityHandler = RemoveLiquidityHandler,
>(params: RemoveLiquidityStepParams<THandler>): TransactionStep {
  const [isStepActivated, setIsStepActivated] = useState(false)
  const { pool, refetch: refetchPoolUserBalances, chainId } = usePool()
  const { buildTenderlyUrl } = useTenderly({ chainId })
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { simulationQuery } = params

  const buildCallDataQuery = useRemoveLiquidityBuildCallDataQuery({
    ...params,
    enabled: isStepActivated,
  })

  const labels: TransactionLabels = {
    init: 'Remove liquidity',
    title: 'Remove liquidity',
    description: `Remove liquidity from ${pool.name || 'pool'}.`,
    confirming: 'Confirming remove...',
    confirmed: `Liquidity removed!`,
    tooltip: `Remove liquidity from ${pool.name || 'pool'}.`,
    poolId: pool.id,
  }

  const gasEstimationMeta = sentryMetaForWagmiSimulation(
    'Error in RemoveLiquidity gas estimation',
    {
      simulationQueryData: simulationQuery.data,
      buildCallQueryData: buildCallDataQuery.data,
      tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
    }
  )

  useEffect(() => {
    // simulationQuery is refetched every 30 seconds by RemoveLiquidityTimeout
    if (simulationQuery.data && isStepActivated) {
      buildCallDataQuery.refetch()
    }
  }, [simulationQuery.data])

  return useMemo(
    () => ({
      id: removeLiquidityStepId,
      stepType: 'removeLiquidity',
      labels,
      details: {
        gasless: false,
        type: 'Gas transaction',
      },
      transaction,
      isComplete: () => isTransactionSuccess(transaction),
      renderAction: () => {
        if (!buildCallDataQuery.data) return <DisabledTransactionButton />
        return (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={removeLiquidityStepId}
            labels={labels}
            onTransactionChange={setTransaction}
            txConfig={buildCallDataQuery.data}
          />
        )
      },
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      onSuccess: () => refetchPoolUserBalances(),
      // The following fields are only used within Safe App
      renderBatchAction: (currentStep: TransactionStep) => {
        return (
          <TransactionBatchButton
            chainId={chainId}
            currentStep={currentStep}
            labels={labels}
            onTransactionChange={setTransaction}
          />
        )
      },
      // Last step in smart account batch
      isBatchEnd: true,
      batchableTxCall: buildCallDataQuery.data
        ? { data: buildCallDataQuery.data.data, to: buildCallDataQuery.data.to }
        : undefined,
    }),
    [
      transaction,
      simulationQuery.data,
      buildCallDataQuery.data,
      gasEstimationMeta,
      labels,
      refetchPoolUserBalances,
      chainId,
    ]
  )
}
