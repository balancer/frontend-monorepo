import { Box, VStack, Heading } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'

export function PoolDetailsStep() {
  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <Heading color="font.maxContrast" size="md">
          Pool details
        </Heading>
        <PoolCreationFormAction disabled={true} />
      </VStack>
    </Box>
  )
}
