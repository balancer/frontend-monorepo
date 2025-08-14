'use client'
import { Stack, VStack } from '@chakra-ui/react'
import { HeaderBanner } from '@repo/lib/modules/pool/actions/create/header/HeaderBanner'
import { PoolForm } from '@repo/lib/modules/pool/actions/create/PoolForm'
import { PoolPreview } from '@repo/lib/modules/pool/actions/create/PoolPreview'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'

export default function BuildPage() {
  const { isMobile } = useBreakpoints()

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
        {!isMobile && <PoolPreview />}
      </Stack>
    </VStack>
  )
}
