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

export function useDelegateClearStep(chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const networkConfig = getNetworkConfig(chain)

  const labels: TransactionLabels = {
    init: 'Undelegate from vote optimizer',
    title: 'Undelegate from vote optimizer',
    confirming: 'Confirming undelegate...',
    confirmed: 'Undelegated!',
    tooltip: 'Clear your delegation from the vote optimizer',
  }

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'beets.delegateRegistry',
    contractAddress: networkConfig.snapshot?.contractAddress || '',
    functionName: 'clearDelegate',
    args: networkConfig.snapshot?.id ? [networkConfig.snapshot.id] : null,
    enabled: isConnected && !!networkConfig.snapshot?.contractAddress && !!networkConfig.snapshot?.id,
    onTransactionChange: setTransaction,
  }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step: TransactionStep = {
    id: 'delegateClear',
    labels,
    stepType: 'delegateClear',
    isComplete,
    renderAction: () => <ManagedTransactionButton id="delegateClear" {...props} />,
    transaction,
  }

  return { step }
}
