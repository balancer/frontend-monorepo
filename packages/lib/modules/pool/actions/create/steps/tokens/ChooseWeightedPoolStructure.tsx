import { useEffect } from 'react'
import { type Control, Controller } from 'react-hook-form'
import { WEIGHTED_POOL_STRUCTURES, WeightedPoolStructure } from '../../constants'
import { VStack, Heading, RadioGroup, Stack, Radio, Text } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { type PoolCreationForm } from '../../constants'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'

export function ChooseWeightedPoolStructure({ control }: { control: Control<PoolCreationForm> }) {
  const { poolTokens, updatePoolTokens, weightedPoolStructure, poolCreationForm } =
    usePoolCreationForm()

  const { isWeightedPool } = useValidatePoolConfig()

  function updatePoolTokenWeights(weightedStructure: WeightedPoolStructure) {
    if (weightedStructure === WeightedPoolStructure.FiftyFifty) {
      updatePoolTokens(poolTokens.map(token => ({ ...token, weight: '50' })).slice(0, 2))
    }

    if (weightedStructure === WeightedPoolStructure.EightyTwenty) {
      updatePoolTokens(
        poolTokens
          .map((token, index) => ({ ...token, weight: index === 0 ? '80' : '20' }))
          .slice(0, 2)
      )
    }

    if (weightedStructure !== WeightedPoolStructure.Custom) poolCreationForm.trigger('poolTokens')
  }

  useEffect(() => {
    if (isWeightedPool) updatePoolTokenWeights(weightedPoolStructure)
  }, [])

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
