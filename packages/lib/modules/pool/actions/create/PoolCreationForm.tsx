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
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { PoolTypeStep } from './steps/type/PoolTypeStep'
import { PoolTokensStep } from './steps/tokens/PoolTokensStep'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { HeaderBanner } from '@repo/lib/modules/pool/actions/create/header/HeaderBanner'
import { useEffect } from 'react'
import { PoolCreationPreview } from '@repo/lib/modules/pool/actions/create/preview/PoolCreationPreview'

export function PoolCreationForm() {
  const { steps, activeStepIndex, activeStep } = usePoolCreationForm()
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
            {activeStep.id === 'step1' && <PoolTypeStep />}
            {activeStep.id === 'step2' && <PoolTokensStep />}
          </VStack>
        </VStack>
        {!isMobile && <PoolCreationPreview />}
      </Stack>
    </VStack>
  )
}
