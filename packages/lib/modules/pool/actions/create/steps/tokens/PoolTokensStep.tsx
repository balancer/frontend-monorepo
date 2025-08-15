import { VStack, Box } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { type SubmitHandler } from 'react-hook-form'
import { type PoolConfig } from '../../PoolCreationFormProvider'
import { ChooseWeightedStructure } from './ChooseWeightedStructure'
import { ChoosePoolTokens } from './ChoosePoolTokens'

export function PoolTokensStep() {
  const {
    poolConfigForm: {
      handleSubmit,
      control,
      // formState: { isValid },
    },
    setActiveStep,
    activeStepIndex,
  } = usePoolCreationForm()

  const onSubmit: SubmitHandler<PoolConfig> = () => {
    setActiveStep(activeStepIndex + 1)
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <ChooseWeightedStructure control={control} />
        <ChoosePoolTokens />
        <PoolCreationFormAction disabled={true} />
      </VStack>
    </Box>
  )
}
