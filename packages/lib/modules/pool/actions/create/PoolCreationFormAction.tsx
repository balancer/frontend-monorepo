'use client'

import { Button, HStack, IconButton, useDisclosure, Divider, VStack } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { usePoolCreationForm } from './PoolCreationFormProvider'

export function PoolCreationFormAction({ disabled }: { disabled?: boolean }) {
  const { isConnected } = useUserAccount()
  const { activeStepIndex, setActiveStep, isLastStep, isFirstStep } = usePoolCreationForm()
  const previewModalDisclosure = useDisclosure()

  return isConnected ? (
    <VStack spacing="xl" w="full">
      <Divider />
      <HStack spacing="md" w="full">
        {!isFirstStep && (
          <IconButton
            aria-label="Back"
            icon={<ChevronLeftIcon h="8" w="8" />}
            onClick={() => setActiveStep(activeStepIndex - 1)}
            size="lg"
          />
        )}

        <Button
          disabled={disabled}
          onClick={() => {
            if (isLastStep) {
              previewModalDisclosure.onOpen()
            } else {
              setActiveStep(activeStepIndex + 1)
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
  ) : (
    <ConnectWallet variant="primary" w="full" />
  )
}
