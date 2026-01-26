import { getNetworkConfig } from '@repo/lib/config/networks'
import {
  getTransactionState,
  TransactionState,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { resetTransaction } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import {
  ManagedTransactionInput,
  useManagedTransaction,
} from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isUserRejectedError } from '@repo/lib/shared/utils/error-filters'
import { useEffect } from 'react'
import { useDelegation } from './useDelegation'

export function useReliquaryDelegationTransaction() {
  const { isConnected } = useUserAccount()
  const { data: isDelegatedToMDs, delegationAddress, refetch } = useDelegation()
  const networkConfig = getNetworkConfig(GqlChain.Sonic)

  const transactionInput: ManagedTransactionInput = isDelegatedToMDs
    ? {
        labels: {
          init: 'Undelegate',
          title: 'Undelegate',
          confirming: 'Confirming undelegate...',
          confirmed: 'Undelegated!',
          tooltip: 'Clear your delegation',
        },
        chainId: networkConfig.chainId,
        contractId: 'snapshot.delegateRegistry',
        contractAddress: networkConfig.snapshot?.contractAddress || '',
        functionName: 'clearDelegate',
        args: networkConfig.snapshot?.id ? [networkConfig.snapshot.id] : null,
        onTransactionChange: () => {},
        enabled:
          isConnected && !!networkConfig.snapshot?.contractAddress && !!networkConfig.snapshot?.id,
      }
    : {
        labels: {
          init: 'Delegate',
          title: 'Delegate',
          confirming: 'Confirming delegation...',
          confirmed: 'Delegated!',
          tooltip: 'Delegate your voting power',
        },
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
        onTransactionChange: () => {},
        enabled:
          isConnected &&
          !!networkConfig.snapshot?.contractAddress &&
          !!networkConfig.snapshot?.id &&
          !!networkConfig.snapshot?.delegateAddress,
      }

  const managedTransaction = useManagedTransaction(transactionInput)

  useEffect(() => {
    if (managedTransaction?.result.isSuccess) {
      refetch()
    }
  }, [managedTransaction, refetch])

  useEffect(() => {
    if (managedTransaction?.execution.error) {
      if (isUserRejectedError(managedTransaction.execution.error)) {
        resetTransaction(managedTransaction)
      }
    }
  }, [managedTransaction])

  const transactionState = getTransactionState(managedTransaction)

  const isLoading =
    transactionState === TransactionState.Loading ||
    transactionState === TransactionState.Confirming ||
    transactionState === TransactionState.Preparing

  const execute = async () => {
    if (isLoading) return

    try {
      await managedTransaction.executeAsync()
    } catch (error) {
      console.error('Delegation toggle error:', error)
    }
  }

  return {
    isDelegatedToMDs,
    delegationAddress,
    transactionState,
    isLoading,
    execute,
    managedTransaction,
  }
}
