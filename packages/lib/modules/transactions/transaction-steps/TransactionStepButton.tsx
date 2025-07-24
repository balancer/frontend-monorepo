'use client'

import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { Button, useToast, VStack } from '@chakra-ui/react'
import { ManagedResult, TransactionLabels, TransactionState, getTransactionState } from './lib'
import { NetworkSwitchButton, useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { GenericError } from '@repo/lib/shared/components/errors/GenericError'
import { getGqlChain } from '@repo/lib/config/app.config'
import { TransactionTimeoutError } from '@repo/lib/shared/components/errors/TransactionTimeoutError'
import { useState } from 'react'
import { ensureError } from '@repo/lib/shared/utils/errors'
import { LabelWithIcon } from '@repo/lib/shared/components/btns/button-group/LabelWithIcon'
import { getTransactionButtonLabel } from './transaction-button.helpers'
import { useIsSafeAccount } from '../../web3/safe.hooks'
import { MultisigStatus } from './safe/MultisigStatus'
import SafeAppsSDK, { GatewayTransactionDetails } from '@safe-global/safe-apps-sdk'
import { useInterval } from 'usehooks-ts'

interface Props {
  step: {
    labels: TransactionLabels
    isComplete?: () => boolean
  } & ManagedResult
}

export function TransactionStepButton({ step }: Props) {
  const { chainId, simulation, labels, executeAsync } = step
  const [executionError, setExecutionError] = useState<Error>()
  const [safeTxDetails, setSafeTxDetails] = useState<GatewayTransactionDetails | undefined>()
  const { isConnected } = useUserAccount()
  const isSafeAccount = useIsSafeAccount()
  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const transactionState = getTransactionState(step)
  const isButtonLoading =
    transactionState === TransactionState.Loading ||
    transactionState === TransactionState.Confirming ||
    transactionState === TransactionState.Preparing ||
    step.isSafeTxLoading

  const isComplete = step.isComplete
    ? step.isComplete()
    : transactionState === TransactionState.Completed
  const hasSimulationError = simulation.isError
  const isIdle = isConnected && simulation.isStale && !simulation.data
  const isButtonDisabled =
    transactionState === TransactionState.Loading ||
    hasSimulationError ||
    isIdle ||
    isComplete ||
    !executeAsync // no executeAsync is undefined while the txConfig is being built

  const toast = useToast()

  async function handleOnClick() {
    setExecutionError(undefined)
    toast.closeAll()
    try {
      if (!executeAsync) return
      return await executeAsync()
    } catch (e: unknown) {
      setExecutionError(ensureError(e))
    }
  }

  function getButtonLabel() {
    if (executionError) return labels.init
    return getTransactionButtonLabel({
      transactionState,
      labels,
      isStepComplete: step.isComplete,
      isSmartAccount: isSafeAccount,
    })
  }

  const safeTxHash = step.execution.data
  const safeAppsSdk = new SafeAppsSDK()
  useInterval(() => {
    if (safeTxHash) {
      safeAppsSdk.txs.getBySafeTxHash(safeTxHash).then(tx => setSafeTxDetails(tx))
    }
  }, 5000)

  return (
    <VStack width="full">
      {transactionState === TransactionState.Error && <TransactionError step={step} />}
      {!isConnected && <ConnectWallet width="full" />}
      {isConnected && shouldChangeNetwork && <NetworkSwitchButton chainId={chainId} />}
      {safeTxHash && safeTxDetails?.txStatus && (
        <MultisigStatus chainId={chainId} details={safeTxDetails} safeTxHash={safeTxHash} />
      )}

      {!shouldChangeNetwork && isConnected && (
        <Button
          isDisabled={isButtonDisabled}
          isLoading={isButtonLoading}
          loadingText={getButtonLabel()}
          onClick={handleOnClick}
          size="lg"
          variant="primary"
          w="full"
          width="full"
        >
          <LabelWithIcon icon="gas">{getButtonLabel()}</LabelWithIcon>
        </Button>
      )}
    </VStack>
  )
}

function TransactionError({ step }: Props) {
  if (step.simulation.error) {
    return <GenericError error={step.simulation.error} />
  }

  const executionError = step.execution.error
  if (executionError) return <GenericError error={executionError} />

  const resultError = step.result.error
  if (resultError) {
    const isTimeoutError = resultError.name === 'TimeoutError'
    const transactionHash = step.execution.data
    if (isTimeoutError && transactionHash) {
      const chain = getGqlChain(step.chainId)
      return <TransactionTimeoutError chain={chain} transactionHash={transactionHash} />
    }
    return <GenericError error={resultError} />
  }

  return null
}

export function DisabledTransactionButton() {
  return <Button isDisabled isLoading size="lg" variant="primary" w="full" width="full" />
}
