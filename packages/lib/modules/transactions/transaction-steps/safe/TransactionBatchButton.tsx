import { Button, VStack } from '@chakra-ui/react'
import { GenericError } from '@repo/lib/shared/components/errors/GenericError'
import { ManagedResult, TransactionLabels, TransactionStep } from '../lib'
import { SwitchNetworkAlert, useChainSwitch } from '../../../web3/useChainSwitch'
import { useSafeBatchSubmitter } from './useSafeBatchSubmitter'

type Props = {
  labels: TransactionLabels
  chainId: number
  currentStep: TransactionStep
  onTransactionChange: (transaction: ManagedResult) => void
}

/*
  Generic button that submits a batch of transactions through a wallet-specific
  submitter. Safe is the only submitter today; EIP-5792 (EIP-7702 wallets) will
  plug in through the same BatchSubmitter interface in a follow-up.
*/
export function TransactionBatchButton({
  labels,
  chainId,
  currentStep,
  onTransactionChange,
}: Props) {
  const { shouldChangeNetwork, networkSwitchButtonProps } = useChainSwitch(chainId)

  // Until a second submitter exists (EIP-5792), Safe is the only implementation.
  const submitter = useSafeBatchSubmitter({
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
      {shouldChangeNetwork && <SwitchNetworkAlert chainName={networkSwitchButtonProps.name} />}
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
