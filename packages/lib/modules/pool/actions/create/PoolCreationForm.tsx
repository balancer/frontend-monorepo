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
  Stack,
} from '@chakra-ui/react'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { PoolTypeStep } from './steps/type/PoolTypeStep'
import { PoolTokensStep } from './steps/tokens/PoolTokensStep'
import { PoolDetailsStep } from './steps/details/PoolDetailsStep'
import { PoolFundStep } from './steps/fund/PoolFundStep'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { HeaderBanner } from '@repo/lib/modules/pool/actions/create/header/HeaderBanner'
import { useEffect } from 'react'
import { PreviewPoolCreation } from '@repo/lib/modules/pool/actions/create/preview/PreviewPoolCreation'

export function PoolCreationForm() {
  const { steps, activeStepIndex, activeStep } = usePoolCreationFormSteps()
  const { isMobile } = useBreakpoints()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeStepIndex])

  return (
    <VStack paddingX="lg" spacing="lg">
      <HeaderBanner />
      <Stack
        direction={{ base: 'column', xl: 'row' }}
        justifyContent="stretch"
        spacing="2xl"
        w="full"
      >
        <VStack align="start" spacing="lg" w="full">
          <VStack align="start" spacing="md" w="full">
            <Text color="font.secondary" fontWeight="medium" size="sm">
              STEPS
            </Text>
            <Stepper
              index={activeStepIndex}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              w="full"
            >
              {steps.map(step => (
                <Step key={step.id} w="full">
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

                  <StepSeparator w="full" />
                </Step>
              ))}
            </Stepper>
          </VStack>

          <Divider />

          {activeStep.id === 'step1' && <PoolTypeStep />}
          {activeStep.id === 'step2' && <PoolTokensStep />}
          {activeStep.id === 'step3' && <PoolDetailsStep />}
          {activeStep.id === 'step4' && <PoolFundStep />}
        </VStack>
        {!isMobile && <PreviewPoolCreation />}
      </Stack>
    </VStack>
  )
}
