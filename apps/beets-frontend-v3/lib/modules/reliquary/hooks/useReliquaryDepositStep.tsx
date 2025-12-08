/* eslint-disable react-hooks/preserve-manual-memoization */
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
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import {
  AddLiquidityBuildQueryParams,
  useAddLiquidityBuildCallDataQuery,
} from '@repo/lib/modules/pool/actions/add-liquidity/queries/useAddLiquidityBuildCallDataQuery'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { useReliquary } from '../ReliquaryProvider'

const addLiquidityStepId = 'add-liquidity-to-pool'
const reliquaryDepositStepId = 'reliquary-deposit'

export type ReliquaryDepositStepParams = AddLiquidityBuildQueryParams & {
  createNew: boolean
  relicId?: string
}

export type ReliquaryDepositSteps = {
  addLiquidityStep: TransactionStep
  depositIntoRelicStep: TransactionStep
}

export function useReliquaryDepositStep(params: ReliquaryDepositStepParams): ReliquaryDepositSteps {
  const { pool, refetch: refetchPoolBalances, chainId } = usePool()
  const { refetchRelicPositions } = useReliquary()
  const [isStepActivated, setIsStepActivated] = useState(false)
  const { buildTenderlyUrl } = useTenderly({ chainId })
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { simulationQuery, createNew, relicId } = params

  const buildCallDataQuery = useAddLiquidityBuildCallDataQuery({
    ...params,
    enabled: isStepActivated,
  })

  // Labels for adding liquidity to pool (step 1 of the multicall)
  const addLiquidityLabels: TransactionLabels = {
    init: 'Deposit liquidity',
    title: 'Add liquidity to pool',
    description: `Add liquidity to ${pool.name || 'pool'}.`,
    confirming: 'Depositing liquidity...',
    confirmed: 'Liquidity deposited!',
    tooltip: `Add liquidity to ${pool.name || 'pool'}.`,
    poolId: pool.id,
  }

  // Labels for depositing into relic (step 2 of the multicall)
  const depositLabels: TransactionLabels = createNew
    ? {
        init: 'Create relic',
        title: 'Create new relic',
        description: `Create a new maBEETS relic.`,
        confirming: 'Creating relic...',
        confirmed: 'Relic created!',
        tooltip: 'Create a new maBEETS relic.',
        poolId: pool.id,
      }
    : {
        init: 'Deposit into relic',
        title: relicId ? `Deposit into Relic #${relicId}` : 'Deposit into relic',
        description: relicId ? `Deposit into Relic #${relicId}.` : 'Deposit into relic.',
        confirming: 'Depositing into relic...',
        confirmed: 'Deposited into relic!',
        tooltip: relicId ? `Deposit into Relic #${relicId}` : 'Deposit into relic',
        poolId: pool.id,
      }

  const gasEstimationMeta = sentryMetaForWagmiSimulation(
    'Error in Reliquary deposit gas estimation',
    {
      simulationQueryData: simulationQuery.data,
      buildCallQueryData: buildCallDataQuery.data,
      tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
    }
  )

  const isComplete = () => isTransactionSuccess(transaction)
  useEffect(() => {
    // simulationQuery is refetched every 30 seconds
    if (simulationQuery.data && isStepActivated) {
      buildCallDataQuery.refetch()
    }
  }, [simulationQuery.data])

  const onSuccess = useCallback(() => {
    refetchPoolBalances()
    refetchRelicPositions() // Refetch reliquary positions to update landing page
  }, [refetchPoolBalances, refetchRelicPositions])

  // Step 1: Add liquidity to pool (this step executes the multicall transaction)
  const addLiquidityStep: TransactionStep = useMemo(
    () => ({
      id: addLiquidityStepId,
      stepType: 'addLiquidity',
      labels: addLiquidityLabels,
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
            id={addLiquidityStepId}
            labels={addLiquidityLabels}
            onTransactionChange={setTransaction}
            txConfig={buildCallDataQuery.data}
          />
        )
      },
      renderBatchAction: (currentStep: TransactionStep) => {
        return (
          <TransactionBatchButton
            chainId={chainId}
            currentStep={currentStep}
            labels={addLiquidityLabels}
            onTransactionChange={setTransaction}
          />
        )
      },
      isBatchEnd: false,
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

  // Step 2: Deposit into relic (automatically completes when step 1 completes)
  const depositIntoRelicStep: TransactionStep = useMemo(
    () => ({
      id: reliquaryDepositStepId,
      stepType: 'depositRelic',
      labels: depositLabels,
      details: {
        gasless: false,
        type: 'Gas transaction',
      },
      transaction, // Same transaction as step 1
      isComplete, // Shares completion state with step 1
      onActivated: () => {}, // No action needed, transaction already triggered by step 1
      onDeactivated: () => {},
      onSuccess: () => {}, // Already called by step 1
      renderAction: () => {
        // This step doesn't render a button since the transaction is handled by step 1
        // It will auto-complete when step 1's transaction succeeds
        return <DisabledTransactionButton />
      },
      renderBatchAction: () => <DisabledTransactionButton />,
      isBatchEnd: true,
      batchableTxCall: undefined, // No separate transaction call
    }),
    [transaction, createNew, relicId]
  )

  return {
    addLiquidityStep,
    depositIntoRelicStep,
  }
}
