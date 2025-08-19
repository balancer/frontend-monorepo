import { VStack, Box } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { type SubmitHandler } from 'react-hook-form'
import { type PoolCreationConfig } from '../../PoolCreationFormProvider'
import { ChooseWeightedPoolStructure } from './ChooseWeightedPoolStructure'
import { ChoosePoolTokens } from './ChoosePoolTokens'
import { PoolType } from '@balancer/sdk'

export function PoolTokensStep() {
  const {
    poolConfigForm: {
      handleSubmit,
      control,
      // formState: { isValid },
      watch,
    },
    setActiveStep,
    activeStepIndex,
  } = usePoolCreationForm()

  const { poolType } = watch()

  const onSubmit: SubmitHandler<PoolCreationConfig> = () => {
    setActiveStep(activeStepIndex + 1)
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        {poolType === PoolType.Weighted && <ChooseWeightedPoolStructure control={control} />}
        <ChoosePoolTokens />
        <PoolCreationFormAction disabled={true} />
      </VStack>
    </Box>
  )
}
