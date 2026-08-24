'use client'

import { noop } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { useSendCalls, useWaitForCallsStatus } from 'wagmi'
import { ensureError } from '@repo/lib/shared/utils/errors'
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
  const lastStatusRef = useRef<string | undefined>(undefined)

  const { sendCallsAsync } = useSendCalls({})

  const callsStatusQuery = useWaitForCallsStatus({
    id: callsId,
    query: {
      enabled: !!callsId,
    },
  })

  const txBatch = buildTxBatch(currentStep)

  async function submit() {
    setError(undefined)
    setIsLoading(true)

    try {
      const { id } = await sendCallsAsync({
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
    if (lastStatusRef.current === callsStatus) return

    lastStatusRef.current = callsStatus

    const isSuccess = callsStatus === 'success'
    const isError = callsStatus === 'failure'

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
        data: callsStatusQuery.data?.receipts?.[0] ?? null,
      } as unknown as ManagedResult['result'],
      executeAsync: noop,
      isSafeTxLoading: false,
    }

    onTransactionChange(successFullTransaction)
  }, [callsId, callsStatus, callsStatusQuery.data, chainId, onTransactionChange])

  const { isTxTracked, addTrackedTransaction } = useRecentTransactions()

  useEffect(() => {
    if (!callsId) return
    if (isTxTracked(callsId as `0x${string}`)) return

    addTrackedTransaction(
      {
        hash: callsId as `0x${string}`,
        type: 'standard',
        status: 'confirming',
        chain: getGqlChain(chainId),
        init: labels.init,
        label: labels.init,
        description: labels.description,
        timestamp: Date.now(),
      },
      false
    )
  }, [callsId, chainId, labels, isTxTracked, addTrackedTransaction])

  const canSubmit = !callsId && !isLoading

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

  return { submit, isLoading, error, label, canSubmit }
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
