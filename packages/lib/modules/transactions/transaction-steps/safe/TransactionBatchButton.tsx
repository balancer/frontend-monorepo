/* eslint-disable react-hooks/exhaustive-deps */
'use client'

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
import { Hex } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { TransactionExecution, TransactionSimulation } from '../../../web3/contracts/contract.types'
import { useOnTransactionSubmission } from '../../../web3/contracts/useOnTransactionSubmission'
import { SwitchNetworkAlert, useChainSwitch } from '../../../web3/useChainSwitch'
import { ManagedResult, TransactionLabels, TransactionStep } from '../lib'
import { getTransactionButtonLabel } from '../transaction-button.helpers'
import { useTransactionState } from '../TransactionStateProvider'
import { MultisigStatus } from './MultisigStatus'
import {
  buildTxBatch,
  isSafeTxCancelled,
  isSafeTxSuccess,
  isSafeTxWaitingForConfirmations,
  isSafeTxWaitingForExecution,
  mapSafeTxStatusToBalancerTxState,
} from './safe.helpers'

type Props = {
  labels: TransactionLabels
  chainId: number
  currentStep: TransactionStep
}

export function TransactionBatchButton({
  id,
  labels,
  chainId,
  currentStep,
}: { id: string } & Props) {
  const { shouldChangeNetwork, networkSwitchButtonProps } = useChainSwitch(chainId)
  const [safeTxHash, setSafeTxHash] = useState<Hex | undefined>()
  const [txHash, setTxHash] = useState<Hex | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [sendCallsError, setSendCallsError] = useState<Error>()
  const { minConfirmations } = useNetworkConfig()
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

  const { updateTransaction } = useTransactionState()
  useEffect(() => {
    if (!chainId) return
    if (!transactionStatusQuery.isSuccess) return

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
    updateTransaction(id, successFullTransaction)
  }, [id, transactionStatusQuery])

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

  useInterval(() => {
    if (safeTxHash) {
      safeAppsSdk.txs.getBySafeTxHash(safeTxHash).then(tx => {
        setSafeTxDetails(tx)

        if (tx.txHash) {
          setTxHash(tx.txHash as Hex)
        }
      })
    }
  }, 5000)

  const shouldShowTxButton =
    !shouldChangeNetwork && !isSafeTxCancelled(safeTxStatus) && !isSafeTxSuccess(safeTxStatus)

  /*
    on successful submission to chain, add tx to recent transactions cache
    this is an edge case where de don't show the toast and don't call useOnTransactionConfirmation
    because we only get the txHash once the Safe tx is confirmed
  */
  useOnTransactionSubmission({
    labels,
    hash: txHash,
    chain: getGqlChain(chainId),
    isConfirmed: isSafeTxSuccess(safeTxStatus), // this will prevent the toast to be shown
  })

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
      {safeTxHash && safeTxDetails?.txStatus && (
        <MultisigStatus
          chainId={chainId}
          currentStep={currentStep}
          details={safeTxDetails}
          safeTxHash={safeTxHash}
        />
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
