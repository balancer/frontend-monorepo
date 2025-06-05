/* eslint-disable react-hooks/exhaustive-deps */
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { TransactionBatchButton } from '@repo/lib/modules/transactions/transaction-steps/safe/TransactionBatchButton'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePool } from '../../PoolProvider'
import {
  AddLiquidityBuildQueryParams,
  useAddLiquidityBuildCallDataQuery,
} from './queries/useAddLiquidityBuildCallDataQuery'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'

const addLiquidityStepId = 'add-liquidity'

export type AddLiquidityStepParams = AddLiquidityBuildQueryParams

export function useAddLiquidityStep(params: AddLiquidityStepParams): TransactionStep {
  const { pool, refetch: refetchPoolBalances, chainId } = usePool()
  const [isStepActivated, setIsStepActivated] = useState(false)
  const { buildTenderlyUrl } = useTenderly({ chainId })
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

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

  const isComplete = () => isTransactionSuccess(transaction)
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
            id={addLiquidityStepId}
            labels={labels}
            txConfig={buildCallDataQuery.data}
            onTransactionChange={setTransaction}
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
            onTransactionChange={setTransaction}
          />
        )
      },
      // Last step in smart account batch
      isBatchEnd: true,
      batchableTxCall: buildCallDataQuery.data
        ? {
            data: buildCallDataQuery.data.data,
            to: buildCallDataQuery.data.to,
            value: buildCallDataQuery.data.value,
          }
        : undefined,
    }),
    [transaction, simulationQuery.data, buildCallDataQuery.data]
  )
}
