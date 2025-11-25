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
import { useFormState, useWatch } from 'react-hook-form'

export function PoolDetailsStep() {
  const { poolCreationForm, reClammConfigForm, eclpConfigForm } = usePoolCreationForm()
  const [poolType] = useWatch({ control: poolCreationForm.control, name: ['poolType'] })
  const { isEclpParamsValid } = useValidateEclpParams()

  const poolCreationFormState = useFormState({ control: poolCreationForm.control })
  const isPoolCreationFormInvalid = !poolCreationFormState.isValid
  const reclammFormState = useFormState({ control: reClammConfigForm.control })
  const isReClammFormInvalid = isReClammPool(poolType) && !reclammFormState.isValid
  const eclpFormState = useFormState({ control: eclpConfigForm.control })
  const isGyroEclpFormInvalid =
    isGyroEllipticPool(poolType) && (!eclpFormState.isValid || !isEclpParamsValid)

  const isDisabled = isPoolCreationFormInvalid || isReClammFormInvalid || isGyroEclpFormInvalid

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
