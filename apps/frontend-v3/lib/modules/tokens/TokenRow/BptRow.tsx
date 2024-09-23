import { VStack, HStack, Text } from '@chakra-ui/react'
import { Address } from 'viem'
import TokenRow from './TokenRow'
import { Pool } from '../../pool/PoolProvider'

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
        {!isLoading && <Text color="grayText">{label}</Text>}
        {rightLabel && <Text color="grayText">{rightLabel}</Text>}
      </HStack>
      <TokenRow
        value={bptAmount}
        address={pool.address as Address}
        chain={pool.chain}
        abbreviated={false}
        isBpt={true}
        pool={pool}
        isLoading={isLoading}
      />
    </VStack>
  )
}
