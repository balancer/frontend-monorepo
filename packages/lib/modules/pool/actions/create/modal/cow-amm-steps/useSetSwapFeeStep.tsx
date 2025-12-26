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
import { useReadContract } from 'wagmi'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { isCowPool } from '../../helpers'
import { getChainId } from '@repo/lib/config/app.config'
import { cowAmmPoolAbi } from '@repo/lib/modules/web3/contracts/abi/cowAmmAbi'

const id = 'set-swap-fee'

const labels: TransactionLabels = {
  init: 'Set Swap Fee',
  title: 'Set Swap Fee',
  confirming: 'Confirming set swap fee...',
  confirmed: 'Set swap fee confirmed!',
  tooltip: 'Set swap fee',
}

export function useSetSwapFeeStep() {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { poolCreationForm, poolAddress } = usePoolCreationForm()
  const [poolType, network] = poolCreationForm.getValues(['poolType', 'network'])
  const chainId = getChainId(network)

  const { userAddress, isConnected } = useUserAccount()
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const enabled = !!poolAddress && isCowPool(poolType)

  const { data: swapFee, isLoading: isLoadingSwapFee } = useReadContract({
    address: poolAddress,
    abi: cowAmmPoolAbi,
    functionName: 'getSwapFee',
    chainId,
    query: { enabled },
  })

  const { data: maxSwapFee, isLoading: isLoadingMaxSwapFee } = useReadContract({
    address: poolAddress,
    abi: cowAmmPoolAbi,
    functionName: 'MAX_FEE',
    chainId,
    query: { enabled },
  })

  const isSwapFeeSetToMax = swapFee !== undefined && swapFee === maxSwapFee

  let txConfig: TransactionConfig | undefined

  if (isConnected && poolAddress && maxSwapFee && isCowPool(poolType)) {
    const data = encodeFunctionData({
      abi: cowAmmPoolAbi,
      functionName: 'setSwapFee',
      args: [maxSwapFee],
    })

    txConfig = {
      chainId,
      account: userAddress,
      data,
      to: poolAddress,
    }
  }

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in set swap fee gas estimation', {
    buildCallQueryData: txConfig,
    tenderlyUrl: buildTenderlyUrl(txConfig),
  })

  const setSwapFeeStep = useMemo(
    () => ({
      id,
      stepType: 'setSwapFee' as const,
      labels,
      transaction,
      isComplete: () => isTransactionSuccess(transaction) || isSwapFeeSetToMax,
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
    [transaction, txConfig, gasEstimationMeta, labels, id, isSwapFeeSetToMax]
  )

  return { setSwapFeeStep, isLoadingSetSwapFeeStep: isLoadingSwapFee || isLoadingMaxSwapFee }
}
