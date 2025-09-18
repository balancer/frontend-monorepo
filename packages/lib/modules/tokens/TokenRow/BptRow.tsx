import { VStack, HStack, Text } from '@chakra-ui/react'
import { Address } from 'viem'
import TokenRow from './TokenRow'
import { Pool } from '../../pool/pool.types'
import { ReactNode } from 'react'

export function BptRow({
  label,
  rightElement,
  bptAmount,
  pool,
  isLoading,
}: {
  label: string
  bptAmount: string
  pool: Pool
  rightElement?: ReactNode
  isLoading?: boolean
}) {
  return (
    <VStack align="start" spacing="md">
      <HStack justify="space-between" w="full">
        {!isLoading && (
          <Text fontSize="sm" fontWeight="bold">
            {label}
          </Text>
        )}
        {rightElement}
      </HStack>
      <TokenRow
        abbreviated={false}
        address={pool.address as Address}
        chain={pool.chain}
        isBpt
        isLoading={isLoading}
        pool={pool}
        value={bptAmount}
      />
    </VStack>
  )
}
