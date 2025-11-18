import { Box, VStack } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolDetails } from './PoolDetails'
import { PoolSettings } from './PoolSettings'
import { ReClammConfiguration } from './ReClammConfiguration'
import { SimilarPoolsModal } from '../../modal/SimilarPoolsModal'
import { GyroEclpConfiguration } from './GyroEclpConfiguration'
import { useValidateEclpParams } from './useValidateEclpParams'
import { isReClammPool, isGyroEllipticPool } from '../../helpers'

export function PoolDetailsStep() {
  const { poolCreationForm, reClammConfigForm, eclpConfigForm } = usePoolCreationForm()
  const [poolType] = poolCreationForm.watch(['poolType'])
  const { isEclpParamsValid } = useValidateEclpParams()

  const isPoolCreationFormValid = poolCreationForm.formState.isValid
  const isReClammFormValid = !isReClammPool(poolType) || reClammConfigForm.formState.isValid
  const isGyroEclpFormValid =
    !isGyroEllipticPool(poolType) || (eclpConfigForm.formState.isValid && isEclpParamsValid)

  const isDisabled = !isPoolCreationFormValid || !isReClammFormValid || !isGyroEclpFormValid

  return (
    <>
      <Box as="form" style={{ width: '100%' }}>
        <VStack align="start" spacing="xl" w="full">
          {isReClammPool(poolType) && <ReClammConfiguration />}
          {isGyroEllipticPool(poolType) && <GyroEclpConfiguration />}
          <PoolDetails />
          <PoolSettings />
          <PoolCreationFormAction disabled={isDisabled} />
        </VStack>
      </Box>
      <SimilarPoolsModal />
    </>
  )
}
