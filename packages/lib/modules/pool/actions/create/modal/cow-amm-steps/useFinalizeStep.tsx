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
import { encodeFunctionData } from 'viem'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { getChainId } from '@repo/lib/config/app.config'
import { isCowPool } from '../../helpers'
import { cowAmmPoolAbi } from '@repo/lib/modules/web3/contracts/abi/cowAmmAbi'

const id = 'finalize'

const labels: TransactionLabels = {
  init: 'Finalize',
  title: 'Finalize',
  confirming: 'Confirming finalize...',
  confirmed: 'Finalize confirmed!',
  tooltip: 'Finalize',
}

export function useFinalizeStep() {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { poolCreationForm, poolAddress } = usePoolCreationForm()
  const [poolType, network] = poolCreationForm.getValues(['poolType', 'network'])
  const chainId = getChainId(network)

  const { userAddress, isConnected } = useUserAccount()
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const { isPoolInitialized, isLoadingPoolInitialized, refetchIsPoolInitialized } =
    useIsPoolInitialized({ chainId, poolAddress, poolType })

  let txConfig: TransactionConfig | undefined

  if (isConnected && poolAddress && isCowPool(poolType)) {
    txConfig = {
      chainId,
      to: poolAddress,
      account: userAddress,
      data: encodeFunctionData({
        abi: cowAmmPoolAbi,
        functionName: 'finalize',
      }),
    }
  }

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in finalize pool gas estimation', {
    buildCallQueryData: txConfig,
    tenderlyUrl: buildTenderlyUrl(txConfig),
  })

  const finalizeStep = useMemo(
    () => ({
      id,
      stepType: 'finalizePool' as const,
      labels,
      transaction,
      isComplete: () => isTransactionSuccess(transaction) || !!isPoolInitialized,
      onSuccess: () => refetchIsPoolInitialized(),
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
    [
      transaction,
      txConfig,
      gasEstimationMeta,
      labels,
      id,
      isPoolInitialized,
      refetchIsPoolInitialized,
    ]
  )

  return { finalizeStep, isLoadingFinalizeStep: isLoadingPoolInitialized }
}
