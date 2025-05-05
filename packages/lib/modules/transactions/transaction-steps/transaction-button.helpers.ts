import { TransactionLabels, TransactionState } from './lib'

type Props = {
  transactionState: TransactionState
  labels: TransactionLabels
  isStepComplete?: () => boolean
  isSmartAccount?: boolean
}
export function getTransactionButtonLabel({
  transactionState,
  labels,
  isStepComplete,
  isSmartAccount = false,
}: Props) {
  // sensible defaults for loading / confirm if not provided
  const relevantLabel = labels[transactionState as keyof typeof labels]
  if (!relevantLabel) {
    switch (transactionState) {
      case TransactionState.Preparing:
        return 'Preparing'
      case TransactionState.Loading:
        return isSmartAccount ? 'Confirm in smart account wallet' : 'Confirm in wallet'
      case TransactionState.Confirming:
        return 'Confirming transaction'
      case TransactionState.Error:
        return labels.init
      case TransactionState.Completed:
        if (isStepComplete && !isStepComplete()) return labels.init
        return labels.confirmed || 'Confirmed transaction'
    }
  }

  return relevantLabel
}
