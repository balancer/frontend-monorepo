'use client'

import { getChainId } from '@repo/lib/config/app.config'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { useManagedTransaction } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isUserRejectedError } from '@repo/lib/shared/utils/error-filters'
import { useEffect, useState } from 'react'
import { useDelegation } from './useDelegation'
import {
  getTransactionState,
  ManagedResult,
  TransactionState,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { resetTransaction } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

export function useDelegationToggle(chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const [setTransaction, setSetTransaction] = useState<ManagedResult | undefined>()
  const [clearTransaction, setClearTransaction] = useState<ManagedResult | undefined>()
  const { data: isDelegatedToMDs, delegationAddress, refetch } = useDelegation()
  const networkConfig = getNetworkConfig(chain)

  // Transaction for setting delegation (enabling the toggle)
  const setDelegateTransaction = useManagedTransaction({
    labels: {
      init: 'Delegate',
      title: 'Delegate',
      confirming: 'Confirming delegation...',
      confirmed: 'Delegated!',
      tooltip: 'Delegate your voting power',
    },
    chainId: getChainId(chain),
    contractId: 'snapshot.delegateRegistry',
    contractAddress: networkConfig.snapshot?.contractAddress || '',
    functionName: 'setDelegate',
    args:
      networkConfig.snapshot && networkConfig.snapshot.id && networkConfig.snapshot.delegateAddress
        ? [networkConfig.snapshot.id, networkConfig.snapshot.delegateAddress]
        : null,
    onTransactionChange: setSetTransaction,
    enabled:
      isConnected &&
      !!networkConfig.snapshot?.contractAddress &&
      !!networkConfig.snapshot?.id &&
      !!networkConfig.snapshot?.delegateAddress,
  })

  // Transaction for clearing delegation (disabling the toggle)
  const clearDelegateTransaction = useManagedTransaction({
    labels: {
      init: 'Undelegate',
      title: 'Undelegate',
      confirming: 'Confirming undelegate...',
      confirmed: 'Undelegated!',
      tooltip: 'Clear your delegation',
    },
    chainId: getChainId(chain),
    contractId: 'snapshot.delegateRegistry',
    contractAddress: networkConfig.snapshot?.contractAddress || '',
    functionName: 'clearDelegate',
    args: networkConfig.snapshot?.id ? [networkConfig.snapshot.id] : null,
    onTransactionChange: setClearTransaction,
    enabled:
      isConnected && !!networkConfig.snapshot?.contractAddress && !!networkConfig.snapshot?.id,
  })

  // Handle successful transactions by refetching delegation status
  useEffect(() => {
    if (setTransaction?.result.isSuccess || clearTransaction?.result.isSuccess) {
      refetch()
    }
  }, [setTransaction?.result.isSuccess, clearTransaction?.result.isSuccess, refetch])

  // Handle errors - reset transaction state if user cancelled in wallet
  useEffect(() => {
    if (setTransaction?.execution.error) {
      if (isUserRejectedError(setTransaction.execution.error)) {
        resetTransaction(setDelegateTransaction)
      }
    }
  }, [setTransaction?.execution.error, setDelegateTransaction])

  useEffect(() => {
    if (clearTransaction?.execution.error) {
      if (isUserRejectedError(clearTransaction.execution.error)) {
        resetTransaction(clearDelegateTransaction)
      }
    }
  }, [clearTransaction?.execution.error, clearDelegateTransaction])

  // Determine which transaction is currently active
  const activeTransaction = isDelegatedToMDs ? clearDelegateTransaction : setDelegateTransaction
  const transactionState = getTransactionState(activeTransaction)

  // Check if switch should be disabled (during transaction processing)
  const isLoading =
    transactionState === TransactionState.Loading ||
    transactionState === TransactionState.Confirming ||
    transactionState === TransactionState.Preparing

  // Handle toggle
  const handleToggle = async () => {
    console.log('Toggling delegation...', isLoading)
    if (isLoading) return

    try {
      if (isDelegatedToMDs) {
        await clearDelegateTransaction.executeAsync()
      } else {
        await setDelegateTransaction.executeAsync()
      }
    } catch (error) {
      // Errors are already handled in the useEffect hooks above
      console.error('Delegation toggle error:', error)
    }
  }

  return {
    isDelegatedToMDs,
    delegationAddress,
    isLoading,
    handleToggle,
    setDelegateTransaction,
    clearDelegateTransaction,
  }
}
