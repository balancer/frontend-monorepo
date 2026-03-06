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
  loading,
}: {
  label: string
  bptAmount: string
  pool: Pool
  rightElement?: ReactNode
  loading?: boolean
}) {
  return (
    <VStack align="start" gap="md">
      <HStack justify="space-between" w="full">
        {!loading && (
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
        loading={loading}
        pool={pool}
        value={bptAmount}
      />
    </VStack>
  )
}
