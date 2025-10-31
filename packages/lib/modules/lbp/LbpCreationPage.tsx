'use client'

import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { LbpFormProvider } from '@repo/lib/modules/lbp/LbpFormProvider'
import { LbpForm } from '@repo/lib/modules/lbp/LbpForm'
import { LbpPreview } from '@repo/lib/modules/lbp/LbpPreview'
import { VStack, Stack, Box } from '@chakra-ui/react'
import { HeaderBanner } from '@repo/lib/modules/lbp/header/HeaderBanner'
import { useHydrateLbpForm } from '@repo/lib/modules/lbp/useHydrateLbpForm'

function LbpCreationPageContent() {
  const { isLbpLoading } = useHydrateLbpForm()

  return (
    <VStack spacing="lg">
      <HeaderBanner />
      {isLbpLoading ? (
        <Box w="full">Loading LBP...</Box>
      ) : (
        <Stack
          direction={{ base: 'column', xl: 'row' }}
          justifyContent="stretch"
          spacing="xl"
          w="full"
        >
          <LbpForm />
          <LbpPreview />
        </Stack>
      )}
    </VStack>
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
