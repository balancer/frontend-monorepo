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
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useQuery } from '@tanstack/react-query'
import { ensureLastQueryResponse } from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { AddLiquidityHandler } from '@repo/lib/modules/pool/actions/add-liquidity/handlers/AddLiquidity.handler'
import { useReliquary } from '../ReliquaryProvider'

const reliquaryMulticallStepId = 'reliquary-multicall-add-liquidity'

export type ReliquaryAddLiquidityStepParams = {
  handler: AddLiquidityHandler
  humanAmountsIn: HumanTokenAmountWithSymbol[]
  simulationQuery: any
  slippage: string
  createNew: boolean
  relicId?: string
}

export type ReliquaryAddLiquiditySteps = {
  multicallStep: TransactionStep
}

// Custom query for reliquary handler buildCallData
function useReliquaryBuildCallDataQuery({
  handler,
  humanAmountsIn,
  simulationQuery,
  slippage,
  enabled,
}: {
  handler: AddLiquidityHandler
  humanAmountsIn: HumanTokenAmountWithSymbol[]
  simulationQuery: any
  slippage: string
  enabled: boolean
}) {
  const { userAddress, isConnected } = useUserAccount()

  const queryFn = async () => {
    const queryOutput = ensureLastQueryResponse(
      'Reliquary add liquidity query',
      simulationQuery.data
    )
    const response = await handler.buildCallData({
      account: userAddress,
      humanAmountsIn,
      slippagePercent: slippage,
      queryOutput,
    })
    console.log('Reliquary call data built:', response)
    return response
  }

  return useQuery({
    queryKey: ['reliquaryBuildCallData', userAddress, humanAmountsIn, slippage],
    queryFn,
    enabled: enabled && isConnected && !!simulationQuery.data,
    gcTime: 0,
  })
}

export function useReliquaryAddLiquidityStep(
  params: ReliquaryAddLiquidityStepParams
): ReliquaryAddLiquiditySteps {
  const { pool, refetch: refetchPoolBalances, chainId } = usePool()
  const { refetchRelicPositions } = useReliquary()
  const [isStepActivated, setIsStepActivated] = useState(false)
  const { buildTenderlyUrl } = useTenderly({ chainId })
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { simulationQuery, createNew, relicId } = params

  const buildCallDataQuery = useReliquaryBuildCallDataQuery({
    handler: params.handler,
    humanAmountsIn: params.humanAmountsIn,
    simulationQuery: params.simulationQuery,
    slippage: params.slippage,
    enabled: isStepActivated,
  })

  // Labels for the multicall transaction (joinPool + add liquidity into Reliquary)
  const addLiquidityLabels: TransactionLabels = createNew
    ? {
        init: 'Create Relic & add liquidity',
        title: 'Create Relic and add liquidity',
        description: `Create a new maBEETS Relic and add liquidity to ${pool.name || 'pool'}.`,
        confirming: 'Creating Relic and adding liquidity...',
        confirmed: 'Relic created and liquidity added!',
        tooltip: `Create a new maBEETS Relic and add liquidity to ${pool.name || 'pool'}.`,
        poolId: pool.id,
      }
    : {
        init: 'Add liquidity to Relic',
        title: `Add liquidity to Relic #${relicId}`,
        description: `Add liquidity to ${pool.name || 'pool'} and Relic #${relicId}.`,
        confirming: 'Adding liquidity to Relic...',
        confirmed: 'Liquidity added to Relic!',
        tooltip: `Add liquidity to ${pool.name || 'pool'} and Relic #${relicId}`,
        poolId: pool.id,
      }

  const gasEstimationMeta = sentryMetaForWagmiSimulation(
    'Error in Reliquary add liquidity gas estimation',
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

  // Execute multicall transaction (joinPool + add liquidity into Reliquary)
  const multicallStep: TransactionStep = useMemo(
    () => ({
      id: reliquaryMulticallStepId,
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
            id={reliquaryMulticallStepId}
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
      isBatchEnd: true,
      batchableTxCall: buildCallDataQuery.data
        ? {
            data: buildCallDataQuery.data.data,
            to: buildCallDataQuery.data.to,
            value: buildCallDataQuery.data.value,
          }
        : undefined,
    }),
    [
      transaction,
      simulationQuery.data,
      buildCallDataQuery.data,
      chainId,
      gasEstimationMeta,
      addLiquidityLabels,
      isComplete,
      onSuccess,
    ]
  )

  return {
    multicallStep,
  }
}
