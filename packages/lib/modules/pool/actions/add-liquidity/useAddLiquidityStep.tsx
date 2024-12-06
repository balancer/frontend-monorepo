/* eslint-disable react-hooks/exhaustive-deps */
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { TransactionBatchButton } from '@repo/lib/modules/transactions/transaction-steps/safe/TransactionBatchButton'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePool } from '../../PoolProvider'
import {
  AddLiquidityBuildQueryParams,
  useAddLiquidityBuildCallDataQuery,
} from './queries/useAddLiquidityBuildCallDataQuery'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'

export const addLiquidityStepId = 'add-liquidity'

export type AddLiquidityStepParams = AddLiquidityBuildQueryParams

export function useAddLiquidityStep(params: AddLiquidityStepParams): TransactionStep {
  const { pool, refetch: refetchPoolBalances, chainId } = usePool()
  const [isStepActivated, setIsStepActivated] = useState(false)
  const { getTransaction } = useTransactionState()
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const { simulationQuery } = params

  const buildCallDataQuery = useAddLiquidityBuildCallDataQuery({
    ...params,
    enabled: isStepActivated,
  })

  const labels: TransactionLabels = {
    init: 'Add liquidity',
    title: 'Add liquidity',
    description: `Add liquidity to ${pool.name || 'pool'}.`,
    confirming: 'Confirming add liquidity...',
    confirmed: `Liquidity added!`,
    tooltip: `Add liquidity to ${pool.name || 'pool'}.`,
    poolId: pool.id,
  }

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in AddLiquidity gas estimation', {
    simulationQueryData: simulationQuery.data,
    buildCallQueryData: buildCallDataQuery.data,
    tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
  })

  const transaction = getTransaction(addLiquidityStepId)

  const isComplete = () => transaction?.result.isSuccess || false

  useEffect(() => {
    // simulationQuery is refetched every 30 seconds by AddLiquidityTimeout
    if (simulationQuery.data && isStepActivated) {
      buildCallDataQuery.refetch()
    }
  }, [simulationQuery.data])

  const onSuccess = useCallback(() => {
    refetchPoolBalances()
  }, [])

  return useMemo(
    () => ({
      id: addLiquidityStepId,
      stepType: 'addLiquidity',
      labels,
      isComplete,
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      onSuccess,
      renderAction: () => {
        if (!buildCallDataQuery.data) return <DisabledTransactionButton />
        return (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={addLiquidityStepId}
            labels={labels}
            txConfig={buildCallDataQuery.data}
          />
        )
      },
      // The following fields are only used within Safe App
      renderBatchAction: (currentStep: TransactionStep) => {
        return (
          <TransactionBatchButton
            chainId={chainId}
            currentStep={currentStep}
            id={addLiquidityStepId}
            labels={labels}
          />
        )
      },
      // Last step in smart account batch
      isBatchEnd: true,
      batchableTxCall: buildCallDataQuery.data
        ? { data: buildCallDataQuery.data.data, to: buildCallDataQuery.data.to }
        : undefined,
    }),
    [transaction, simulationQuery.data, buildCallDataQuery.data]
  )
}
