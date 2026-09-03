'use client'

import { useUserSettings } from '../../user/settings/UserSettingsProvider'
import { useIsSafeApp } from '../../web3/safe.hooks'
import { useEip5792AtomicCapability } from '../../web3/useEip5792Capabilities'
import { TransactionStep, TxBatch } from './lib'
import { buildTxBatch, hasSomePendingNestedTxInBatch } from './tx-batch.helpers'

/*
  Returns true when the connected wallet can batch transactions and settings allow it.
  Supports both Safe smart accounts and EIP-7702 capable wallets (EIP-5792).
*/
export function useShouldBatchTransactions(): boolean {
  const { shouldUseTxBundling } = useUserSettings()
  const isSafeApp = useIsSafeApp()
  const { atomicStatus } = useEip5792AtomicCapability()
  const isEip5792 = atomicStatus === 'supported' || atomicStatus === 'ready'
  return shouldUseTxBundling && (isSafeApp || isEip5792)
}

/* isStepWithTxBatch is true if:
  1. the wallet can batch transactions (Safe or EIP-7702)
  2. the current step has nested batchable transactions
  3. some of the nested transactions is not completed
*/
export function useStepWithTxBatch(currentStep: TransactionStep): {
  isStepWithTxBatch: boolean
  txBatch?: TxBatch
} {
  const noBatchStep = { isStepWithTxBatch: false }
  const shouldBatchTx = useShouldBatchTransactions()

  if (!shouldBatchTx) return noBatchStep
  if (!currentStep.isBatchEnd) return noBatchStep

  const txBatch: TxBatch = buildTxBatch(currentStep)
  if (txBatch.length === 1) return noBatchStep

  if (!hasSomePendingNestedTxInBatch(currentStep)) return noBatchStep

  return { isStepWithTxBatch: true, txBatch }
}
