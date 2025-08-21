/* eslint-disable react-hooks/exhaustive-deps */
import { Button, VStack } from '@chakra-ui/react'
import { getGqlChain } from '@repo/lib/config/app.config'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { getWaitForReceiptTimeout } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { GenericError } from '@repo/lib/shared/components/errors/GenericError'
import { ensureError } from '@repo/lib/shared/utils/errors'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import SafeAppsSDK, { GatewayTransactionDetails } from '@safe-global/safe-apps-sdk'
import { noop } from 'lodash'
import { useEffect, useState } from 'react'
import { useInterval } from 'usehooks-ts'
import { Address, Hex } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { TransactionExecution, TransactionSimulation } from '../../../web3/contracts/contract.types'
import { SwitchNetworkAlert, useChainSwitch } from '../../../web3/useChainSwitch'
import { ManagedResult, TransactionLabels, TransactionStep } from '../lib'
import { getTransactionButtonLabel } from '../transaction-button.helpers'
import { MultisigStatus } from './MultisigStatus'
import {
  buildTxBatch,
  isSafeTxCancelled,
  isSafeTxSuccess,
  isSafeTxWaitingForConfirmations,
  isSafeTxWaitingForExecution,
  mapSafeTxStatusToBalancerTxState,
} from './safe.helpers'
import { useRecentTransactions } from '../../RecentTransactionsProvider'

type Props = {
  labels: TransactionLabels
  chainId: number
  currentStep: TransactionStep
  onTransactionChange: (transaction: ManagedResult) => void
}

export function TransactionBatchButton({
  labels,
  chainId,
  currentStep,
  onTransactionChange,
}: Props) {
  const { shouldChangeNetwork, networkSwitchButtonProps } = useChainSwitch(chainId)
  const { minConfirmations } = useNetworkConfig()

  const [safeTxHash, setSafeTxHash] = useState<Hex | undefined>()
  const [txHash, setTxHash] = useState<Hex | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [sendCallsError, setSendCallsError] = useState<Error>()
  const [receiptReceived, setReceiptReceived] = useState<boolean>(false)

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

  useEffect(() => {
    if (!chainId) return
    if (!transactionStatusQuery.isSuccess) return
    if (receiptReceived) return

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
    onTransactionChange(successFullTransaction)
    setReceiptReceived(true)
  }, [transactionStatusQuery])

  const txBatch = buildTxBatch(currentStep)

  async function handleOnClick() {
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

  const shouldShowTxButton =
    !shouldChangeNetwork && !isSafeTxCancelled(safeTxStatus) && !isSafeTxSuccess(safeTxStatus)

  function getButtonLabel() {
    if (sendCallsError) return labels.init
    if (isSafeTxWaitingForConfirmations(safeTxStatus)) return 'Awaiting multisig confirmations'
    if (isSafeTxWaitingForExecution(safeTxStatus)) return 'Awaiting transaction execution'
    return getTransactionButtonLabel({
      transactionState: mapSafeTxStatusToBalancerTxState(safeTxStatus),
      labels,
      isSmartAccount: true,
    })
  }

  return (
    <VStack width="full">
      {sendCallsError && <TransactionError error={sendCallsError} />}
      {shouldChangeNetwork && <SwitchNetworkAlert chainName={networkSwitchButtonProps.name} />}
      {safeTxHash && safeTxStatus && (
        <MultisigStatus chainId={chainId} currentStep={currentStep} details={safeTxDetails} />
      )}

      {shouldShowTxButton && (
        <Button
          isLoading={isLoading}
          loadingText={getButtonLabel()}
          onClick={handleOnClick}
          size="lg"
          variant="primary"
          w="full"
          width="full"
        >
          {getButtonLabel()}
        </Button>
      )}
    </VStack>
  )
}

type ErrorProps = { error: Error }
export function TransactionError({ error }: ErrorProps) {
  if (error.message.includes('User rejected transaction')) return null
  return <GenericError error={error} />
}
