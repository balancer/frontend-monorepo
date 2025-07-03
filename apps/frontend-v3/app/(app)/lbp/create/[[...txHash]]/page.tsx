'use client'

import { Stack, VStack } from '@chakra-ui/react'
import { LbpForm } from '@repo/lib/modules/lbp/LbpForm'
import { LbpPreview } from '@repo/lib/modules/lbp/LbpPreview'
import { HeaderBanner } from '@repo/lib/modules/lbp/header/HeaderBanner'

export default function LBPCreatePage() {
  return (
    <VStack spacing="lg">
      <HeaderBanner />
      <Stack
        direction={{ base: 'column', xl: 'row' }}
        justifyContent="stretch"
        spacing="md"
        w="full"
      >
        <LbpForm />
        <LbpPreview />
      </Stack>
    </VStack>
  )
}
