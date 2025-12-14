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
import { useReadContract } from 'wagmi'

type Params = {
  poolAddress: Address | undefined
  chainId: number
}

const id = `set-swap-fee`

const labels: TransactionLabels = {
  init: `Set Swap Fee`,
  title: `Set Swap Fee`,
  confirming: 'Confirming set swap fee...',
  confirmed: 'Set swap fee confirmed!',
  tooltip: `Set swap fee`,
}

export function useSetSwapFeeStep({ poolAddress, chainId }: Params) {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { userAddress, isConnected } = useUserAccount()
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const { data: swapFee, isLoading: isLoadingSwapFee } = useReadContract({
    address: poolAddress,
    abi: parseAbi(['function getSwapFee() external view returns (uint256 swapFee)']),
    functionName: 'getSwapFee',
    chainId,
  })

  const { data: maxSwapFee, isLoading: isLoadingMaxSwapFee } = useReadContract({
    address: poolAddress,
    abi: parseAbi(['function MAX_FEE() view returns (uint256)']),
    functionName: 'MAX_FEE',
    chainId,
  })

  const isLoading = isLoadingSwapFee || isLoadingMaxSwapFee
  const isSwapFeeSetToMax = swapFee !== undefined && swapFee === maxSwapFee

  let txConfig: TransactionConfig | undefined

  if (isConnected && poolAddress && maxSwapFee) {
    const data = encodeFunctionData({
      abi: parseAbi(['function setSwapFee(uint256 swapFee)']),
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

  const step = useMemo(
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

  return { step, isLoading }
}
