import { type TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { InitPoolInputAmount } from '@repo/lib/modules/pool/actions/create/types'
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
import { encodeFunctionData, parseAbi, parseUnits } from 'viem'
import { useReadContract } from 'wagmi'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { isCowPool } from '../../helpers'
import { getChainId } from '@repo/lib/config/app.config'

export function useBindTokenStep(token: InitPoolInputAmount) {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { poolCreationForm, poolAddress } = usePoolCreationForm()
  const [poolType, network] = poolCreationForm.getValues(['poolType', 'network'])
  const chainId = getChainId(network)

  const { userAddress, isConnected } = useUserAccount()
  const { buildTenderlyUrl } = useTenderly({ chainId })

  const labels: TransactionLabels = {
    init: `Add ${token.symbol}`,
    title: `Add ${token.symbol}`,
    confirming: 'Confirming add...',
    confirmed: 'Add confirmed!',
    tooltip: `Add ${token.symbol}`,
  }

  const { data: isTokenBound, isLoading: isLoadingIsTokenBound } = useReadContract({
    address: poolAddress,
    abi: parseAbi(['function isBound(address t) external view returns (bool isBound)']),
    functionName: 'isBound',
    args: [token.address],
    chainId,
    query: { enabled: !!poolAddress && isCowPool(poolType) },
  })

  let txConfig: TransactionConfig | undefined

  if (isConnected && token.weight && poolAddress && isCowPool(poolType)) {
    // bind 2 tokens with 1e18 weight for each to get a 50/50 pool, otherwise parse the 80/20 to the required precision
    const weight = token.weight === '50' ? parseUnits('1', 18) : parseUnits(token.weight, 17)

    const data = encodeFunctionData({
      abi: parseAbi(['function bind(address token, uint256 balance, uint256 denorm) external']),
      functionName: 'bind',
      args: [token.address, token.rawAmount, weight],
    })

    txConfig = {
      chainId,
      account: userAddress,
      data,
      to: poolAddress,
    }
  }

  const gasEstimationMeta = sentryMetaForWagmiSimulation(
    `Error in bind token gas estimation for ${token.symbol}`,
    {
      buildCallQueryData: txConfig,
      tenderlyUrl: buildTenderlyUrl(txConfig),
    }
  )

  const id = `bind-token-${token.symbol}`

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
