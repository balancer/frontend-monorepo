import { Box, Heading, VStack } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'

export function PoolFundStep() {
  const { isFormStateValid } = usePoolCreationForm()

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <Heading color="font.maxContrast" size="md">
          Seed initial pool liquidity
        </Heading>
        <PoolCreationFormAction disabled={!isFormStateValid} />
      </VStack>
    </Box>
  )
}
