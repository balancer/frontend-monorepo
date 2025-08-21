import { VStack, Box } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { type SubmitHandler } from 'react-hook-form'
import { type PoolCreationConfig } from '../../PoolCreationFormProvider'
import { ChooseWeightedPoolStructure } from './ChooseWeightedPoolStructure'
import { ChoosePoolTokens } from './ChoosePoolTokens'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'

export function PoolTokensStep() {
  const {
    poolConfigForm: {
      handleSubmit,
      control,
      formState: { isValid: isFormValid },
    },
    setActiveStep,
    activeStepIndex,
  } = usePoolCreationForm()

  const { isWeightedPool } = useValidatePoolConfig()

  const { isPoolTokensStepValid } = useValidatePoolConfig()

  const isNextButtonDisabled = !isPoolTokensStepValid || !isFormValid

  const onSubmit: SubmitHandler<PoolCreationConfig> = () => {
    setActiveStep(activeStepIndex + 1)
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        {isWeightedPool && <ChooseWeightedPoolStructure control={control} />}
        <ChoosePoolTokens />
        <PoolCreationFormAction disabled={isNextButtonDisabled} />
      </VStack>
    </Box>
  )
}
