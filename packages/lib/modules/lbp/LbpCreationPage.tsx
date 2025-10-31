'use client'

import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { LbpFormProvider } from '@repo/lib/modules/lbp/LbpFormProvider'
import { LbpForm } from '@repo/lib/modules/lbp/LbpForm'
import { LbpPreview } from '@repo/lib/modules/lbp/LbpPreview'
import { VStack, Stack, Skeleton } from '@chakra-ui/react'
import { HeaderBanner } from '@repo/lib/modules/lbp/header/HeaderBanner'
import { useHydrateLbpForm } from '@repo/lib/modules/lbp/useHydrateLbpForm'

function LbpCreationPageContent() {
  const { isLbpLoading } = useHydrateLbpForm()

  return (
    <VStack spacing="lg">
      <HeaderBanner />
      <Stack
        direction={{ base: 'column', xl: 'row' }}
        justifyContent="stretch"
        spacing="xl"
        w="full"
      >
        {isLbpLoading ? (
          <LbpPageSkeleton />
        ) : (
          <>
            <LbpForm />
            <LbpPreview />
          </>
        )}
      </Stack>
    </VStack>
  )
}

function LbpPageSkeleton() {
  return (
    <>
      <VStack align="start" spacing="lg" w="full">
        <Skeleton h="2px" w="full" />
        <Skeleton h="80px" w="full" />
        <Skeleton h="2px" w="full" />
        <Skeleton h="200px" w="full" />
        <Skeleton h="200px" w="full" />
        <Skeleton h="60px" w="full" />
      </VStack>
      <VStack align="start" spacing="md" w="full">
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
