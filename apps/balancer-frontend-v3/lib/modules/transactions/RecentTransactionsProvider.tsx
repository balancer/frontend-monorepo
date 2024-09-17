'use client'

import { getChainId } from '@/lib/config/app.config'
import { Toast } from '@/lib/shared/components/toasts/Toast'
import { getBlockExplorerTxUrl } from '@/lib/shared/hooks/useBlockExplorer'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { ensureError } from '@/lib/shared/utils/errors'
import { captureFatalError } from '@/lib/shared/utils/query-errors'
import { secs } from '@/lib/shared/utils/time'
import { AlertStatus, ToastId, useToast } from '@chakra-ui/react'
import { keyBy, orderBy, take } from 'lodash'
import React, { ReactNode, createContext, useCallback, useEffect, useState } from 'react'
import { Hash } from 'viem'
import { useConfig, usePublicClient } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { getWaitForReceiptTimeout } from '../web3/contracts/wagmi-helpers'

export type RecentTransactionsResponse = ReturnType<typeof _useRecentTransactions>
export const TransactionsContext = createContext<RecentTransactionsResponse | null>(null)
const NUM_RECENT_TRANSACTIONS = 20

// confirming = transaction has not been mined
// confirmed = transaction has been mined and is present on chain
// reverted = transaction has been mined and is present on chain - but the execution was reverted
// rejected = transaction was rejected by the rpc / other execution error prior to submission to chain
// timeout =  the transaction hash was generated but waitForTransactionReceipt throws a timeout error (edge-case in polygon)
// unknown =  the transaction hash was generated but waitForTransactionReceipt throws a non timeout error (we never had this error)
export type TransactionStatus =
  | 'confirming'
  | 'confirmed'
  | 'reverted'
  | 'rejected'
  | 'timeout'
  | 'unknown'

export type TrackedTransaction = {
  hash: Hash
  label?: string
  description?: string
  status: TransactionStatus
  toastId?: ToastId
  timestamp: number
  init?: string
  chain: GqlChain
  duration?: number | null
  poolId?: string
}

type UpdateTrackedTransaction = Pick<
  TrackedTransaction,
  'label' | 'description' | 'status' | 'duration'
>

const TransactionStatusToastStatusMapping: Record<TransactionStatus, AlertStatus> = {
  confirmed: 'success',
  confirming: 'loading',
  reverted: 'error',
  rejected: 'error',
  timeout: 'warning',
  unknown: 'warning',
}

