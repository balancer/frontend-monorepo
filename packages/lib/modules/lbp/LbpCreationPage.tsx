'use client'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { LuCheck } from 'react-icons/lu'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { LbpFormProvider } from '@repo/lib/modules/lbp/LbpFormProvider'
import { LbpForm } from '@repo/lib/modules/lbp/LbpForm'
import { LbpPreview } from '@repo/lib/modules/lbp/LbpPreview'
import { Steps, VStack, Stack, Skeleton, Box, Separator } from '@chakra-ui/react'
import { HeaderBanner } from '@repo/lib/modules/lbp/header/HeaderBanner'
import { useHydrateLbpForm } from '@repo/lib/modules/lbp/useHydrateLbpForm'
import { useLbpForm } from '@repo/lib/modules/lbp/LbpFormProvider'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'

function LbpCreationPageContent() {
  const { isLbpLoading } = useHydrateLbpForm()
  const { steps, currentStepIndex } = useLbpForm()
  const { isMobile } = useBreakpoints()

  return (
    <VStack align="start" gap="lg">
      <HeaderBanner />
      {isLbpLoading ? (
        <LbpPageSkeleton />
      ) : (
        <>
          <Steps.Root
            orientation={isMobile ? 'vertical' : 'horizontal'}
            step={currentStepIndex}
            w="50%"
          >
            <Steps.List>
              {steps.map(step => (
                <Steps.Item key={step.id}>
                  <Steps.Indicator>
                    <Steps.Status
                      complete={<LuCheck />}
                      current={<Steps.Number />}
                      incomplete={<Steps.Number />}
                    />
                  </Steps.Indicator>

                  <Box flexShrink="0">
                    <Steps.Title>{step.title}</Steps.Title>
                  </Box>

                  <Steps.Separator />
                </Steps.Item>
              ))}
            </Steps.List>
          </Steps.Root>

          <Separator />

          <Stack
            direction={{ base: 'column', xl: 'row' }}
            gap="xl"
            justifyContent="stretch"
            w="full"
          >
            <LbpForm />
            <LbpPreview />
          </Stack>
        </>
      )}
    </VStack>
  )
}

function LbpPageSkeleton() {
  return (
    <>
      <VStack align="start" gap="lg" w="full">
        <Skeleton h="2px" w="full" />
        <Skeleton h="80px" w="full" />
        <Skeleton h="2px" w="full" />
        <Skeleton h="200px" w="full" />
        <Skeleton h="200px" w="full" />
        <Skeleton h="60px" w="full" />
      </VStack>
      <VStack align="start" gap="md" w="full">
        <Skeleton h="1300px" w="full" />
      </VStack>
    </>
  )
}

export default function LbpCreationPage() {
  return (
    <DefaultPageContainer minH="100vh">
      <TransactionStateProvider>
        <LbpFormProvider>
          <Permit2SignatureProvider>
            <LbpCreationPageContent />
          </Permit2SignatureProvider>
        </LbpFormProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
