import { Box, VStack } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolDetails } from './PoolDetails'
import { PoolSettings } from './PoolSettings'
import { AutoRangeConfiguration } from './AutoRangeConfiguration'
import { SimilarPoolsModal } from '../../modal/SimilarPoolsModal'
import { GyroEclpConfiguration } from './GyroEclpConfiguration'
import { useValidateEclpParams } from './useValidateEclpParams'
import { isAutoRangePool, isGyroEllipticPool, isCowPool } from '../../helpers'
import { useFormState, useWatch } from 'react-hook-form'

export function PoolDetailsStep() {
  const { poolCreationForm, autoRangeConfigForm, eclpConfigForm } = usePoolCreationForm()
  const [poolType] = useWatch({ control: poolCreationForm.control, name: ['poolType'] })
  const { isEclpParamsValid } = useValidateEclpParams()

  // CoW AMM has no pool settings config because built on Balancer v1
  const showPoolSettings = !isCowPool(poolType)

  const poolCreationFormState = useFormState({ control: poolCreationForm.control })
  const isPoolCreationFormInvalid = !poolCreationFormState.isValid
  const autoRangeFormState = useFormState({ control: autoRangeConfigForm.control })
  const isAutoRangeFormInvalid = isAutoRangePool(poolType) && !autoRangeFormState.isValid
  const eclpFormState = useFormState({ control: eclpConfigForm.control })
  const isGyroEclpFormInvalid =
    isGyroEllipticPool(poolType) && (!eclpFormState.isValid || !isEclpParamsValid)

  const isDisabled = isPoolCreationFormInvalid || isAutoRangeFormInvalid || isGyroEclpFormInvalid

  return (
    <>
      <Box as="form" style={{ width: '100%' }}>
        <VStack align="start" spacing="xl" w="full">
          {isAutoRangePool(poolType) && <AutoRangeConfiguration />}
          {isGyroEllipticPool(poolType) && <GyroEclpConfiguration />}
          <PoolDetails />
          {showPoolSettings && <PoolSettings />}
          <PoolCreationFormAction disabled={isDisabled} />
        </VStack>
      </Box>
      <SimilarPoolsModal />
    </>
  )
}
