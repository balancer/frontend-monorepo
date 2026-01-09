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
import { isCowPool } from '../../helpers'
import { getChainId } from '@repo/lib/config/app.config'
import { Address } from 'viem'
import { cowAmmPoolAbi } from '@repo/lib/modules/web3/contracts/abi/cowAmmAbi'
import { getCowRawWeight } from '../../helpers'
import { PoolType } from '@balancer/sdk'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

interface UseBindTokenStepParams {
  token: {
    address: Address
    symbol: string
    rawAmount: bigint
    weight?: string
  }
  network: GqlChain
  poolType: PoolType
  poolAddress: Address | undefined
}

export function useBindTokenStep({
  token,
  network,
  poolType,
  poolAddress,
}: UseBindTokenStepParams) {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const chainId = getChainId(network)

  const { userAddress, isConnected } = useUserAccount()
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const labels: TransactionLabels = {
    init: `Add ${token?.symbol}`,
    title: `Add ${token?.symbol}`,
    confirming: 'Confirming add...',
    confirmed: 'Add confirmed!',
    tooltip: `Add ${token?.symbol}`,
  }

  const { data: isTokenBound, isLoading: isLoadingIsTokenBound } = useReadContract({
    address: poolAddress,
    abi: cowAmmPoolAbi,
    functionName: 'isBound',
    args: [token?.address],
    chainId,
    query: { enabled: !!poolAddress && isCowPool(poolType) },
  })

  let txConfig: TransactionConfig | undefined

  if (isConnected && poolAddress && isCowPool(poolType)) {
    const data = encodeFunctionData({
      abi: cowAmmPoolAbi,
      functionName: 'bind',
      args: [token?.address, token?.rawAmount, getCowRawWeight(token?.weight)],
    })

    txConfig = {
      chainId,
      account: userAddress,
      data,
      to: poolAddress,
    }
  }

  const gasEstimationMeta = sentryMetaForWagmiSimulation(
    `Error in bind token gas estimation for ${token?.symbol}`,
    {
      buildCallQueryData: txConfig,
      tenderlyUrl: buildTenderlyUrl(txConfig),
    }
  )

  const id = `bind-token-${token?.symbol}`

  const step = useMemo(
    () => ({
      id,
      stepType: 'bindToken' as const,
      labels,
      transaction,
      isComplete: () => isTransactionSuccess(transaction) || !!isTokenBound,
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
    [transaction, txConfig, gasEstimationMeta, labels, id, isTokenBound]
  )

  return { step, isLoading: isLoadingIsTokenBound }
}
