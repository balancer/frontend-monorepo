import { Box, VStack } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolDetails } from './PoolDetails'
import { PoolSettings } from './PoolSettings'
import { ReClammConfiguration } from './ReClammConfiguration'
import { SimilarPoolsModal } from '../../modal/SimilarPoolsModal'
import { GyroEclpConfiguration } from './GyroEclpConfiguration'

export function PoolDetailsStep() {
  const { poolCreationForm, isReClamm, isGyroEclp } = usePoolCreationForm()

  const isPoolCreationFormValid = poolCreationForm.formState.isValid
  const isReClammFormValid = !isReClamm || poolCreationForm.formState.isValid
  const isDisabled = !isPoolCreationFormValid || !isReClammFormValid

  return (
    <>
      <Box as="form" style={{ width: '100%' }}>
        <VStack align="start" spacing="xl" w="full">
          {isReClamm && <ReClammConfiguration />}
          {isGyroEclp && <GyroEclpConfiguration />}
          <PoolDetails />
          <PoolSettings />
          <PoolCreationFormAction disabled={isDisabled} />
        </VStack>
      </Box>
      <SimilarPoolsModal />
    </>
  )
}
