'use client'

import { Stack, VStack } from '@chakra-ui/react'
import { HeaderBanner } from '@repo/lib/modules/pool/actions/create/header/HeaderBanner'
import { PoolForm } from '@repo/lib/modules/pool/actions/create/PoolForm'
import { PoolPreview } from '@repo/lib/modules/pool/actions/create/PoolPreview'

export default function BuildPage() {
  return (
    <VStack paddingX="2xl" spacing="lg">
      <HeaderBanner />
      <Stack
        direction={{ base: 'column', xl: 'row' }}
        justifyContent="stretch"
        spacing="2xl"
        w="full"
      >
        <PoolForm />
        <PoolPreview />
      </Stack>
    </VStack>
  )
}
