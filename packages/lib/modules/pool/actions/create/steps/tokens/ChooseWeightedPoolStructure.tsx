import { type Control, Controller } from 'react-hook-form'
import { WEIGHTED_POOL_STRUCTURES, WeightedPoolStructure } from '../../constants'
import { VStack, Heading, RadioGroup, Stack, Radio, Text } from '@chakra-ui/react'
import { type PoolCreationConfig, usePoolCreationForm } from '../../PoolCreationFormProvider'

export function ChooseWeightedPoolStructure({ control }: { control: Control<PoolCreationConfig> }) {
  const {
    poolConfigForm: { watch, setValue },
  } = usePoolCreationForm()

  const poolTokens = watch('poolTokens')

  function updatePoolTokenWeights(weightedStructure: WeightedPoolStructure) {
    const newWeights = weightedStructure.split('/')

    if (weightedStructure !== WeightedPoolStructure.Custom) {
      setValue(
        'poolTokens',
        poolTokens.map((token, index) => ({
          ...token,
          config: { ...token.config, weight: newWeights[index] },
        }))
      )
    }
  }

  return (
    <VStack align="start" spacing="md" w="full">
      <Heading color="font.maxContrast" size="md">
        Weighted pool structure
      </Heading>
      <Controller
        control={control}
        name="weightedPoolStructure"
        render={({ field }) => (
          <RadioGroup
            onChange={value => {
              updatePoolTokenWeights(value as WeightedPoolStructure)
              field.onChange(value)
            }}
            value={field.value}
          >
            <Stack spacing={3}>
              {WEIGHTED_POOL_STRUCTURES.map(structure => (
                <Radio key={structure} size="lg" value={structure}>
                  <Text>
                    {structure !== WeightedPoolStructure.Custom && '2-token: '}
                    {structure}
                  </Text>
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
