import { Button, HStack, IconButton, useDisclosure, Divider, VStack } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { useValidatePoolConfig } from './useValidatePoolConfig'

export function PoolCreationFormAction({ disabled }: { disabled?: boolean }) {
  const { previousStep, nextStep, isLastStep, isFirstStep } = usePoolCreationFormSteps()
  const previewModalDisclosure = useDisclosure()
  const { isConnected } = useUserAccount()

  if (!isConnected) return <ConnectWallet variant="primary" w="full" />

  return (
    <VStack spacing="lg" w="full">
      <Divider />

      <InvalidTotalWeightAlert />

      <HStack spacing="md" w="full">
        {!isFirstStep && (
          <IconButton
            aria-label="Back"
            icon={<ChevronLeftIcon h="8" w="8" />}
            onClick={previousStep}
            size="lg"
          />
        )}

        <Button
          disabled={disabled}
          onClick={() => {
            if (isLastStep) {
              previewModalDisclosure.onOpen()
            } else {
              nextStep()
            }
          }}
          size="lg"
          variant="primary"
          w="full"
        >
          {isLastStep ? 'Create Pool' : 'Next'}
        </Button>
      </HStack>
    </VStack>
  )
}

function InvalidTotalWeightAlert() {
  const { isWeightedPool, isTotalWeightTooHigh, isTotalWeightTooLow } = useValidatePoolConfig()

  if (!isWeightedPool) return null

  if (isTotalWeightTooLow)
    return (
      <BalAlert
        content="To create a weighted pool, the sum of all the weights of the tokens must tally exactly 100%"
        status="warning"
        title="Token weights must tally 100%"
      />
    )

  if (isTotalWeightTooHigh)
    return (
      <BalAlert
        content="To create a weighted pool, the sum of all the weights of the tokens must tally exactly 100%"
        status="error"
        title="Token weights must tally 100%"
      />
    )
}
