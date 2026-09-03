import { TransactionStep, TxCall } from './lib'
import { Address, Abi, encodeFunctionData } from 'viem'
import { AbiMap } from '@repo/lib/modules/web3/contracts/AbiMap'

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

/*
  Encodes a contract call for a step that uses useManagedTransaction, so the same
  txConfig that feeds the managed transaction can also be sent inside a batch.
  Returns undefined until the inputs are ready (mirrors the batchableTxCall of the
  add/remove liquidity steps, which derive from their buildCallDataQuery).
*/
export function buildBatchableTxCall(
  contractId: keyof typeof AbiMap,
  contractAddress: string | undefined,
  functionName: string,
  args: readonly unknown[] | null | undefined
): TxCall | undefined {
  if (!contractAddress || !args || args.some(arg => arg === undefined || arg === null)) {
    return undefined
  }

  try {
    const data = encodeFunctionData({
      abi: AbiMap[contractId] as Abi,
      functionName,
      args,
    })

    return { to: contractAddress as Address, data }
  } catch {
    return undefined
  }
}
