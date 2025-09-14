import { Box, VStack } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolDetails } from './PoolDetails'
import { PoolSettings } from './PoolSettings'
import { ReClammConfiguration } from './ReClammConfiguration'

export function PoolDetailsStep() {
  const { isFormStateValid, isReClamm } = usePoolCreationForm()
  const isDisabled = !isFormStateValid

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        {isReClamm && <ReClammConfiguration />}
        <PoolDetails />
        <PoolSettings />
        <PoolCreationFormAction disabled={isDisabled} />
      </VStack>
    </Box>
  )
}
