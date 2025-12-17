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
  Stack,
  Skeleton,
} from '@chakra-ui/react'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { PoolTypeStep } from './steps/type/PoolTypeStep'
import { PoolTokensStep } from './steps/tokens/PoolTokensStep'
import { PoolDetailsStep } from './steps/details/PoolDetailsStep'
import { PoolFundStep } from './steps/fund/PoolFundStep'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { HeaderBanner } from '@repo/lib/modules/pool/actions/create/header/HeaderBanner'
import { PreviewPoolCreation } from '@repo/lib/modules/pool/actions/create/preview/PreviewPoolCreation'
import { useHydratePoolCreationForm } from './useHydratePoolCreationForm'

export function PoolCreationForm() {
  const { isLoadingPool } = useHydratePoolCreationForm()

  const { steps, activeStepIndex, activeStep, goToStep } = usePoolCreationFormSteps()
  const { isMobile } = useBreakpoints()

  return (
    <VStack spacing="lg">
      <HeaderBanner />
      <Stack
        direction={{ base: 'column', xl: 'row' }}
        justifyContent="stretch"
        spacing="2xl"
        w="full"
      >
        {isLoadingPool ? (
          <PoolCreationSkeleton isMobile={isMobile} />
        ) : (
          <>
            <VStack
              align="start"
              maxW="540px"
              minW={{ base: 'full', md: '500px' }}
              spacing="lg"
              w="full"
            >
              <VStack align="start" spacing="md" w="full">
                <Divider />
                <Stepper
                  gap={{ base: 1, sm: 4 }}
                  index={activeStepIndex}
                  orientation="horizontal"
                  pt="sm"
                  size={{ base: 'sm', sm: 'md' }}
                  w="full"
                >
                  {steps.map((step, index) => {
                    const isCompleted = index < activeStepIndex
                    const isActive = index === activeStepIndex
                    return (
                      <Step key={step.id} w="full">
                        <Box
                          _hover={isCompleted ? { opacity: 0.8 } : undefined}
                          alignItems="center"
                          cursor={isCompleted ? 'pointer' : 'default'}
                          display="flex"
                          gap="2"
                          onClick={() => isCompleted && goToStep(index)}
                        >
                          <StepIndicator>
                            <StepStatus
                              active={<StepNumber fontWeight="bold" />}
                              complete={<StepIcon />}
                              incomplete={<StepNumber fontWeight="bold" />}
                            />
                          </StepIndicator>

                          <StepTitle fontWeight={isCompleted || isActive ? 'bold' : 'medium'}>
                            {step.title}
                          </StepTitle>
                        </Box>

                        <StepSeparator w="full" />
                      </Step>
                    )
                  })}
                </Stepper>
              </VStack>

              <Divider />

              {activeStep.id === 'step1' && <PoolTypeStep />}
              {activeStep.id === 'step2' && <PoolTokensStep />}
              {activeStep.id === 'step3' && <PoolDetailsStep />}
              {activeStep.id === 'step4' && <PoolFundStep />}
            </VStack>
            {!isMobile && <PreviewPoolCreation />}
          </>
        )}
      </Stack>
    </VStack>
  )
}

function PoolCreationSkeleton({ isMobile }: { isMobile: boolean | undefined }) {
  return (
    <>
      <VStack align="start" maxW="540px" minW={{ base: 'full', sm: '500px' }} spacing="lg" w="full">
        <Skeleton h="80px" w="full" />
        <Skeleton h="2px" w="full" />
        <Skeleton h="200px" w="full" />
        <Skeleton h="100px" w="full" />
        <Skeleton h="100px" w="full" />
        <Skeleton h="75px" w="full" />
      </VStack>
      {!isMobile && (
        <VStack align="start" spacing="md" w="full">
          <Skeleton h="1000px" w="full" />
        </VStack>
      )}
    </>
  )
}
