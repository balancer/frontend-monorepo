import { TransactionLabels, TransactionState } from './lib'

type Props = {
  transactionState: TransactionState
  labels: TransactionLabels
}
export function getTransactionButtonLabel({ transactionState, labels }: Props) {
  // sensible defaults for loading / confirm if not provided
  const relevantLabel = labels[transactionState as keyof typeof labels]
  if (!relevantLabel) {
    switch (transactionState) {
      case TransactionState.Preparing:
        return 'Preparing'
      case TransactionState.Loading:
        return 'Confirm in smart account wallet'
      case TransactionState.Confirming:
        return 'Confirming transaction'
      case TransactionState.Error:
        return labels.init
      case TransactionState.Completed:
        return labels.confirmed || 'Confirmed transaction'
    }
  }

  return relevantLabel
}
