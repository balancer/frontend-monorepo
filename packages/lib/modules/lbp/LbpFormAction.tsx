'use client'

import { Button, HStack, IconButton } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useLbpForm } from './LbpFormProvider'
import { useUserAccount } from '../web3/UserAccountProvider'
import { ConnectWallet } from '../web3/ConnectWallet'

export function LbpFormAction({ disabled }: { disabled?: boolean }) {
  const { isConnected } = useUserAccount()
  const { activeStepIndex, setActiveStep, isLastStep, isFirstStep } = useLbpForm()

  return isConnected ? (
    <HStack spacing="md" w="full">
      {!isFirstStep && (
        <IconButton
          aria-label="Back"
          icon={<ChevronLeftIcon h="8" w="8" />}
          onClick={() => setActiveStep(activeStepIndex - 1)}
          size="lg"
        />
      )}

      <Button disabled={disabled} size="lg" type="submit" variant="primary" w="full">
        {isLastStep ? 'Create LBP' : 'Next'}
      </Button>
    </HStack>
  ) : (
    <ConnectWallet w="full" variant="primary" />
  )
}
