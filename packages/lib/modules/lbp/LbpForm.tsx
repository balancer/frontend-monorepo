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
} from '@chakra-ui/react'
import { useLbpForm } from './LbpFormProvider'
import { SaleStructureStep } from './steps/SaleStructureStep'
import { ProjectInfoStep } from './steps/ProjectInfoStep'
import { ReviewStep } from './steps/ReviewStep'

export function LbpForm() {
  const { steps, activeStepIndex, activeStep } = useLbpForm()

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

      <VStack border="1px solid red" spacing="lg" w="full">
        {activeStep.id === 'step1' ? (
          <SaleStructureStep />
        ) : activeStep.id === 'step2' ? (
          <ProjectInfoStep />
        ) : activeStep.id === 'step3' ? (
          <ReviewStep />
        ) : null}
      </VStack>
    </VStack>
  )
}
