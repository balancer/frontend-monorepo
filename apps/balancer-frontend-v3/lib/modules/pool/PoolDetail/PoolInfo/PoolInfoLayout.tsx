'use client'

import { Stack, VStack } from '@chakra-ui/react'
import { PoolAttributes } from './PoolAttributes/PoolAttributes'
import { PoolContracts } from './PoolContracts'
import { PoolRisks } from './PoolRisks/PoolRisks'

export function PoolInfoLayout() {
  return (
    <Stack w="full" spacing="md" direction={{ base: 'column', md: 'row' }} justifyContent="stretch">
      <PoolAttributes />
      <VStack w="full" spacing="md">
        <PoolRisks h="full" />
        <PoolContracts h="full" />
      </VStack>
    </Stack>
  )
}
