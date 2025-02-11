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
import { ChevronLeftIcon } from '@chakra-ui/icons'

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

      <Box w="full">
        {activeStep.id === 'saleStructure' ? (
          <SaleStructureStep />
        ) : activeStep.id === 'projectInfo' ? (
          <ProjectInfoStep />
        ) : activeStep.id === 'review' ? (
          <ReviewStep />
        ) : null}
      </Box>

      <HStack spacing="md" w="full">
        {!isFirstStep && (
          <IconButton
            aria-label="Back"
            icon={<ChevronLeftIcon h="8" w="8" />}
            onClick={() => setActiveStep(activeStepIndex - 1)}
          />
        )}

        <Button onClick={handleSubmit} variant="primary" w="full">
          {isLastStep ? 'Create LBP' : 'Next'}
        </Button>
      </HStack>
    </VStack>
  )
}
