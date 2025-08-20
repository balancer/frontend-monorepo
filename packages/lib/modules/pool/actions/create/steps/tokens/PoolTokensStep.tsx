import { VStack, Box } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'

export function PoolTokensStep() {
  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <PoolCreationFormAction disabled={true} />
      </VStack>
    </Box>
  )
}
