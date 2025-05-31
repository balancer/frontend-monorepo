'use client'

import { HStack, VStack } from '@chakra-ui/react'
import { LbpForm } from '@repo/lib/modules/lbp/LbpForm'
import { LbpFormProvider } from '@repo/lib/modules/lbp/LbpFormProvider'
import { LbpCreationProvider } from '@repo/lib/modules/lbp/LbpCreationProvider'
import { LbpPreview } from '@repo/lib/modules/lbp/LbpPreview'
import { HeaderBanner } from '@repo/lib/modules/lbp/header/HeaderBanner'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export default function LBPCreatePage() {
  return (
    <TransactionStateProvider>
      <LbpFormProvider>
        <LbpCreationProvider>
          <VStack spacing="lg">
            <HeaderBanner />
            <HStack align="start" spacing="lg" w="full">
              <LbpForm />
              <LbpPreview />
            </HStack>
          </VStack>
        </LbpCreationProvider>
      </LbpFormProvider>
    </TransactionStateProvider>
  )
}
