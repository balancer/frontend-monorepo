'use client'

import { Button, HStack, IconButton } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useLbpForm } from './LbpFormProvider'

export function LbpFormAction() {
  const { activeStepIndex, setActiveStep, isLastStep, isFirstStep } = useLbpForm()

  return (
    <HStack spacing="md" w="full">
      {!isFirstStep && (
        <IconButton
          aria-label="Back"
          icon={<ChevronLeftIcon h="8" w="8" />}
          onClick={() => setActiveStep(activeStepIndex - 1)}
          size="lg"
        />
      )}

      <Button size="lg" type="submit" variant="primary" w="full">
        {isLastStep ? 'Create LBP' : 'Next'}
      </Button>
    </HStack>
  )
}
