'use client'

import { Stack, VStack } from '@chakra-ui/react'
import { PoolAttributes } from './PoolAttributes/PoolAttributes'
import { PoolContracts } from './PoolContracts'
import { PoolRisks } from './PoolRisks/PoolRisks'

export function PoolInfoLayout() {
  return (
    <Stack direction={{ base: 'column', md: 'row' }} gap="md" justifyContent="stretch" w="full">
      <PoolAttributes />
      <VStack gap="md" w="full">
        <PoolRisks h="full" />
        <PoolContracts h="full" />
      </VStack>
    </Stack>
  )
}
