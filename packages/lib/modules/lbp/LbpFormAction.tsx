'use client'

import { Button, HStack, IconButton } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useLbpForm } from './LbpFormProvider'
import { useLbpCreation } from './LbpCreationProvider'
import { LbpCreationModal } from './modal/LbpCreationModal'
import { useRef } from 'react'

export function LbpFormAction({ disabled }: { disabled?: boolean }) {
  const { activeStepIndex, setActiveStep, isLastStep, isFirstStep } = useLbpForm()
  const { previewModalDisclosure } = useLbpCreation()
  const nextBtn = useRef(null)

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

      <Button
        disabled={disabled}
        onClick={() => isLastStep && previewModalDisclosure.onOpen()}
        size="lg"
        type="submit"
        variant="primary"
        w="full"
      >
        {isLastStep ? 'Create LBP' : 'Next'}
      </Button>

      <LbpCreationModal
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.isOpen}
        onClose={previewModalDisclosure.onClose}
        onOpen={previewModalDisclosure.onOpen}
      />
    </HStack>
  )
}
