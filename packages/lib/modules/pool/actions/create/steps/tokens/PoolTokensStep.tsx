import { VStack, Box } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { ChooseWeightedPoolStructure } from './ChooseWeightedPoolStructure'
import { ChoosePoolTokens } from './ChoosePoolTokens'
import { validatePoolTokens, validatePoolType } from '../../validatePoolCreationForm'

export function PoolTokensStep() {
  const { isFormStateValid, poolType, poolTokens, poolCreationForm } = usePoolCreationForm()

  const isValidTokenWeights = validatePoolTokens.isValidTokenWeights(poolType, poolTokens)
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)
  const isValidTokens = validatePoolTokens.isValidTokens(poolTokens)
  const isDisabled = !isValidTokenWeights || !isFormStateValid || !isValidTokens

  return (
    <Box style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        {isWeightedPool && <ChooseWeightedPoolStructure control={poolCreationForm.control} />}
        <ChoosePoolTokens />
        <PoolCreationFormAction disabled={isDisabled} />
      </VStack>
    </Box>
  )
}
