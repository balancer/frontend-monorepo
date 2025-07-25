import { VStack, HStack, Text } from '@chakra-ui/react'
import { Address } from 'viem'
import TokenRow from './TokenRow'
import { Pool } from '../../pool/pool.types'

export function BptRow({
  label,
  rightLabel,
  bptAmount,
  pool,
  isLoading,
}: {
  label: string
  bptAmount: string
  pool: Pool
  rightLabel?: string
  isLoading?: boolean
}) {
  return (
    <VStack align="start" spacing="md">
      <HStack justify="space-between" w="full">
        {!isLoading && (
          <Text color="grayText" fontSize="sm" fontWeight="bold">
            {label}
          </Text>
        )}
        {rightLabel && (
          <Text color="grayText" fontSize="sm">
            {rightLabel}
          </Text>
        )}
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
