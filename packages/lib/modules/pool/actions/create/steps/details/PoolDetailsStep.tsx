import { Box, VStack } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolDetails } from './PoolDetails'
import { PoolSettings } from './PoolSettings'

export function PoolDetailsStep() {
  const { isFormStateValid } = usePoolCreationForm()
  const isDisabled = !isFormStateValid

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <PoolDetails />
        <PoolSettings />
        <PoolCreationFormAction disabled={isDisabled} />
      </VStack>
    </Box>
  )
}
