import { Box, VStack } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolDetails } from './PoolDetails'
import { PoolSettings } from './PoolSettings'
import { ReClammConfiguration } from './ReClammConfiguration'
import { SimilarPoolsModal } from '../../modal/SimilarPoolsModal'
import { GyroEclpConfiguration } from './GyroEclpConfiguration'
import { useValidateEclpParams } from './useValidateEclpParams'

export function PoolDetailsStep() {
  const { poolCreationForm, reClammConfigForm, eclpConfigForm, isReClamm, isGyroEclp } =
    usePoolCreationForm()
  const { isEclpParamsValid } = useValidateEclpParams()

  const isPoolCreationFormValid = poolCreationForm.formState.isValid
  const isReClammFormValid = !isReClamm || reClammConfigForm.formState.isValid
  const isGyroEclpFormValid = !isGyroEclp || (eclpConfigForm.formState.isValid && isEclpParamsValid)

  const isDisabled = !isPoolCreationFormValid || !isReClammFormValid || !isGyroEclpFormValid

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
