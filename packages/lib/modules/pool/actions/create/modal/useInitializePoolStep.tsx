import { useMemo, useState } from 'react'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { useInitializePoolBuildCall } from '@repo/lib/modules/pool/actions/initialize/useInitializePoolBuildCall'
import { type Address } from 'viem'
import { PoolType, InitPoolInputV3 } from '@balancer/sdk'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { TransactionBatchButton } from '@repo/lib/modules/transactions/transaction-steps/safe/TransactionBatchButton'

export const initializePoolStepId = 'initialize-pool'

const labels: TransactionLabels = {
  init: 'Seed pool liquidity',
  title: 'Seed pool liquidity',
  confirming: 'Confirming seed pool liquidity...',
  confirmed: 'Seed pool liquidity confirmed!',
  tooltip: 'Seed pool liquidity',
}

type Params = {
  initPoolInput: InitPoolInputV3
  poolAddress: Address | undefined
  poolType: PoolType
}

export function useInitializePoolStep({
  initPoolInput,
  poolAddress,
  poolType,
}: Params): TransactionStep {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const [isStepActivated, setIsStepActivated] = useState(false)

  const { chainId } = initPoolInput
  const rpcUrl = getRpcUrl(chainId)
  const { buildTenderlyUrl } = useTenderly({ chainId })
  const { isPoolInitialized, refetchIsPoolInitialized } = useIsPoolInitialized(chainId, poolAddress)

  const buildCallDataQuery = useInitializePoolBuildCall({
    rpcUrl,
    poolAddress,
    poolType,
    enabled: isStepActivated && !isPoolInitialized && !!poolAddress,
    initPoolInput,
  })

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in initialze LBP gas estimation', {
    buildCallQueryData: buildCallDataQuery.data,
    tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
  })

  const isComplete = () => !!isPoolInitialized || isTransactionSuccess(transaction)

  return useMemo(
    () => ({
      id: initializePoolStepId,
      stepType: 'initializePool',
      labels,
      transaction,
      isComplete,
      onSuccess: () => {
        refetchIsPoolInitialized()
      },
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      renderAction: () => {
        if (!buildCallDataQuery.data) return <DisabledTransactionButton />
        return (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={initializePoolStepId}
            labels={labels}
            onTransactionChange={setTransaction}
            txConfig={buildCallDataQuery.data}
          />
        )
      },
      renderBatchAction: (currentStep: TransactionStep) => {
        return (
          <TransactionBatchButton
            chainId={initPoolInput.chainId}
            currentStep={currentStep}
            labels={labels}
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

    [transaction, labels, buildCallDataQuery.data, isPoolInitialized]
  )
}
