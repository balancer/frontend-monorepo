import { SupportedChainId } from '@repo/lib/config/config.types'
import {
  GatewayTransactionDetails,
  TransactionStatus as SafeTransactionStatus,
} from '@safe-global/safe-apps-sdk'
import { arbitrum, gnosis, mainnet, sepolia } from 'viem/chains'
import { SafeAppTx, TransactionState, TransactionStep, TxCall } from '../lib'
import { TransactionStatus as BalancerTransactionStatus } from '@repo/lib/modules/transactions/RecentTransactionsProvider'
import { Address } from 'viem'

const SAFE_CHAIN_PREFIX: Record<SupportedChainId, string> = {
  //TODO: Add the rest of the chains
  [mainnet.id]: 'eth',
  [gnosis.id]: 'gno',
  [sepolia.id]: 'sep',
  [arbitrum.id]: 'arb',
}

export function getSafeWebUrl(chainId: number, safeAddress: Address, safeTxId: string): string {
  const chainShortName = SAFE_CHAIN_PREFIX[chainId]
  const baseSafeUrl = 'https://app.safe.global/transactions/tx?safe='

  return `${baseSafeUrl}/${chainShortName}:${safeAddress}&id=${safeTxId}`
}

export function isMultisig(details: GatewayTransactionDetails): boolean {
  return details.detailedExecutionInfo?.type === 'MULTISIG'
}

export function getPendingNestedSteps(step: TransactionStep) {
  return step?.nestedSteps?.filter(nestedStep => !nestedStep.isComplete())
}

export function hasSomePendingNestedTxInBatch(step: TransactionStep): boolean {
  return step?.nestedSteps?.some(nestedStep => !nestedStep.isComplete()) ?? false
}

export function getSignConfirmationsLabel(details: GatewayTransactionDetails) {
  if (details.detailedExecutionInfo?.type !== 'MULTISIG') return null

  return `Signatures: ${details.detailedExecutionInfo.confirmations.length} out of ${details.detailedExecutionInfo.confirmationsRequired}`
}

export function getRemainingSignatures(details: GatewayTransactionDetails): number {
  if (details.detailedExecutionInfo?.type !== 'MULTISIG') return 0

  const remainingSignatures =
    details.detailedExecutionInfo.confirmationsRequired -
    details.detailedExecutionInfo.confirmations.length

  return remainingSignatures
}

export function getRemainingSignaturesLabel(
  details: GatewayTransactionDetails
): string | undefined {
  const remainingSignatures = getRemainingSignatures(details)

  if (remainingSignatures <= 0) return

  if (remainingSignatures === 1) return '(1 more signature required)'
  return `${remainingSignatures} more signatures are required`
}

export function buildTxBatch(transactionStep: TransactionStep): SafeAppTx[] {
  if (!transactionStep.nestedSteps) return [buildSafeTxCall(transactionStep.batchableTxCall!)]
  return [
    ...transactionStep.nestedSteps
      // Comment the following line to test batching when tokens are already allowed
      .filter(step => !step.isComplete())
      .map(step => {
        return buildSafeTxCall(step.batchableTxCall!)
      }),
    buildSafeTxCall(transactionStep.batchableTxCall!),
  ]
}

function buildSafeTxCall(txCall: TxCall): SafeAppTx {
  return { ...txCall, value: txCall?.value ? txCall.value.toString() : '0' }
}

export function isSafeTxSuccess(safeTxStatus?: SafeTransactionStatus): boolean {
  return safeTxStatus === 'SUCCESS'
}

export function isSafeTxRejected(safeTxStatus?: SafeTransactionStatus): boolean {
  return safeTxStatus === (SafeTransactionStatus.CANCELLED || SafeTransactionStatus.FAILED)
}

export function isSafeTxCancelled(safeTxStatus?: SafeTransactionStatus): boolean {
  return safeTxStatus === SafeTransactionStatus.CANCELLED
}

export function isSafeTxWaitingForExecution(safeTxStatus?: SafeTransactionStatus): boolean {
  return safeTxStatus === SafeTransactionStatus.AWAITING_EXECUTION
}

export function isSafeTxWaitingForConfirmations(safeTxStatus?: SafeTransactionStatus): boolean {
  return safeTxStatus === SafeTransactionStatus.AWAITING_CONFIRMATIONS
}

export function safeStatusToBalancerStatus(
  safeTxStatus?: SafeTransactionStatus
): BalancerTransactionStatus {
  if (
    safeTxStatus === SafeTransactionStatus.AWAITING_CONFIRMATIONS ||
    safeTxStatus === SafeTransactionStatus.AWAITING_EXECUTION
  ) {
    return 'confirming'
  } else if (safeTxStatus === SafeTransactionStatus.CANCELLED) {
    return 'reverted'
  } else if (safeTxStatus === SafeTransactionStatus.FAILED) {
    return 'rejected'
  } else if (safeTxStatus === SafeTransactionStatus.SUCCESS) {
    return 'confirmed'
  } else {
    return 'unknown'
  }
}

export function mapSafeTxStatusToBalancerTxState(
  safeTxStatus?: SafeTransactionStatus
): TransactionState {
  if (!safeTxStatus) return TransactionState.Ready
  if (isSafeTxSuccess(safeTxStatus)) return TransactionState.Completed
  if (isSafeTxRejected(safeTxStatus)) return TransactionState.Error
  return TransactionState.Ready
}
