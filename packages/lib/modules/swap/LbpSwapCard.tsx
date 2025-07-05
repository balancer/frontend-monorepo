import { HStack, Text } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePool } from '../pool/PoolProvider'
import { getChainName } from '@repo/lib/config/app.config'

export function LbpSwapCard() {
  const { pool } = usePool()
  return (
    <HStack
      align="center"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="md"
      justify="flex-start"
      p="sm"
      w="full"
    >
      <NetworkIcon chain={pool.chain} size={6} />
      <Text>{getChainName(pool.chain)}</Text>
    </HStack>
  )
}
