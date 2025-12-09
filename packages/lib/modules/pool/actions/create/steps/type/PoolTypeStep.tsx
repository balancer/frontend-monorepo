import { VStack, Heading, Box } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { ChooseNetwork } from './ChooseNetwork'
import { ChoosePoolType } from './ChoosePoolType'
import { ChooseProtocol } from './ChooseProtocol'
import { useFormState } from 'react-hook-form'
import { isBalancer } from '@repo/lib/config/getProjectConfig'

export function PoolTypeStep() {
  const { poolCreationForm } = usePoolCreationForm()
  const { control } = poolCreationForm
  const formState = useFormState({ control: poolCreationForm.control })

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <Heading color="font.maxContrast" size="md">
          Pool type
        </Heading>
        {isBalancer && <ChooseProtocol control={control} />}
        <ChooseNetwork control={control} />
        <ChoosePoolType control={control} />
        <PoolCreationFormAction disabled={!formState.isValid} />
      </VStack>
    </Box>
  )
}
