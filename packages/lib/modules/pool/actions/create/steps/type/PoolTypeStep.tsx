import { VStack, Heading, Divider, Box } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { type SubmitHandler } from 'react-hook-form'
import { type PoolConfig } from '../../PoolCreationFormProvider'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
// import { ChooseProtocol } from './ChooseProtocol'
import { ChooseNetwork } from './ChooseNetwork'
import { ChoosePoolType } from './ChoosePoolType'

export function PoolTypeStep() {
  const {
    poolConfigForm: {
      handleSubmit,
      control,
      formState: { isValid },
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
        <Heading color="font.maxContrast" size="md">
          Pool type
        </Heading>
        {/* <ChooseProtocol /> */}
        <ChooseNetwork control={control} />
        <ChoosePoolType control={control} />
        <Divider />
        <PoolCreationFormAction disabled={!isValid} />
      </VStack>
    </Box>
  )
}
