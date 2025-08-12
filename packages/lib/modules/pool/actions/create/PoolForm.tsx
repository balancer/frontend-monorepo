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
  Text,
} from '@chakra-ui/react'
import { usePoolForm } from './PoolFormProvider'
import { ChooseTypeStep } from './steps/ChooseTypeStep'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useEffect } from 'react'

export function PoolForm() {
  const { steps, activeStepIndex, activeStep } = usePoolForm()
  const { isMobile } = useBreakpoints()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeStepIndex])

  return (
    <VStack align="start" spacing="lg" w="full">
      <VStack align="start" spacing="md">
        <Text color="font.secondary" fontWeight="medium" size="sm">
          STEPS
        </Text>
        <Stepper
          index={activeStepIndex}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          w="full"
        >
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
      </VStack>

      <Divider />

      <VStack spacing="lg" w="full">
        {activeStep.id === 'step1' && <ChooseTypeStep />}
      </VStack>
    </VStack>
  )
}
