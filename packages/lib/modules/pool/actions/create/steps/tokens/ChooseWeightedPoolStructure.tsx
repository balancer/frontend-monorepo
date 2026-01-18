import { useEffect } from 'react'
import { type Control, Controller, useWatch } from 'react-hook-form'
import { WEIGHTED_POOL_STRUCTURES, WeightedPoolStructure } from '../../constants'
import { VStack, Heading, RadioGroup, Stack, Radio, Text } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolCreationForm } from '../../types'
import { isWeightedPool, isCowPool } from '../../helpers'

export function ChooseWeightedPoolStructure({ control }: { control: Control<PoolCreationForm> }) {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolTokens, weightedPoolStructure, poolType] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'weightedPoolStructure', 'poolType'],
  })

  const weightedPoolStructures = WEIGHTED_POOL_STRUCTURES.filter(structure => {
    return isCowPool(poolType) ? structure !== WeightedPoolStructure.Custom : true
  })

  function updatePoolTokenWeights(weightedStructure: WeightedPoolStructure) {
    if (weightedStructure === WeightedPoolStructure.FiftyFifty) {
      poolCreationForm.setValue(
        'poolTokens',
        poolTokens.map(token => ({ ...token, weight: '50' })).slice(0, 2)
      )
    }

    if (weightedStructure === WeightedPoolStructure.EightyTwenty) {
      poolCreationForm.setValue(
        'poolTokens',
        poolTokens
          .map((token, index) => ({ ...token, weight: index === 0 ? '80' : '20' }))
          .slice(0, 2)
      )
    }

    if (weightedStructure !== WeightedPoolStructure.Custom) poolCreationForm.trigger('poolTokens')
  }

  const shouldUpdateTokenWeights = isWeightedPool(poolType) || isCowPool(poolType)

  useEffect(() => {
    if (shouldUpdateTokenWeights) {
      updatePoolTokenWeights(weightedPoolStructure)
    }
  }, [shouldUpdateTokenWeights])

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
              {weightedPoolStructures.map(structure => (
                <Radio key={structure} size="lg" value={structure}>
                  <Text>
                    {structure !== WeightedPoolStructure.Custom && '2-token: '}
                    {structure === WeightedPoolStructure.Custom ? 'Custom' : structure}
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
