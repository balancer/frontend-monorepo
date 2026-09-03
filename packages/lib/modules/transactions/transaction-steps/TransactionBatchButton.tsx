'use client'

import { Button, VStack } from '@chakra-ui/react'
import { GenericError } from '@repo/lib/shared/components/errors/GenericError'
import { ManagedResult, TransactionLabels, TransactionStep } from './lib'
import { RegularSwitchNetworkButton, useChainSwitch } from '../../web3/useChainSwitch'
import { useBatchSubmitter } from './useBatchSubmitter'

type Props = {
  labels: TransactionLabels
  chainId: number
  currentStep: TransactionStep
  onTransactionChange: (transaction: ManagedResult) => void
}

/*
  Generic button that submits a batch of transactions through a wallet-specific
  submitter (Safe or EIP-5792 / EIP-7702). The submitter is chosen by
  useBatchSubmitter based on the connected wallet.
*/
export function TransactionBatchButton({
  labels,
  chainId,
  currentStep,
  onTransactionChange,
}: Props) {
  const { shouldChangeNetwork, networkSwitchButtonProps } = useChainSwitch(chainId)

  const submitter = useBatchSubmitter({
    labels,
    chainId,
    currentStep,
    onTransactionChange,
  })

  async function handleOnClick() {
    await submitter.submit()
  }

  return (
    <VStack width="full">
      {submitter.error && <TransactionError error={submitter.error} />}
      {/* Safe Apps cannot switch network programmatically, other wallets get the regular switch button */}
      {shouldChangeNetwork && <RegularSwitchNetworkButton {...networkSwitchButtonProps} />}
      {submitter.statusContent}

      {!shouldChangeNetwork && submitter.canSubmit && (
        <Button
          isLoading={submitter.isLoading}
          loadingText={submitter.label}
          onClick={handleOnClick}
          size="lg"
          variant="primary"
          w="full"
          width="full"
        >
          {submitter.label}
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
