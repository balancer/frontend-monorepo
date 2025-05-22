import { TransactionResult } from '../../web3/contracts/contract.types'
import { ManagedResult } from './lib'

export function resetTransaction(v: ManagedResult) {
  // Resetting the execution transaction does not immediately reset execution and result statuses so we need to reset them manually
  v.execution.status = 'pending'
  v.result = { status: 'pending', isSuccess: false, data: undefined } as TransactionResult
  v.execution.reset()
  return v
}

export function isTransactionSuccess(transaction?: ManagedResult) {
  return transaction?.result.isSuccess || false
}
