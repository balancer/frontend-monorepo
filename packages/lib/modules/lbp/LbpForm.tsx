'use client'

import { VStack } from '@chakra-ui/react';
import { useLbpForm } from './LbpFormProvider'
import { useEffect } from 'react'

export function LbpForm() {
  const { currentStepIndex, currentStep, canRenderStep } = useLbpForm()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStepIndex])

  return (
    <VStack align="start" gap="lg" w="full">
      <VStack gap="lg" w="full">
        {canRenderStep && <currentStep.Component />}
      </VStack>
    </VStack>
  );
}
