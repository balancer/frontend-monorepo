'use client'

import {
  ManagedResult,
  TransactionLabels,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useEffect } from 'react'
import { useEstimateGas, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { TransactionConfig, TransactionExecution, TransactionSimulation } from './contract.types'
import { useOnTransactionConfirmation } from './useOnTransactionConfirmation'
import { useOnTransactionSubmission } from './useOnTransactionSubmission'
import { getGqlChain } from '@repo/lib/config/app.config'
import { useChainSwitch } from '../useChainSwitch'
import {
  captureWagmiExecutionError,
  sentryMetaForWagmiExecution,
} from '@repo/lib/shared/utils/query-errors'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { useRecentTransactions } from '../../transactions/RecentTransactionsProvider'
import { useTxHash } from '../safe.hooks'
import { getWaitForReceiptTimeout } from './wagmi-helpers'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { bn } from '@repo/lib/shared/utils/numbers'

export type ManagedSendTransactionInput = {
  labels: TransactionLabels
  txConfig: TransactionConfig
  gasEstimationMeta?: Record<string, unknown>
  // TODO(transaction-refactor): make it non-optional once all steps are migrated to use onTransactionChange
  onTransactionChange?: (transaction: ManagedResult) => void
}

export function useManagedSendTransaction({
  labels,
  txConfig,
  gasEstimationMeta,
}: ManagedSendTransactionInput) {
  const chainId = txConfig.chainId
  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const { minConfirmations } = useNetworkConfig()
  const { updateTrackedTransaction } = useRecentTransactions()

  const estimateGasQueryOriginal = useEstimateGas({
    ...txConfig,
    query: {
      enabled: !!txConfig && !shouldChangeNetwork,
      meta: gasEstimationMeta,
      // In chains like polygon, we don't want background refetches while waiting for min block confirmations
      ...onlyExplicitRefetch,
    },
  })

  // make a copy here so we can adjust the data below
  let estimateGasQuery
  estimateGasQuery = estimateGasQueryOriginal

  // increase gas limit here to make sure v3 boosted pool transactions have enough gas
  if (estimateGasQueryOriginal.data) {
    const originalGas = estimateGasQueryOriginal.data
    const adjustedGas = BigInt(bn(originalGas).times(1.1).toFixed(0))

    estimateGasQuery = {
      ...estimateGasQueryOriginal,
      data: adjustedGas,
    }
  }

  const writeMutation = useSendTransaction({
    mutation: {
      meta: sentryMetaForWagmiExecution('Error sending transaction', {
        txConfig,
        estimatedGas: estimateGasQuery.data,
        tenderlyUrl: gasEstimationMeta?.tenderlyUrl,
      }),
    },
  })

  const { txHash, isSafeTxLoading } = useTxHash({
    chainId,
    wagmiTxHash: writeMutation.data,
  })

  const transactionStatusQuery = useWaitForTransactionReceipt({
    chainId,
    hash: txHash,
    confirmations: minConfirmations,
    timeout: getWaitForReceiptTimeout(chainId),
    query: {
      ...onlyExplicitRefetch,
    },
  })

  const bundle = {
    chainId,
    simulation: estimateGasQuery as TransactionSimulation,
    execution: writeMutation as TransactionExecution,
    result: transactionStatusQuery,
    isSafeTxLoading,
  }

  useEffect(() => {
    if (transactionStatusQuery.error) {
      if (txHash) {
        updateTrackedTransaction(txHash, {
          status: 'timeout',
          label: 'Transaction timeout',
          duration: null,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionStatusQuery.error])

  // on successful submission to chain, add tx to cache
  useOnTransactionSubmission({
    labels,
    hash: txHash,
    chain: getGqlChain(chainId),
  })

  // on confirmation, update tx in tx cache
  useOnTransactionConfirmation({
    labels,
    status: bundle.result.data?.status,
    hash: bundle.result.data?.transactionHash,
  })

  const managedSendAsync = txConfig
    ? async () => {
        if (!estimateGasQuery.data) return
        if (!txConfig?.to) return
        try {
          return writeMutation.sendTransactionAsync({
            chainId,
            to: txConfig.to,
            data: txConfig.data,
            value: txConfig.value,
            gas: estimateGasQuery.data,
          })
        } catch (e: unknown) {
          captureWagmiExecutionError(e, 'Error in send transaction execution', {
            chainId,
            txConfig,
            gas: estimateGasQuery.data,
          })
          throw e
        }
      }
    : undefined

  return {
    ...bundle,
    executeAsync: managedSendAsync,
  } satisfies ManagedResult
}
