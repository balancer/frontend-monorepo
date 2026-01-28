import { getNetworkConfig } from '@repo/lib/config/app.config'
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
import { useDelegation } from './useDelegation'
import { useReliquary } from '../ReliquaryProvider'
import { getChainId } from '@repo/lib/config/app.config'

export type DelegationAction = 'delegate' | 'undelegate'

export function useReliquaryDelegationStep(action: DelegationAction) {
  const { isConnected } = useUserAccount()
  const { refetch } = useDelegation()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()
  const { chain } = useReliquary()

  const chainId = getChainId(chain)
  const networkConfig = getNetworkConfig(chainId)

  const labels: TransactionLabels =
    action === 'undelegate'
      ? {
          init: 'Undelegate',
          title: 'Undelegate',
          confirming: 'Confirming undelegate...',
          confirmed: 'Undelegated!',
          tooltip: 'Clear your delegation',
        }
      : {
          init: 'Delegate',
          title: 'Delegate',
          confirming: 'Confirming delegation...',
          confirmed: 'Delegated!',
          tooltip: 'Delegate your voting power',
        }

  const props: ManagedTransactionInput =
    action === 'delegate'
      ? {
          labels,
          chainId: networkConfig.chainId,
          contractId: 'snapshot.delegateRegistry',
          contractAddress: networkConfig.snapshot?.contractAddress || '',
          functionName: 'setDelegate',
          args:
            networkConfig.snapshot &&
            networkConfig.snapshot.id &&
            networkConfig.snapshot.delegateAddress
              ? [networkConfig.snapshot.id, networkConfig.snapshot.delegateAddress]
              : null,
          enabled:
            isConnected &&
            !!networkConfig.snapshot?.contractAddress &&
            !!networkConfig.snapshot?.id &&
            !!networkConfig.snapshot?.delegateAddress,
          onTransactionChange: setTransaction,
        }
      : {
          labels,
          chainId: networkConfig.chainId,
          contractId: 'snapshot.delegateRegistry',
          contractAddress: networkConfig.snapshot?.contractAddress || '',
          functionName: 'clearDelegate',
          args: networkConfig.snapshot?.id ? [networkConfig.snapshot.id] : null,
          enabled:
            isConnected &&
            !!networkConfig.snapshot?.contractAddress &&
            !!networkConfig.snapshot?.id,
          onTransactionChange: setTransaction,
        }

  const isComplete = () => isConnected && isTransactionSuccess(transaction)

  const step: TransactionStep = {
    id: 'delegation',
    labels,
    stepType: action === 'delegate' ? 'delegateSet' : 'delegateClear',
    isComplete,
    onSuccess: () => refetch(),
    renderAction: () => <ManagedTransactionButton id="delegation" {...props} />,
    transaction,
  }

  return { step }
}
