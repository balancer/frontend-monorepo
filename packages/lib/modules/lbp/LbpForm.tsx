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
  Button,
  VStack,
} from '@chakra-ui/react'
import { useLbpForm } from './LbpFormProvider'

export function LbpForm() {
  const { steps, activeStep, setActiveStep, isLastStep } = useLbpForm()

  function handleSubmit() {
    if (isLastStep) {
      console.log('submit')
    } else {
      setActiveStep(activeStep + 1)
    }
  }

  return (
    <VStack spacing="lg" w="full">
      <Stepper index={activeStep} w="full">
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
      <Button onClick={handleSubmit} variant="primary" w="full">
        {isLastStep ? 'Create LBP' : 'Next'}
      </Button>
    </VStack>
  )
}