export function _useRecentTransactions() {
  const [transactions, setTransactions] = useState<Record<string, TrackedTransaction>>({})
  const toast = useToast()
  const publicClient = usePublicClient()
  const config = useConfig()

  // when loading transactions from the localStorage cache and we identify any unconfirmed
  // transactions, we should fetch the receipt of the transactions
  const waitForUnconfirmedTransactions = useCallback(
    async (transactions: Record<string, TrackedTransaction>) => {
      const unconfirmedTransactions = Object.values(transactions).filter(
        tx => tx.status === 'confirming'
      )

      const updatePayload = {
        ...transactions,
      }
      // we cannot use a wagmi hook here as useWaitForTransaction does not support a list of hashes
      // nor can we render multiple useWaitForTransaction hooks
      // so we use the underlying viem call to get the transactions confirmation status
      for (const tx of unconfirmedTransactions) {
        try {
          const receipt = await waitForTransactionReceipt(config, {
            hash: tx.hash,
            chainId: getChainId(tx.chain),
            timeout: getWaitForReceiptTimeout(getChainId(tx.chain)),
          })
          if (receipt?.status === 'success') {
            updatePayload[tx.hash] = {
              ...tx,
              status: 'confirmed',
            }
          } else {
            updatePayload[tx.hash] = {
              ...tx,
              status: 'reverted',
            }
          }
          setTransactions(updatePayload)
        } catch (error) {
          console.error('Error in RecentTransactionsProvider: ', error)

          /* This is an edge-case that we found randomly happening in polygon.
          Debug tip:
          Enforce a timeout in waitForTransactionReceipt inside node_modules/viem waitForTransactionReceipt
          to reproduce the issue
          */
          captureFatalError(
            error,
            'waitForTransactionReceiptError',
            'Error in waitForTransactionReceipt inside RecentTransactionsProvider',
            { txHash: tx.hash }
          )
          const isTimeoutError = ensureError(error).name === 'WaitForTransactionReceiptTimeoutError'
          updatePayload[tx.hash] = {
            ...tx,
            status: isTimeoutError ? 'timeout' : 'unknown',
          }
          setTransactions(updatePayload)
        }
      }
      updateLocalStorage(updatePayload)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient]
  )

  // fetch recent transactions from local storage
  useEffect(() => {
    const _recentTransactions = localStorage.getItem('balancer.recentTransactions')
    if (_recentTransactions) {
      const recentTransactions = JSON.parse(_recentTransactions)
      setTransactions(recentTransactions)
      // confirm the status of any past confirming transactions
      // on load
      waitForUnconfirmedTransactions(recentTransactions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleTransactionAdded(trackedTransaction: TrackedTransaction) {
    // add a toast for this transaction, rather than emitting a new toast
    // on updates for the same transaction, we will modify the same toast
    // using updateTrackedTransaction.
    const toastId = toast({
      title: trackedTransaction.label,
      description: trackedTransaction.description,
      status: 'loading',
      duration: trackedTransaction.duration ?? null,
      isClosable: true,
      render: ({ ...rest }) => (
        <Toast
          linkUrl={getBlockExplorerTxUrl(trackedTransaction.hash, trackedTransaction.chain)}
          {...rest}
        />
      ),
    })

    if (!trackedTransaction.hash) {
      throw new Error('Attempted to add a transaction to the cache without a hash.')
    }
    // Make sure to store a reference to the toast on this transaction
    const updatedTrackedTransactions = {
      ...transactions,
      [trackedTransaction.hash]: { ...trackedTransaction, toastId },
    }

    // keep only the 'n' most recent transactions
    const mostRecentTransactions = keyBy(
      take(
        orderBy(Object.values(updatedTrackedTransactions), 'timestamp', 'desc'),
        NUM_RECENT_TRANSACTIONS
      ),
      'hash'
    )

    setTransactions(mostRecentTransactions)
    updateLocalStorage(updatedTrackedTransactions)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function updateTrackedTransaction(hash: Hash, updatePayload: UpdateTrackedTransaction) {
    // attempt to find this transaction in the cache
    const cachedTransaction = transactions[hash]

    // seems like we couldn't find this transaction in the cache
    // TODO discuss behaviour around this
    if (!cachedTransaction) {
      console.log({ hash, transactions })
      throw new Error('Cannot update a cached tracked transaction that does not exist.')
    }

    const updatedCachedTransaction = {
      ...cachedTransaction,
      ...updatePayload,
    }

    const updatedCache = {
      ...transactions,
      [hash]: updatedCachedTransaction,
    }

    setTransactions(updatedCache)
    updateLocalStorage(updatedCache)

    const duration = updatePayload.duration

    // update the relevant toast too
    if (updatedCachedTransaction.toastId) {
      if (updatePayload.status === 'timeout' || updatePayload.status === 'unknown') {
        // Close the toast as these errors are shown as alerts inside the TransactionStepButton
        return toast.close(updatedCachedTransaction.toastId)
      }

      toast.update(updatedCachedTransaction.toastId, {
        status: TransactionStatusToastStatusMapping[updatePayload.status],
        title: updatedCachedTransaction.label,
        description: updatedCachedTransaction.description,
        isClosable: true,
        duration: duration || duration === null ? duration : secs(10).toMs(),
        render: ({ ...rest }) => (
          <Toast
            linkUrl={getBlockExplorerTxUrl(
              updatedCachedTransaction.hash,
              updatedCachedTransaction.chain
            )}
            {...rest}
          />
        ),
      })
    }
  }

  function updateLocalStorage(customUpdate?: Record<string, TrackedTransaction>) {
    localStorage.setItem(
      'balancer.recentTransactions',
      JSON.stringify(customUpdate || transactions)
    )
  }

  function addTrackedTransaction(trackedTransaction: TrackedTransaction) {
    handleTransactionAdded(trackedTransaction)
  }

  function clearTransactions() {
    updateLocalStorage({})
    setTransactions({})
  }

  return { transactions, addTrackedTransaction, updateTrackedTransaction, clearTransactions }
}

export function RecentTransactionsProvider({ children }: { children: ReactNode }) {
  const transactions = _useRecentTransactions()
  return (
    <TransactionsContext.Provider value={transactions}>{children}</TransactionsContext.Provider>
  )
}

export const useRecentTransactions = () =>
  useMandatoryContext(TransactionsContext, 'RecentTransactionsProvider')
