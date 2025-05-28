import { getTransactionState, ManagedResult, TransactionState } from './lib'

export function useShouldFreezeQuote(lastTransaction: ManagedResult | undefined) {
  const transactionState = getTransactionState(lastTransaction)

  const isConfirming = transactionState === TransactionState.Confirming
  const isAwaitingUserConfirmation = transactionState === TransactionState.Loading
  const isComplete = transactionState === TransactionState.Completed
  const isError = transactionState === TransactionState.Error

  // Disable query refetches:
  // if the flow is complete
  // if the core transaction is confirming
  const shouldFreezeQuote = isComplete || isConfirming || isAwaitingUserConfirmation || isError

  return { shouldFreezeQuote }
}
