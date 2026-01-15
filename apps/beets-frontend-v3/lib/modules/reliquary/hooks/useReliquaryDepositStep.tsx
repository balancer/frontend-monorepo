import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useQuery } from '@tanstack/react-query'
import { ensureLastQueryResponse } from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { AddLiquidityHandler } from '@repo/lib/modules/pool/actions/add-liquidity/handlers/AddLiquidity.handler'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { useReliquary } from '../ReliquaryProvider'
import { ReliquaryProportionalAddLiquidityHandler } from '../handlers/ReliquaryProportionalAddLiquidity.handler'
import { ReliquaryUnbalancedAddLiquidityHandler } from '../handlers/ReliquaryUnbalancedAddLiquidity.handler'

const reliquaryMulticallStepId = 'reliquary-multicall-deposit'

export type ReliquaryDepositStepParams = {
  handler: AddLiquidityHandler // Accept base type but check for reliquary handlers in runtime
  humanAmountsIn: HumanTokenAmountWithAddress[]
  simulationQuery: any
  slippage: string
  createNew: boolean
  relicId?: string
}

export type ReliquaryDepositSteps = {
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
  humanAmountsIn: HumanTokenAmountWithAddress[]
  simulationQuery: any
  slippage: string
  enabled: boolean
}) {
  const { userAddress, isConnected } = useUserAccount()

  const queryFn = async () => {
    // Check if handler is a reliquary handler
    if (
      handler instanceof ReliquaryProportionalAddLiquidityHandler ||
      handler instanceof ReliquaryUnbalancedAddLiquidityHandler
    ) {
      const queryOutput = ensureLastQueryResponse('Reliquary deposit query', simulationQuery.data)
      const response = await handler.buildCallData({
        account: userAddress,
        humanAmountsIn,
        slippagePercent: slippage,
        queryOutput,
      })
      console.log('Reliquary call data built:', response)
      return response
    } else {
      throw new Error(
        'Handler must be a ReliquaryProportionalAddLiquidityHandler or ReliquaryUnbalancedAddLiquidityHandler'
      )
    }
  }

  return useQuery({
    queryKey: ['reliquaryBuildCallData', userAddress, humanAmountsIn, slippage],
    queryFn,
    enabled: enabled && isConnected && !!simulationQuery.data,
    gcTime: 0,
  })
}

export function useReliquaryDepositStep(params: ReliquaryDepositStepParams): ReliquaryDepositSteps {
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

  // Labels for the multicall transaction (joinPool + depositIntoReliquary)
  const addLiquidityLabels: TransactionLabels = createNew
    ? {
        init: 'Create Relic & deposit',
        title: 'Create Relic and deposit liquidity',
        description: `Create a new maBEETS Relic and deposit liquidity to ${pool.name || 'pool'}.`,
        confirming: 'Creating Relic and depositing...',
        confirmed: 'Relic created and liquidity deposited!',
        tooltip: `Create a new maBEETS Relic and deposit liquidity to ${pool.name || 'pool'}.`,
        poolId: pool.id,
      }
    : {
        init: 'Deposit into Relic',
        title: `Deposit into Relic #${relicId}`,
        description: `Deposit liquidity into ${pool.name || 'pool'} and Relic #${relicId}.`,
        confirming: 'Depositing into Relic...',
        confirmed: 'Deposited into Relic!',
        tooltip: `Deposit liquidity into ${pool.name || 'pool'} and Relic #${relicId}`,
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

  // Execute multicall transaction (joinPool + depositIntoReliquary)
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
    }),
    [
      transaction,
      simulationQuery.data,
      buildCallDataQuery.data,
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
