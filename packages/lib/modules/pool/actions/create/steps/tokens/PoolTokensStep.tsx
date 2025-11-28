import { VStack, Box } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { ChooseWeightedPoolStructure } from './ChooseWeightedPoolStructure'
import { ChoosePoolTokens } from './ChoosePoolTokens'
import { validatePoolTokens } from '../../validatePoolCreationForm'
import { isWeightedPool } from '../../helpers'
import { useFormState, useWatch } from 'react-hook-form'

export function PoolTokensStep() {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolType, poolTokens] = useWatch({
    control: poolCreationForm.control,
    name: ['poolType', 'poolTokens'],
  })

  const formState = useFormState({ control: poolCreationForm.control })
  const isFormStateValid = formState.isValid
  const isValidTokenWeights = validatePoolTokens.isValidTokenWeights(poolType, poolTokens)
  const isValidTokens = validatePoolTokens.isValidTokens(poolTokens)
  const isDisabled = !isValidTokenWeights || !isFormStateValid || !isValidTokens

  return (
    <Box style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        {isWeightedPool(poolType) && (
          <ChooseWeightedPoolStructure control={poolCreationForm.control} />
        )}
        <ChoosePoolTokens />
        <PoolCreationFormAction disabled={isDisabled} />
      </VStack>
    </Box>
  )
}
