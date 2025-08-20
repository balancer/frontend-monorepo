import { VStack, Box } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { type SubmitHandler } from 'react-hook-form'
import { type PoolCreationConfig } from '../../PoolCreationFormProvider'
import { ChooseWeightedPoolStructure } from './ChooseWeightedPoolStructure'
import { ChoosePoolTokens } from './ChoosePoolTokens'

export function PoolTokensStep() {
  const {
    isWeightedPool,
    poolConfigForm: {
      handleSubmit,
      control,
      formState: { isValid },
    },
    setActiveStep,
    activeStepIndex,
  } = usePoolCreationForm()

  const onSubmit: SubmitHandler<PoolCreationConfig> = () => {
    setActiveStep(activeStepIndex + 1)
  }

  console.log('pool tokens step is valid:', isValid)

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        {isWeightedPool && <ChooseWeightedPoolStructure control={control} />}
        <ChoosePoolTokens />
        <PoolCreationFormAction disabled={true} />
      </VStack>
    </Box>
  )
}
