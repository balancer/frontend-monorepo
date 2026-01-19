'use client'

import {
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepNumber,
  StepIcon,
  StepTitle,
  StepSeparator,
  Box,
  VStack,
  Divider,
} from '@chakra-ui/react'
import { useLbpForm } from './LbpFormProvider'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useEffect } from 'react'

export function LbpForm() {
  const { steps, currentStepIndex, currentStep } = useLbpForm()
  const { isMobile } = useBreakpoints()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStepIndex])

  return (
    <VStack align="start" spacing="lg" w="full">
      <Divider />
      <Stepper index={currentStepIndex} orientation={isMobile ? 'vertical' : 'horizontal'} w="full">
        {steps.map(step => (
          <Step key={step.id}>
            <StepIndicator>
              <StepStatus
                active={<StepNumber />}
                complete={<StepIcon />}
                incomplete={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink="0">
              <StepTitle>{step.title}</StepTitle>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>

      <Divider />

      <VStack spacing="lg" w="full">
        <currentStep.Component />
      </VStack>
    </VStack>
  )
}
