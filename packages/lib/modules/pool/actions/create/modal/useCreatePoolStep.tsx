import {
  ManagedResult,
  TransactionLabels,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useState } from 'react'
import { getGqlChain, getChainName } from '@repo/lib/config/app.config'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { CreatePoolInput } from '@balancer/sdk'
import { useCreatePoolBuildCall } from '@repo/lib/modules/pool/actions/create/useCreatePoolBuildCall'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useTenderly } from '@repo/lib/modules/web3/useTenderly'
import { useEffect, useMemo } from 'react'
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { DisabledTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionStepButton'
import { usePoolCreationReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { Address } from 'viem'

const CREATE_POOL_STEP_ID = 'create-pool'

type Params = {
  createPoolInput: CreatePoolInput
  poolAddress: Address | undefined
  setPoolAddress: (poolAddress: Address) => void
}

export function useCreatePoolStep({
  createPoolInput,
  poolAddress,
  setPoolAddress,
}: Params): TransactionStep {
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const [isStepActivated, setIsStepActivated] = useState(false)

  const { userAddress } = useUserAccount()
  const { chainId } = createPoolInput
  const chainName = getChainName(chainId)
  const chain = getGqlChain(chainId)

  const labels = useMemo<TransactionLabels>(
    () => ({
      init: `Deploy pool on ${chainName}`,
      title: `Deploy pool on ${chainName}`,
      confirming: 'Confirming pool creation...',
      confirmed: 'Pool creation confirmed!',
      tooltip: `Deploy pool on ${chainName}`,
    }),
    [chainName]
  )

  const buildCallDataQuery = useCreatePoolBuildCall({
    createPoolInput,
    enabled: isStepActivated,
  })

  const { buildTenderlyUrl } = useTenderly({ chainId })

  const gasEstimationMeta = sentryMetaForWagmiSimulation('Error in create pool gas estimation', {
    buildCallQueryData: buildCallDataQuery.data,
    tenderlyUrl: buildTenderlyUrl(buildCallDataQuery.data),
  })

  const receiptProps = usePoolCreationReceipt({
    txHash: transaction?.result?.data?.transactionHash,
    chain,
    userAddress: userAddress,
    protocolVersion: 3 as const,
  })

  useEffect(() => {
    if (receiptProps.poolAddress) setPoolAddress(receiptProps.poolAddress)
  }, [receiptProps.poolAddress, setPoolAddress])

  return useMemo(
    () => ({
      id: CREATE_POOL_STEP_ID,
      stepType: 'createPool',
      labels,
      transaction,
      isComplete: () => isTransactionSuccess(transaction) || !!poolAddress,
      onActivated: () => setIsStepActivated(true),
      onDeactivated: () => setIsStepActivated(false),
      renderAction: () => {
        if (!buildCallDataQuery.data) return <DisabledTransactionButton />
        return (
          <ManagedSendTransactionButton
            gasEstimationMeta={gasEstimationMeta}
            id={CREATE_POOL_STEP_ID}
            labels={labels}
            onTransactionChange={setTransaction}
            txConfig={buildCallDataQuery.data}
          />
        )
      },
    }),
    [transaction, buildCallDataQuery.data, gasEstimationMeta, poolAddress, labels]
  )
}
