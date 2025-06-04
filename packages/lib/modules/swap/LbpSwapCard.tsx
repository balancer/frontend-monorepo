import { Card, HStack, Text } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePool } from '../pool/PoolProvider'

export function LbpSwapCard() {
  const { pool } = usePool()
  return (
    <Card variant="level5">
      <HStack>
        <NetworkIcon chain={pool.chain} size={6} />
        <Text>{pool.chain}</Text>
      </HStack>
    </Card>
  )
}
