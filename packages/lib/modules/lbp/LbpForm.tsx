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
import { SaleStructureStep } from './steps/SaleStructureStep'
import { ProjectInfoStep } from './steps/ProjectInfoStep'
import { ReviewStep } from './steps/review/ReviewStep'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useEffect } from 'react'
import { RestartPoolCreationModal } from '../pool/actions/create/modal/RestartPoolCreationModal'

export function LbpForm() {
  const { steps, activeStepIndex, activeStep, resetLbpCreation, saleStructureForm } = useLbpForm()
  const { selectedChain } = saleStructureForm.watch()
  const { isMobile } = useBreakpoints()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeStepIndex])

  return (
    <VStack align="start" spacing="lg" w="full">
      <Stepper index={activeStepIndex} orientation={isMobile ? 'vertical' : 'horizontal'} w="full">
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
        {activeStep.id === 'step1' && <SaleStructureStep />}
        {activeStep.id === 'step2' && <ProjectInfoStep />}
        {activeStep.id === 'step3' && <ReviewStep />}
      </VStack>
      <RestartPoolCreationModal
        handleRestart={resetLbpCreation}
        network={selectedChain}
        poolType="Liquidity Bootstrapping"
      />
    </VStack>
  )
}
