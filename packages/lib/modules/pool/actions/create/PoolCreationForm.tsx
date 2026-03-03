import { Steps, Box, VStack, Stack, Skeleton, Separator } from '@chakra-ui/react';
import { LuCheck } from 'react-icons/lu';
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { HeaderBanner } from '@repo/lib/modules/pool/actions/create/header/HeaderBanner'
import { PreviewPoolCreation } from '@repo/lib/modules/pool/actions/create/preview/PreviewPoolCreation'
import { useHydratePoolCreationForm } from './useHydratePoolCreationForm'
import { usePoolCreationForm } from './PoolCreationFormProvider'

export function PoolCreationForm() {
  const { isLoadingPool } = useHydratePoolCreationForm()
  const { steps, currentStepIndex, currentStep, goToStep, canRenderStep } = usePoolCreationForm()
  const { isMobile } = useBreakpoints()

  return (
    <VStack gap="lg">
      <HeaderBanner />
      <Stack
        direction={{ base: 'column', xl: 'row' }}
        justifyContent="stretch"
        gap="2xl"
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
              gap="lg"
              w="full"
            >
              <VStack align="start" gap="md" w="full">
                <Separator />
                <Steps.Root
                  gap={{ base: 1, sm: 4 }}
                  step={currentStepIndex}
                  orientation="horizontal"
                  pt="sm"
                  size={{ base: 'sm', sm: 'md' }}
                  w="full"
                >
                      <Steps.List>
                    {steps.map((step, index) => {
                      const isCompleted = index < currentStepIndex
                      const isActive = index === currentStepIndex
                      return (
                        <Steps.Item key={step.id} w="full">
                          <Box
                            _hover={isCompleted ? { opacity: 0.8 } : undefined}
                            alignItems="center"
                            cursor={isCompleted ? 'pointer' : 'default'}
                            display="flex"
                            gap="2"
                            onClick={() => isCompleted && goToStep(index)}
                          >
                            <Steps.Indicator>
                              <Steps.Status
                                current={<Steps.Number fontWeight="bold" />}
                                complete={<LuCheck />}
                                incomplete={<Steps.Number fontWeight="bold" />}
                              />
                            </Steps.Indicator>

                            <Steps.Title fontWeight={isCompleted || isActive ? 'bold' : 'medium'}>
                              {step.title}
                            </Steps.Title>
                          </Box>
                          <Steps.Separator w="full" />
                        </Steps.Item>
                      );
                    })}
                  </Steps.List>
                    </Steps.Root>
              </VStack>

              <Separator />

              {canRenderStep && <currentStep.Component />}
            </VStack>
            {!isMobile && <PreviewPoolCreation />}
          </>
        )}
      </Stack>
    </VStack>
  );
}

function PoolCreationSkeleton({ isMobile }: { isMobile: boolean | undefined }) {
  return (
    <>
      <VStack align="start" maxW="540px" minW={{ base: 'full', sm: '500px' }} gap="lg" w="full">
        <Skeleton h="80px" w="full" />
        <Skeleton h="2px" w="full" />
        <Skeleton h="200px" w="full" />
        <Skeleton h="100px" w="full" />
        <Skeleton h="100px" w="full" />
        <Skeleton h="75px" w="full" />
      </VStack>
      {!isMobile && (
        <VStack align="start" gap="md" w="full">
          <Skeleton h="1000px" w="full" />
        </VStack>
      )}
    </>
  );
}
