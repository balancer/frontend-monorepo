import { TransactionStep, TxCall } from './lib'

/*
  Builds the list of calls to be executed inside a single batched transaction.
  The parent step call is always appended at the end, and completed nested
  steps (i.e. approvals that are no longer required) are skipped.

  This shape is wallet-agnostic: `{ to, data, value }` maps 1:1 to the
  calls array of EIP-5792 `wallet_sendCalls` and to the Safe Apps SDK
  transaction type (the value string conversion happens in the submitter).
*/
export function buildTxBatch(transactionStep: TransactionStep): TxCall[] {
  if (!transactionStep.nestedSteps) return [transactionStep.batchableTxCall!]
  return [
    ...transactionStep.nestedSteps
      // Comment the following line to test batching when tokens are already allowed
      .filter(step => !step.isComplete())
      .map(step => step.batchableTxCall!),
    transactionStep.batchableTxCall!,
  ]
}

export function hasSomePendingNestedTxInBatch(step: TransactionStep): boolean {
  return step?.nestedSteps?.some(nestedStep => !nestedStep.isComplete()) ?? false
}

export function getPendingNestedSteps(step: TransactionStep) {
  return step?.nestedSteps?.filter(nestedStep => !nestedStep.isComplete())
}
