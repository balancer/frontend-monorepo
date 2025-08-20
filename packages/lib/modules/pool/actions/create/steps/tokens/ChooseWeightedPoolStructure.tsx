import { useEffect } from 'react'
import { type Control, Controller } from 'react-hook-form'
import { WEIGHTED_POOL_STRUCTURES, WeightedPoolStructure } from '../../constants'
import { VStack, Heading, RadioGroup, Stack, Radio, Text } from '@chakra-ui/react'
import { type PoolCreationConfig, usePoolCreationForm } from '../../PoolCreationFormProvider'

export function ChooseWeightedPoolStructure({ control }: { control: Control<PoolCreationConfig> }) {
  const { poolTokens, updatePoolTokens, weightedPoolStructure, isWeightedPool } =
    usePoolCreationForm()

  const WEIGHTED_STRUCTURE_MAP = {
    [WeightedPoolStructure.Custom]: poolTokens.map(token => ({ ...token, weight: '' })),
    [WeightedPoolStructure.FiftyFifty]: poolTokens
      .map(token => ({ ...token, weight: '50' }))
      .slice(0, 2),
    [WeightedPoolStructure.EightyTwenty]: poolTokens
      .map((token, index) => ({
        ...token,
        weight: index === 0 ? '80' : '20',
      }))
      .slice(0, 2),
  } as const

  function updatePoolTokenWeights(weightedStructure: WeightedPoolStructure) {
    const newPoolTokens = WEIGHTED_STRUCTURE_MAP[weightedStructure]
    updatePoolTokens(newPoolTokens)
  }

  useEffect(() => {
    // sets token weights on only first render
    if (isWeightedPool && !weightedPoolStructure) {
      updatePoolTokens(WEIGHTED_STRUCTURE_MAP[WeightedPoolStructure.FiftyFifty])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeightedPool, weightedPoolStructure])

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
