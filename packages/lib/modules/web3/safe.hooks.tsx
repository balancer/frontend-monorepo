import { Hex } from 'viem'
import { TransactionStep, TxBatch } from '../transactions/transaction-steps/lib'
import {
  buildTxBatch,
  hasSomePendingNestedTxInBatch,
} from '../transactions/transaction-steps/safe/safe.helpers'
import { useUserAccount } from './UserAccountProvider'
import { useSafeTxQuery } from '../transactions/transaction-steps/safe/useSafeTxQuery'
import { useWalletConnectMetadata } from './useWalletConnectMetadata'

// Returns true if the user is connected with a Safe Account
export function useIsSafeApp(): boolean {
  const { connector } = useUserAccount()

  return connector?.id === 'safe'
}

/*
  Returns true when running as a Safe App
 (that excludes Safe accounts connected via WalletConnect)
*/
export function useShouldBatchTransactions(): boolean {
  return useIsSafeApp()
}

export function useShouldRenderBatchTxButton(currentStep: TransactionStep): boolean {
  const isSafeApp = useIsSafeApp()
  const txBatch: TxBatch = buildTxBatch(currentStep)
  return isSafeApp && !!currentStep.isBatchEnd && !!txBatch
}

/* isStepWithTxBatch is true if:
  1. running as a Safe App
  2. the current step has nested batchable transactions
  3. some of the nested transactions is not completed
*/
export function useStepWithTxBatch(currentStep: TransactionStep): {
  isStepWithTxBatch: boolean
  txBatch?: TxBatch
} {
  const noBatchStep = { isStepWithTxBatch: false }
  const isSafeApp = useIsSafeApp()

  if (!isSafeApp) return noBatchStep
  if (!currentStep.isBatchEnd) return noBatchStep

  const txBatch: TxBatch = buildTxBatch(currentStep)
  if (txBatch.length === 1) return noBatchStep

  if (!hasSomePendingNestedTxInBatch(currentStep)) return noBatchStep

  return { isStepWithTxBatch: true, txBatch }
}

/*
  If the app is running as a Safe App (connected with a Safe Account) it will return the Safe App transaction hash from the logs
  instead of the wagmi tx hash
  Eventually this will be supported by viem/wagmi natively so we will be able to remove this hook
  More info: https://github.com/wevm/wagmi/issues/2461
 */
type Props = {
  chainId: number
  wagmiTxHash: Hex | undefined
}

export function useTxHash({ wagmiTxHash }: Props) {
  const isSafeApp = useIsSafeApp()
  const { isSafeAccountViaWalletConnect } = useWalletConnectMetadata()

  const { isLoading: isSafeTxLoading, data: safeTxHash } = useSafeTxQuery({
    enabled: isSafeApp || isSafeAccountViaWalletConnect,
    wagmiTxHash,
  })

  const txHash = isSafeApp ? safeTxHash : wagmiTxHash

  return { txHash, isSafeTxLoading }
}
