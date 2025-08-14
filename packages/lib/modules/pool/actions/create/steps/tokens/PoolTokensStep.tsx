import { VStack, Box } from '@chakra-ui/react'
import { PoolFormAction } from '../../PoolFormAction'

export function PoolTokensStep() {
  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <PoolFormAction disabled={true} />
      </VStack>
    </Box>
  )
}
