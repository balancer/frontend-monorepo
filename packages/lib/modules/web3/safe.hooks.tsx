import { Hex } from 'viem'
import { useBlockNumber } from 'wagmi'
import { Pool } from '../pool/pool.types'
import { isCowAmmPool } from '../pool/pool.helpers'
import { TransactionStep, TxBatch } from '../transactions/transaction-steps/lib'
import {
  buildTxBatch,
  hasSomePendingNestedTxInBatch,
} from '../transactions/transaction-steps/safe/safe.helpers'
import { useSafeAppLogs } from '../transactions/transaction-steps/safe/useSafeAppLogs'
import { useUserAccount } from './UserAccountProvider'

// Returns true if the user is connected with a Safe Account
export function useIsSafeApp(): boolean {
  const { connector } = useUserAccount()

  return connector?.id === 'safe'
}

// Returns true if the user is connected with a Safe Account
export function useShouldBatchTransactions(pool: Pool): boolean {
  const isSafeApp = useIsSafeApp()

  return isSafeApp && isCowAmmPool(pool.type)
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

export function useTxHash({ chainId, wagmiTxHash }: Props) {
  // Maybe we need to cache the first block number
  const { data: blockNumber } = useBlockNumber({ chainId })

  /* TODO: implement WC edge case
  const { isSafeAccountViaWalletConnect } = useWalletConnectMetadata()
  if (isSafeAccountViaWalletConnect && wagmiTxHash) {
    console.log({ safeTxHash: wagmiTxHash })
    const safeAppsSdk = new SafeAppsSDK()
    safeAppsSdk.txs.getBySafeTxHash(wagmiTxHash).then(tx => {
      console.log('Safe tx via WC', tx)
    })
  }
  */

  const isSafeApp = useIsSafeApp()

  const { safeTxHash } = useSafeAppLogs({
    enabled: isSafeApp,
    hash: wagmiTxHash,
    chainId,
    blockNumber: blockNumber,
  })

  const txHash = isSafeApp ? safeTxHash : wagmiTxHash

  return { txHash, isSafeTxLoading: isSafeApp && !!wagmiTxHash && !safeTxHash }
}
