import { VStack, Heading, Box } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { ChooseNetwork } from './ChooseNetwork'
import { ChoosePoolType } from './ChoosePoolType'
import { useFormState } from 'react-hook-form'

export function PoolTypeStep() {
  const {
    poolCreationForm: { control },
  } = usePoolCreationForm()
  const formState = useFormState()

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <Heading color="font.maxContrast" size="md">
          Pool type
        </Heading>
        <ChooseNetwork control={control} />
        <ChoosePoolType control={control} />
        <PoolCreationFormAction disabled={!formState.isValid} />
      </VStack>
    </Box>
  )
}
