'use client'

import { ConnectWallet } from '@/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { Button, VStack } from '@chakra-ui/react'
import { ManagedResult, TransactionLabels, TransactionState, getTransactionState } from './lib'
import { useChainSwitch } from '@/lib/modules/web3/useChainSwitch'
import { GenericError } from '@/lib/shared/components/errors/GenericError'
import { getGqlChain } from '@/lib/config/app.config'
import { TransactionTimeoutError } from '@/lib/shared/components/errors/TransactionTimeoutError'
import { useState } from 'react'
import { ensureError } from '@/lib/shared/utils/errors'

interface Props {
  step: { labels: TransactionLabels } & ManagedResult
}

export function TransactionStepButton({ step }: Props) {
  const { chainId, simulation, labels, executeAsync } = step
  const [executionError, setExecutionError] = useState<Error>()
  const { isConnected } = useUserAccount()
  const { shouldChangeNetwork, NetworkSwitchButton, networkSwitchButtonProps } =
    useChainSwitch(chainId)
  const isTransactButtonVisible = isConnected
  const transactionState = getTransactionState(step)
  const isButtonLoading =
    transactionState === TransactionState.Loading ||
    transactionState === TransactionState.Confirming ||
    transactionState === TransactionState.Preparing ||
    step.isSafeTxLoading

  const isComplete = transactionState === TransactionState.Completed
  const hasSimulationError = simulation.isError
  const isIdle = isConnected && simulation.isStale && !simulation.data
  const isButtonDisabled =
    transactionState === TransactionState.Loading || hasSimulationError || isIdle || isComplete

  async function handleOnClick() {
    setExecutionError(undefined)
    try {
      await executeAsync?.()
    } catch (e: unknown) {
      setExecutionError(ensureError(e))
    }
  }

  function getButtonLabel() {
    if (executionError) return labels.init
    // sensible defaults for loading / confirm if not provided
    const relevantLabel = labels[transactionState as keyof typeof labels]

    if (!relevantLabel) {
      switch (transactionState) {
        case TransactionState.Preparing:
          return 'Preparing'
        case TransactionState.Loading:
          return 'Confirm in wallet'
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

  return (
    <VStack width="full">
      {transactionState === TransactionState.Error && <TransactionError step={step} />}
      {!isTransactButtonVisible && <ConnectWallet width="full" />}
      {shouldChangeNetwork && isTransactButtonVisible && (
        <NetworkSwitchButton {...networkSwitchButtonProps} />
      )}
      {!shouldChangeNetwork && isTransactButtonVisible && (
        <Button
          width="full"
          w="full"
          size="lg"
          variant="primary"
          isDisabled={isButtonDisabled}
          isLoading={isButtonLoading}
          onClick={handleOnClick}
          loadingText={getButtonLabel()}
        >
          {getButtonLabel()}
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
