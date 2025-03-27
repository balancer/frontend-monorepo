import { Hex } from 'viem'
import { TransactionStep, TxBatch } from '../transactions/transaction-steps/lib'
import {
  buildTxBatch,
  hasSomePendingNestedTxInBatch,
} from '../transactions/transaction-steps/safe/safe.helpers'
import { useUserAccount } from './UserAccountProvider'
import { useSafeTxQuery } from '../transactions/transaction-steps/safe/useSafeTxQuery'
import { useWalletConnectMetadata } from './wallet-connect/useWalletConnectMetadata'
import { useUserSettings } from '../user/settings/UserSettingsProvider'

// Returns true when using a Safe Smart account:
// - app running as a Safe App
// - user connected via WalletConnect to a Safe Account
export function useIsSafeAccount(): boolean {
  const isSafeApp = useIsSafeApp()
  const { isSafeAccountViaWalletConnect } = useWalletConnectMetadata()
  return isSafeApp || isSafeAccountViaWalletConnect
}

// Returns true when app is running as a Safe App (it excludes Safe accounts connected via WalletConnect)
export function useIsSafeApp(): boolean {
  const { connector } = useUserAccount()
  return connector?.id === 'safe'
}

/*
 Returns true when running as a Safe App and settings allow batched tx
 (that excludes Safe accounts connected via WalletConnect)
*/
export function useShouldBatchTransactions(): boolean {
  const { shouldUseTxBundling } = useUserSettings()
  const isSafeApp = useIsSafeApp()
  return shouldUseTxBundling && isSafeApp
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
  const shouldBatchTx = useShouldBatchTransactions()

  if (!shouldBatchTx) return noBatchStep
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
  /*
  Only Safe Apps use Safe Tx Hash
  Safe Accounts connected via WalletConnect use wagmiTxHash like a regular account
  */
  const isSafeApp = useIsSafeApp()
  const { isLoading: isSafeTxLoading, data: safeTxHash } = useSafeTxQuery({
    enabled: isSafeApp,
    wagmiTxHash,
  })

  const txHash = isSafeApp ? safeTxHash : wagmiTxHash

  return { txHash, isSafeTxLoading }
}
