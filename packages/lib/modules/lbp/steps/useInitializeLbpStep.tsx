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
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { type Address } from 'viem'
import { PoolType, InitPoolInputV3 } from '@balancer/sdk'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { useLocalStorage } from 'usehooks-ts'
import { useParams } from 'next/navigation'

export const initializeLbpStepId = 'initialize-lbp'

const labels: TransactionLabels = {
  init: 'Initialize LBP',
  title: 'Initialize LBP',
  confirming: 'Initializing a new LBP',
  confirmed: 'Initialized a new LBP',
  tooltip: 'Initialize a new LBP',
}

export function useInitializeLbpStep({
  initPoolInput,
}: {
  initPoolInput: InitPoolInputV3
}): TransactionStep {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const [isStepActivated, setIsStepActivated] = useState(false)
  const [poolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )
  const rpcUrl = getRpcUrl(initPoolInput.chainId)
  const { buildTenderlyUrl } = useTenderly({ chainId: initPoolInput.chainId })

  const buildCallDataQuery = useInitializePoolBuildCall({
    rpcUrl,
    poolAddress: poolAddress as Address,
    poolType: PoolType.LiquidityBootstrapping,
    enabled: isStepActivated,
    initPoolInput,
  })
  const params = useParams()
  const initTxHash = params?.txHash?.[0]

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in initialze LBP gas estimation', {
    buildCallQueryData: buildCallDataQuery.data,
    tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
  })

  const isComplete = () => isTransactionSuccess(transaction) || !!initTxHash

  return useMemo(
    () => ({
      id: initializeLbpStepId,
      stepType: 'initializePool',
      labels,
      transaction,
      isComplete,
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      // onSuccess,
      renderAction: () => {
        if (!buildCallDataQuery.data) return <DisabledTransactionButton />
        return (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={initializeLbpStepId}
            labels={labels}
            onTransactionChange={setTransaction}
            txConfig={buildCallDataQuery.data}
          />
        )
      },
    }),
    /* eslint-disable react-hooks/exhaustive-deps */
    [transaction, labels, buildCallDataQuery.data]
  )
}
