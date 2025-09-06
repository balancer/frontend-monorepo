import { type Control, Controller } from 'react-hook-form'
import { PoolCreationForm, SupportedPoolTypes } from '../../types'
import { VStack, Text, RadioGroup, Stack, Radio } from '@chakra-ui/react'
import { POOL_TYPES, SWAP_FEE_PERCENTAGE_OPTIONS } from '../../constants'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'

export function ChoosePoolType({ control }: { control: Control<PoolCreationForm> }) {
  const poolTypesKeys = Object.keys(POOL_TYPES) as SupportedPoolTypes[]
  const {
    poolCreationForm: { setValue },
  } = usePoolCreationForm()

  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose a pool type</Text>
      <Controller
        control={control}
        name="poolType"
        render={({ field }) => (
          <RadioGroup
            onChange={(value: SupportedPoolTypes) => {
              setValue('swapFeePercentage', SWAP_FEE_PERCENTAGE_OPTIONS[value][0].value)
              field.onChange(value)
            }}
            value={field.value}
          >
            <Stack spacing={3}>
              {poolTypesKeys.map(poolTypeKey => (
                <Radio key={poolTypeKey} size="lg" value={poolTypeKey}>
                  <Text
                    color="font.primary"
                    textDecoration="underline"
                    textDecorationStyle="dotted"
                    textDecorationThickness="1px"
                    textUnderlineOffset="3px"
                  >
                    {POOL_TYPES[poolTypeKey].label}
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
