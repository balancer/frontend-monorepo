'use client'

import { Stack, VStack } from '@chakra-ui/react'
import { PoolAttributes } from './PoolAttributes/PoolAttributes'
import { PoolContracts } from './PoolContracts'
import { PoolRisks } from './PoolRisks/PoolRisks'

export function PoolInfoLayout() {
  return (
    <Stack direction={{ base: 'column', md: 'row' }} justifyContent="stretch" spacing="md" w="full">
      <PoolAttributes />
      <VStack spacing="md" w="full">
        <PoolRisks h="full" />
        <PoolContracts h="full" />
      </VStack>
    </Stack>
  )
}
