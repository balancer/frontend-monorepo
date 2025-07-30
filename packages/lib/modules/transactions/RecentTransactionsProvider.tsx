'use client'

import { getChainId } from '@repo/lib/config/app.config'
import { Toast } from '@repo/lib/shared/components/toasts/Toast'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { ensureError } from '@repo/lib/shared/utils/errors'
import { captureFatalError } from '@repo/lib/shared/utils/query-errors'
import { secs } from '@repo/lib/shared/utils/time'
import { AlertStatus, ToastId, useToast } from '@chakra-ui/react'
import { keyBy, orderBy, take } from 'lodash'
import { ReactNode, createContext, useCallback, useEffect, useState } from 'react'
import { Hash } from 'viem'
import { useConfig, usePublicClient } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { getWaitForReceiptTimeout } from '../web3/contracts/wagmi-helpers'
import { TransactionStatus as SafeTxStatus } from '@safe-global/safe-apps-sdk'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getBlockExplorerTxUrl } from '@repo/lib/shared/utils/blockExplorer'
import { Address } from 'viem'

export type RecentTransactionsResponse = ReturnType<typeof useRecentTransactionsLogic>
export const TransactionsContext = createContext<RecentTransactionsResponse | null>(null)
const NUM_RECENT_TRANSACTIONS = 20
const RECENT_TRANSACTIONS_KEY = `${PROJECT_CONFIG.projectId}.recentTransactions`
import { useQuery } from '@tanstack/react-query'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { safeStatusToBalancerStatus } from './transaction-steps/safe/safe.helpers'

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

export type SafeTransactionStatus = SafeTxStatus

export type TransactionType = 'standard' | 'safe'

export type TrackedTransaction = {
  hash: Hash
  type: TransactionType
  label?: string
  description?: string
  status: TransactionStatus
  toastId?: ToastId
  timestamp: number
  init?: string
  chain: GqlChain
  duration?: number | null
  poolId?: string
  safeTxId?: string
  safeTxAddress?: Address
}

type UpdateTrackedTransaction = Pick<
  TrackedTransaction,
  'label' | 'description' | 'status' | 'duration' | 'safeTxId' | 'safeTxAddress'
>

const TransactionStatusToastStatusMapping: Record<TransactionStatus, AlertStatus> = {
  confirmed: 'success',
  confirming: 'loading',
  reverted: 'error',
  rejected: 'error',
  timeout: 'warning',
  unknown: 'warning',
}

export function useRecentTransactionsLogic() {
  const [transactions, setTransactions] = useState<Record<string, TrackedTransaction>>({})
  const toast = useToast()
  const publicClient = usePublicClient()
  const config = useConfig()

  // when loading transactions from the localStorage cache and we identify any unconfirmed
  // transactions, we should fetch the receipt of the transactions
  const waitForUnconfirmedTransactions = useCallback(
    async (transactions: Record<string, TrackedTransaction>) => {
      const unconfirmedTransactions = Object.values(transactions).filter(
        tx => tx.type === 'standard' && tx.status === 'confirming'
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
    const _recentTransactions = localStorage.getItem(RECENT_TRANSACTIONS_KEY)
    if (_recentTransactions) {
      const recentTransactions = JSON.parse(_recentTransactions)
      setTransactions(recentTransactions)
      // confirm the status of any past confirming transactions
      // on load
      waitForUnconfirmedTransactions(recentTransactions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useQuery({
    queryKey: ['safeTxStatus'],
    queryFn: () => {
      const safeAppsSdk = new SafeAppsSDK()

      const unconfirmedTransactions = Object.values(transactions).filter(
        tx => tx.type === 'safe' && tx.status === 'confirming'
      )

      unconfirmedTransactions.forEach(safeTrackedTx => {
        safeAppsSdk.txs.getBySafeTxHash(safeTrackedTx.hash).then(tx => {
          updateTrackedTransaction(safeTrackedTx.hash, {
            status: safeStatusToBalancerStatus(tx.txStatus),
          })

          if (
            tx.txHash &&
            !isTxTracked(tx.txHash as Hash) &&
            safeStatusToBalancerStatus(tx.txStatus) === 'confirmed'
          ) {
            addTrackedTransaction(
              {
                hash: tx.txHash as Hash,
                type: 'standard',
                status: 'confirmed',
                chain: safeTrackedTx.chain,
                init: safeTrackedTx.label,
                description: safeTrackedTx.description,
                timestamp: Date.now(),
              },
              false
            )
          }
        })
      })

      return unconfirmedTransactions.map(tx => tx.hash)
    },
    refetchInterval: 5000,
  })

  function addTrackedTransaction(
    trackedTransaction: TrackedTransaction,
    showToast: boolean = true
  ) {
    // add a toast for this transaction, rather than emitting a new toast
    // on updates for the same transaction, we will modify the same toast
    // using updateTrackedTransaction.
    let toastId: ToastId | undefined = undefined
    // Edge case: if the transaction is confirmed we don't show the toast
    if (trackedTransaction.status !== 'confirmed' && showToast) {
      toastId = toast({
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
    }

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

  function updateTrackedTransaction(hash: Hash, updatePayload: UpdateTrackedTransaction) {
    // attempt to find this transaction in the cache
    const cachedTransaction = transactions[hash]

    if (!cachedTransaction) {
      console.log('Cannot update a cached tracked transaction', { hash, transactions })
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
    localStorage.setItem(RECENT_TRANSACTIONS_KEY, JSON.stringify(customUpdate || transactions))
  }

  function clearTransactions() {
    updateLocalStorage({})
    setTransactions({})
  }

  function isTxTracked(txHash: Hash) {
    return !!transactions[txHash]
  }

  return {
    transactions,
    addTrackedTransaction,
    updateTrackedTransaction,
    clearTransactions,
    isTxTracked,
  }
}

export function RecentTransactionsProvider({ children }: { children: ReactNode }) {
  const transactions = useRecentTransactionsLogic()
  return (
    <TransactionsContext.Provider value={transactions}>{children}</TransactionsContext.Provider>
  )
}

export const useRecentTransactions = () =>
  useMandatoryContext(TransactionsContext, 'RecentTransactionsProvider')
