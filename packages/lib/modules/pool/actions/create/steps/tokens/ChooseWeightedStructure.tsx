import { type Control, Controller } from 'react-hook-form'
import { WEIGHTED_POOL_STRUCTURES } from '../../constants'
import { VStack, Heading, RadioGroup, Stack, Radio, Text } from '@chakra-ui/react'
import { type PoolConfig } from '../../PoolCreationFormProvider'

export function ChooseWeightedStructure({ control }: { control: Control<PoolConfig> }) {
  return (
    <VStack align="start" spacing="md" w="full">
      <Heading color="font.maxContrast" size="md">
        Weighted pool structure
      </Heading>
      <Controller
        control={control}
        name="weightedPoolStructure"
        render={({ field }) => (
          <RadioGroup onChange={field.onChange} value={field.value}>
            <Stack spacing={3}>
              {WEIGHTED_POOL_STRUCTURES.map(structure => (
                <Radio key={structure} size="lg" value={structure}>
                  <Text>{structure}</Text>
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        )}
        rules={{
          required: 'Please select a pool type',
        }}
      />
    </VStack>
  )
}
