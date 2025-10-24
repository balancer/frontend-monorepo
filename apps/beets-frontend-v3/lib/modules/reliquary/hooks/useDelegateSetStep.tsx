'use client'

import { getChainId } from '@repo/lib/config/app.config'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useState } from 'react'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useDelegation } from './useDelegation'

export function useDelegateSetStep(chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const { refetch } = useDelegation()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const networkConfig = getNetworkConfig(chain)

  const labels: TransactionLabels = {
    init: 'Delegate to vote optimizer',
    title: 'Delegate to vote optimizer',
    confirming: 'Confirming delegation...',
    confirmed: 'Delegated!',
    tooltip: 'Delegate your voting power to the vote optimizer',
  }

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.delegateRegistry',
    contractAddress: networkConfig.snapshot?.contractAddress || '',
    functionName: 'setDelegate',
    args:
      networkConfig.snapshot?.id && networkConfig.snapshot?.delegateAddress
        ? [networkConfig.snapshot.id, networkConfig.snapshot.delegateAddress]
        : null,
    enabled:
      isConnected &&
      !!networkConfig.snapshot?.contractAddress &&
      !!networkConfig.snapshot?.id &&
      !!networkConfig.snapshot?.delegateAddress,
    onTransactionChange: setTransaction,
  }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step: TransactionStep = {
    id: 'delegateSet',
    labels,
    stepType: 'delegateSet',
    isComplete,
    onSuccess: () => refetch(),
    renderAction: () => <ManagedTransactionButton id="delegateSet" {...props} />,
    transaction,
  }

  return { step }
}
