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
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { useLbpForm } from './LbpFormProvider'
import { SaleStructureStep } from './steps/SaleStructureStep'
import { ProjectInfoStep } from './steps/ProjectInfoStep'
import { ReviewStep } from './steps/ReviewStep'

export function LbpForm() {
  const { steps, activeStepIndex, activeStep, setActiveStep, isLastStep, isFirstStep } =
    useLbpForm()

  function handleSubmit() {
    if (isLastStep) {
      console.log('submit')
    } else {
      setActiveStep(activeStepIndex + 1)
    }
  }

  return (
    <VStack spacing="lg" w="full">
      <Stepper index={activeStepIndex} w="full">
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

      <VStack spacing="lg" w="full">
        {activeStep.id === 'saleStructure' ? (
          <SaleStructureStep />
        ) : activeStep.id === 'projectInfo' ? (
          <ProjectInfoStep />
        ) : activeStep.id === 'review' ? (
          <ReviewStep />
        ) : null}
      </VStack>
    </VStack>
  )
}
