import { useInterval } from 'usehooks-ts'
import { Address, Hex } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { getGqlChain } from '@repo/lib/config/app.config'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { getWaitForReceiptTimeout } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { ensureError } from '@repo/lib/shared/utils/errors'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import SafeAppsSDK, { GatewayTransactionDetails } from '@safe-global/safe-apps-sdk'
import { noop } from 'lodash'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { TransactionExecution, TransactionSimulation } from '../../../web3/contracts/contract.types'
import { useRecentTransactions } from '../../RecentTransactionsProvider'
import { ManagedResult, TransactionLabels, TransactionStep } from '../lib'
import { buildTxBatch } from '../tx-batch.helpers'
import { getTransactionButtonLabel } from '../transaction-button.helpers'
import { MultisigStatus } from './MultisigStatus'
import {
  isSafeTxCancelled,
  isSafeTxSuccess,
  isSafeTxWaitingForConfirmations,
  isSafeTxWaitingForExecution,
  mapSafeTxStatusToBalancerTxState,
  buildSafeTxCall,
} from './safe.helpers'

type Props = {
  labels: TransactionLabels
  chainId: number
  currentStep: TransactionStep
  onTransactionChange: (transaction: ManagedResult) => void
}

/*
  Common contract implemented by every batch submitter.
  Phase 2 (EIP-5792) will add an Eip5792BatchSubmitter with the same shape.
*/
export type BatchSubmitter = {
  // Sends the batch; resolves once the batch has been submitted
  submit: () => Promise<void>
  isLoading: boolean
  error?: Error
  label: string
  // Whether the submit button should be shown (e.g. hidden once the tx is done)
  canSubmit: boolean
  // Extra status UI rendered above the button (e.g. MultisigStatus card)
  statusContent?: ReactNode
}

export function useSafeBatchSubmitter({
  labels,
  chainId,
  currentStep,
  onTransactionChange,
}: Props): BatchSubmitter {
  const { minConfirmations } = useNetworkConfig()

  const [safeTxHash, setSafeTxHash] = useState<Hex | undefined>()
  const [txHash, setTxHash] = useState<Hex | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [sendCallsError, setSendCallsError] = useState<Error>()
  const receiptReceivedRef = useRef(false)

  /*
    More info about GatewayTransactionDetails:
    https://github.com/safe-global/safe-apps-sdk/tree/main/packages/safe-apps-sdk#retrieving-transactions-status
  */
  const [safeTxDetails, setSafeTxDetails] = useState<GatewayTransactionDetails | undefined>()
  const safeTxStatus = safeTxDetails?.txStatus

  const safeAppsSdk = new SafeAppsSDK()

  const transactionStatusQuery = useWaitForTransactionReceipt({
    chainId,
    hash: txHash,
    confirmations: minConfirmations,
    timeout: getWaitForReceiptTimeout(chainId),
    query: {
      ...onlyExplicitRefetch,
    },
  })

  // needed because a re-render will not reset a ref
  useEffect(() => {
    receiptReceivedRef.current = false
  }, [chainId, txHash])

  useEffect(() => {
    if (!chainId) return
    if (!transactionStatusQuery.isSuccess) return
    if (receiptReceivedRef.current) return

    const successFullTransaction: ManagedResult = {
      chainId,
      simulation: { data: null, status: 'success' } as unknown as TransactionSimulation,
      execution: {
        data: null,
        status: 'success',
        reset: noop,
      } as unknown as TransactionExecution,
      result: transactionStatusQuery,

      executeAsync: noop,
      isSafeTxLoading: false,
    }
    receiptReceivedRef.current = true
    onTransactionChange(successFullTransaction)
  }, [chainId, onTransactionChange, transactionStatusQuery])

  const txBatch = buildTxBatch(currentStep).map(buildSafeTxCall)

  async function submit() {
    setSendCallsError(undefined)
    setIsLoading(true)
    try {
      const safeTx = await safeAppsSdk.txs.send({ txs: txBatch })
      setSafeTxHash(safeTx.safeTxHash as Hex)

      const tx = await safeAppsSdk.txs.getBySafeTxHash(safeTx.safeTxHash)
      setSafeTxDetails(tx)
    } catch (e: unknown) {
      setIsLoading(false)
      setSendCallsError(ensureError(e))
    }
  }

  const { isTxTracked, addTrackedTransaction } = useRecentTransactions()
  useInterval(() => {
    if (safeTxHash) {
      safeAppsSdk.txs.getBySafeTxHash(safeTxHash).then(tx => {
        setSafeTxDetails(tx)

        if (tx.txHash) setTxHash(tx.txHash as Hex)

        if (!isTxTracked(safeTxHash)) {
          addTrackedTransaction(
            {
              hash: safeTxHash,
              type: 'safe',
              status: 'confirming',
              chain: getGqlChain(chainId),
              init: 'Safe wallet multisignature',
              label: labels.init,
              description: labels.description,
              timestamp: Date.now(),
              safeTxId: tx.txId,
              safeTxAddress: tx.safeAddress as Address,
            },
            false
          )
        }
      })
    }
  }, 5000)

  const canSubmit = !isSafeTxCancelled(safeTxStatus) && !isSafeTxSuccess(safeTxStatus)

  const label = (() => {
    if (sendCallsError) return labels.init
    if (isSafeTxWaitingForConfirmations(safeTxStatus)) return 'Awaiting multisig confirmations'
    if (isSafeTxWaitingForExecution(safeTxStatus)) return 'Awaiting transaction execution'
    return (
      getTransactionButtonLabel({
        transactionState: mapSafeTxStatusToBalancerTxState(safeTxStatus),
        labels,
        isSmartAccount: true,
      }) ?? labels.init
    )
  })()

  const statusContent =
    safeTxHash && safeTxStatus && safeTxDetails ? (
      <MultisigStatus chainId={chainId} currentStep={currentStep} details={safeTxDetails} />
    ) : undefined

  return { submit, isLoading, error: sendCallsError, label, canSubmit, statusContent }
}
