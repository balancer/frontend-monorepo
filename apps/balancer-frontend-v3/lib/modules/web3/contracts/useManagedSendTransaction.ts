/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { ManagedResult, TransactionLabels } from '@/lib/modules/transactions/transaction-steps/lib'
import { useEffect } from 'react'
import { useEstimateGas, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { TransactionConfig, TransactionExecution, TransactionSimulation } from './contract.types'
import { useOnTransactionConfirmation } from './useOnTransactionConfirmation'
import { useOnTransactionSubmission } from './useOnTransactionSubmission'
import { getGqlChain } from '@/lib/config/app.config'
import { useChainSwitch } from '../useChainSwitch'
import {
  captureWagmiExecutionError,
  sentryMetaForWagmiExecution,
} from '@/lib/shared/utils/query-errors'
import { useNetworkConfig } from '@/lib/config/useNetworkConfig'
import { useRecentTransactions } from '../../transactions/RecentTransactionsProvider'
import { mainnet } from 'viem/chains'
import { useTxHash } from '../safe.hooks'
import { getWaitForReceiptTimeout } from './wagmi-helpers'
import { onlyExplicitRefetch } from '@/lib/shared/utils/queries'

export type ManagedSendTransactionInput = {
  labels: TransactionLabels
  txConfig?: TransactionConfig
  gasEstimationMeta?: Record<string, unknown>
}

export function useManagedSendTransaction({
  labels,
  txConfig,
  gasEstimationMeta,
}: ManagedSendTransactionInput) {
  // chainId will always have the correct value as the transaction is disabled when txConfig is undefined
  const chainId = txConfig?.chainId || mainnet.id
  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const { minConfirmations } = useNetworkConfig()
  const { updateTrackedTransaction } = useRecentTransactions()

  const estimateGasQuery = useEstimateGas({
    ...txConfig,
    query: {
      enabled: !!txConfig && !shouldChangeNetwork,
      meta: gasEstimationMeta,
      // In chains like polygon, we don't want background refetches while waiting for min block confirmations
      ...onlyExplicitRefetch,
    },
  })

  const writeMutation = useSendTransaction({
    mutation: {
      meta: sentryMetaForWagmiExecution('Error sending transaction', {
        txConfig,
        estimatedGas: estimateGasQuery.data,
        tenderlyUrl: gasEstimationMeta?.tenderlyUrl,
      }),
    },
  })

  const { txHash, isSafeTxLoading } = useTxHash({ chainId, wagmiTxHash: writeMutation.data })

  const transactionStatusQuery = useWaitForTransactionReceipt({
    chainId,
    hash: txHash,
    confirmations: minConfirmations,
    timeout: getWaitForReceiptTimeout(chainId),
  })

  const bundle = {
    chainId,
    simulation: estimateGasQuery as TransactionSimulation,
    execution: writeMutation as TransactionExecution,
    result: transactionStatusQuery,
    isSafeTxLoading,
  }

  // when the transaction is successfully submitted to the chain
  // start monitoring the hash
  //
  // when the transaction has an execution error, update that within
  // the global transaction cache too
  useEffect(() => {
    if (bundle?.execution?.data) {
      // add transaction here
    }
  }, [bundle.execution?.data])

  // when the transaction has an execution error, update that within
  // the global transaction cache
  // this can either be an execution error or a confirmation error
  useEffect(() => {
    if (bundle?.execution?.error) {
      // monitor execution error here
    }
    if (bundle?.result?.error) {
      // monitor confirmation error here
    }
  }, [bundle.execution?.error, bundle.result?.error])

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

  const managedSendAsync = async () => {
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

  return {
    ...bundle,
    executeAsync: managedSendAsync,
  } satisfies ManagedResult
}
