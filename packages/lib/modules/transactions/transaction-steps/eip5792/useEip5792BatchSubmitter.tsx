'use client'

import { noop } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { useCallsStatus, useSendCalls, useWaitForTransactionReceipt } from 'wagmi'
import { ensureError } from '@repo/lib/shared/utils/errors'
import { getWaitForReceiptTimeout } from '../../../web3/contracts/wagmi-helpers'
import { TransactionExecution, TransactionSimulation } from '../../../web3/contracts/contract.types'
import { useUserAccount } from '../../../web3/UserAccountProvider'
import { useRecentTransactions } from '../../RecentTransactionsProvider'
import { getGqlChain } from '@repo/lib/config/app.config'
import {
  ManagedResult,
  TransactionLabels,
  TransactionState,
  TransactionStep,
  BatchSubmitter,
} from '../lib'
import { buildTxBatch } from '../tx-batch.helpers'
import { getTransactionButtonLabel } from '../transaction-button.helpers'
import { Hash } from 'viem'

type Props = {
  labels: TransactionLabels
  chainId: number
  currentStep: TransactionStep
  onTransactionChange: (transaction: ManagedResult) => void
}

/*
  EIP-5792 batch submitter for EIP-7702 capable wallets.
  Sends the whole batch (approvals + action) as a single atomic `wallet_sendCalls`
  request and maps the resulting calls status into the existing ManagedResult shape so
  the step tracker works untouched.

  Status mapping (EIP-5792):
  - pending  -> confirming
  - success  -> completed (statusCode 200)
  - failure  -> reverted (statusCode 500 / 600)
*/
export function useEip5792BatchSubmitter({
  labels,
  chainId,
  currentStep,
  onTransactionChange,
}: Props): BatchSubmitter {
  const { userAddress } = useUserAccount()
  const [callsId, setCallsId] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const lastReportedKeyRef = useRef<string | undefined>(undefined)
  const updatedTxHashRef = useRef<string | undefined>(undefined)

  const { mutateAsync } = useSendCalls({})

  const callsStatusQuery = useCallsStatus({
    id: callsId ?? '',
    query: {
      enabled: !!callsId,
      // Poll every 5s while the batch is pending; stop once it settles.
      refetchInterval: query => (query.state.data?.status === 'pending' ? 5000 : false),
    },
  })

  // The EIP-5792 receipt from wallet_getCallsStatus has empty logs, so we fetch the
  // real on-chain receipt (which contains the ERC-20 Transfer events) using the
  // transactionHash from the last call in the batch.
  const txHash =
    callsStatusQuery.data?.receipts?.[callsStatusQuery.data.receipts.length - 1]?.transactionHash

  const transactionReceiptQuery = useWaitForTransactionReceipt({
    chainId,
    hash: txHash,
    timeout: getWaitForReceiptTimeout(chainId),
    query: {
      enabled: !!txHash,
    },
  })

  const txBatch = buildTxBatch(currentStep)

  async function submit() {
    setError(undefined)
    setIsLoading(true)

    try {
      const { id } = await mutateAsync({
        account: userAddress,
        chainId,
        calls: txBatch,
        forceAtomic: true,
      })

      setCallsId(id)
    } catch (e: unknown) {
      setIsLoading(false)
      setError(getEip5792ErrorMessage(ensureError(e)))
    }
  }

  const callsStatus = callsStatusQuery.data?.status

  useEffect(() => {
    if (!callsId) return
    if (!callsStatus) return
    const isError = callsStatus === 'failure'

    // Use the real on-chain receipt (fetched via useWaitForTransactionReceipt) so the
    // receipt parser gets the actual ERC-20 Transfer logs. The EIP-5792 receipt's logs
    // are empty, so we can't rely on them.
    const realReceipt = transactionReceiptQuery.data

    // Only mark success once the real receipt (with its transactionHash) is available.
    // Marking success before that would trigger updateOnSuccessCalled with a missing
    // transaction hash and throw.
    const isSuccess = callsStatus === 'success' && !!realReceipt

    // Re-run only when the reported state actually changes. The receipt can arrive
    // after the status has already flipped to 'success', so key on the full state
    // (status + receipt presence), not the status alone. This also absorbs the
    // re-fires from the polling query and unstable onTransactionChange identity.
    const reportKey = `${callsStatus}:${isSuccess}`
    if (lastReportedKeyRef.current === reportKey) return
    lastReportedKeyRef.current = reportKey

    const successFullTransaction: ManagedResult = {
      chainId,
      simulation: { data: null, status: 'success' } as unknown as TransactionSimulation,
      execution: {
        data: null,
        status: 'success',
        reset: noop,
      } as unknown as TransactionExecution,
      result: {
        status: isSuccess ? 'success' : isError ? 'reverted' : 'pending',
        isSuccess,
        isError,
        isLoading: !isSuccess && !isError,
        data: realReceipt ?? null,
      } as unknown as ManagedResult['result'],
      executeAsync: noop,
      isSafeTxLoading: false,
    }

    onTransactionChange(successFullTransaction)
  }, [callsId, callsStatus, transactionReceiptQuery.data, chainId, onTransactionChange])

  const { isTxTracked, addTrackedTransaction, updateTrackedTransaction } = useRecentTransactions()

  // Track the batch by its calls id from the moment it is submitted so the user gets
  // a 'confirming' toast immediately, like the regular flow. The calls id is not a
  // real transaction hash; when the real hash becomes available (batch settled) the
  // entry is re-keyed to it, preserving the toast and the recent activity entry.
  const addedCallsIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!callsId) return
    if (addedCallsIdRef.current === callsId) return

    addedCallsIdRef.current = callsId

    addTrackedTransaction(
      {
        hash: callsId as Hash,
        type: 'eip5792',
        status: 'confirming',
        chain: getGqlChain(chainId),
        init: labels.init,
        label: labels.confirming || 'Confirming transaction',
        description: labels.description,
        timestamp: Date.now(),
      },
      true
    )
  }, [callsId, addTrackedTransaction, chainId, labels.init, labels.confirming, labels.description])

  // Update to confirmed/reverted once the batch settles, re-keying the entry from
  // the calls id to the real transaction hash. Keyed on isTxTracked: when the
  // status settles in the same render the calls id first appears, the add's
  // setState has not propagated yet, so this effect re-runs after the add commits
  // — by then the entry is in the cache and the closures are fresh.
  // updatedTxHashRef guards against repeat updates.
  useEffect(() => {
    if (!callsId || !txHash) return
    if (!isTxTracked(callsId as Hash)) return
    if (updatedTxHashRef.current === txHash) return

    if (callsStatus !== 'success' && callsStatus !== 'failure') return

    updatedTxHashRef.current = txHash

    updateTrackedTransaction(callsId as Hash, {
      hash: txHash,
      label: callsStatus === 'success' ? labels.confirmed : labels.reverted,
      status: callsStatus === 'success' ? 'confirmed' : 'reverted',
    })
  }, [
    callsId,
    txHash,
    callsStatus,
    isTxTracked,
    updateTrackedTransaction,
    labels.confirmed,
    labels.reverted,
  ])

  // Keep the button visible (disabled) while the batch is pending so the user sees
  // a "Confirming..." state, matching the regular flow. Hide it once settled.
  const isSettled = callsStatus === 'success' || callsStatus === 'failure'
  const canSubmit = !isSettled
  // Show the loading state while the wallet is signing or the batch is pending.
  const isPending = isLoading || (!!callsId && !isSettled)

  const label = (() => {
    if (error) return labels.init
    if (callsStatus === 'success') return labels.confirmed || 'Confirmed transaction'
    if (callsStatus === 'failure') return labels.reverted || labels.init
    if (callsStatus === 'pending') return labels.confirming || 'Confirming transaction'
    return (
      getTransactionButtonLabel({
        transactionState: TransactionState.Ready,
        labels,
      }) ?? labels.init
    )
  })()

  return { submit, isLoading: isPending, error, label, canSubmit }
}

// EIP-5792 error codes surfaced by the wallet during an `atomic: ready` upgrade flow
const USER_REJECTED_UPGRADE_CODE = 5750
const ATOMICITY_UNSUPPORTED_CODE = 5760

export function getEip5792ErrorMessage(error: Error): Error {
  const code = (error as Error & { code?: number }).code

  if (code === USER_REJECTED_UPGRADE_CODE) {
    return new Error('Upgrade rejected. The wallet needs to be upgraded to batch transactions.')
  }

  if (code === ATOMICITY_UNSUPPORTED_CODE) {
    return new Error('Atomic transaction bundling is not supported by this wallet.')
  }

  return error
}
