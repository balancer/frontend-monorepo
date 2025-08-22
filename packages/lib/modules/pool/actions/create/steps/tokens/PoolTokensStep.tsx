import { VStack, Box } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { ChooseWeightedPoolStructure } from './ChooseWeightedPoolStructure'
import { ChoosePoolTokens } from './ChoosePoolTokens'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'

export function PoolTokensStep() {
  const {
    poolConfigForm: {
      control,
      formState: { isValid: isFormValid },
    },
  } = usePoolCreationForm()

  const { isPoolTokensStepValid, isWeightedPool } = useValidatePoolConfig()

  const isNextButtonDisabled = !isPoolTokensStepValid || !isFormValid

  return (
    <Box style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        {isWeightedPool && <ChooseWeightedPoolStructure control={control} />}
        <ChoosePoolTokens />
        <PoolCreationFormAction disabled={isNextButtonDisabled} />
      </VStack>
    </Box>
  )
}
