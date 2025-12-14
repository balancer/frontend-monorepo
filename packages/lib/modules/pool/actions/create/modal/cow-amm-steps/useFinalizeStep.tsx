import { type TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useMemo } from 'react'
import {
  ManagedResult,
  TransactionLabels,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { useState } from 'react'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { encodeFunctionData, parseAbi, Address } from 'viem'
import { useIsCowPoolFinalized } from './useIsCowPoolFinalized'

type Params = {
  poolAddress: Address | undefined
  chainId: number
}

const id = `finalize`

const labels: TransactionLabels = {
  init: `Finalize`,
  title: `Finalize`,
  confirming: 'Confirming finalize...',
  confirmed: 'Finalize confirmed!',
  tooltip: `Finalize`,
}

export function useFinalizeStep({ poolAddress, chainId }: Params) {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { userAddress, isConnected } = useUserAccount()
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const { isCowPoolFinalized, isLoadingIsFinalized, refetchIsFinalized } = useIsCowPoolFinalized({
    poolAddress,
    chainId,
  })

  let txConfig: TransactionConfig | undefined

  if (isConnected && poolAddress) {
    const data = encodeFunctionData({
      abi: parseAbi(['function finalize() external']),
      functionName: 'finalize',
    })

    txConfig = {
      chainId,
      account: userAddress,
      data,
      to: poolAddress,
    }
  }

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in finalize pool gas estimation', {
    buildCallQueryData: txConfig,
    tenderlyUrl: buildTenderlyUrl(txConfig),
  })

  const step = useMemo(
    () => ({
      id,
      stepType: 'finalizePool' as const,
      labels,
      transaction,
      isComplete: () => isTransactionSuccess(transaction) || !!isCowPoolFinalized,
      onSuccess: () => refetchIsFinalized(),
      renderAction: () => {
        if (!txConfig) return <DisabledTransactionButton />
        return (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={id}
            labels={labels}
            onTransactionChange={setTransaction}
            txConfig={txConfig}
          />
        )
      },
    }),
    [transaction, txConfig, gasEstimationMeta, labels, id, isCowPoolFinalized, refetchIsFinalized]
  )

  return { step, isLoading: isLoadingIsFinalized }
}
