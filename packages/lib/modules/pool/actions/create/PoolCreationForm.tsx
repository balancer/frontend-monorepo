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
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { HeaderBanner } from '@repo/lib/modules/pool/actions/create/header/HeaderBanner'
import { PreviewPoolCreation } from '@repo/lib/modules/pool/actions/create/preview/PreviewPoolCreation'
import { useHydratePoolCreationForm } from './useHydratePoolCreationForm'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { useWatch } from 'react-hook-form'
import { validatePoolTokens } from './validatePoolCreationForm'

export function PoolCreationForm() {
  const { isLoadingPool } = useHydratePoolCreationForm()
  const { poolCreationForm } = usePoolCreationForm()
  const [poolTokens] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens'],
  })

  const { steps, currentStepIndex, currentStep, goToStep } = usePoolCreationFormSteps()
  const { isMobile } = useBreakpoints()
  const router = useRouter()

  const isFormHydrated = poolCreationForm.isHydrated
  const stepRequiresValidTokens = currentStepIndex >= 2
  const hasValidTokens = validatePoolTokens.isValidTokens(poolTokens)
  const canRenderStep = stepRequiresValidTokens ? hasValidTokens : true

  useEffect(() => {
    // wait for local storage to load form data
    if (!isFormHydrated) return
    if (!canRenderStep) router.replace('/create/step-1-type')
  }, [isFormHydrated, stepRequiresValidTokens, hasValidTokens])

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
                  index={currentStepIndex}
                  orientation="horizontal"
                  pt="sm"
                  size={{ base: 'sm', sm: 'md' }}
                  w="full"
                >
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex
                    const isActive = index === currentStepIndex
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

              {canRenderStep && <currentStep.Component />}
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
