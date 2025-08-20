import { type Control, Controller } from 'react-hook-form'
import { PoolCreationConfig } from '../../PoolCreationFormProvider'
import { VStack, Text, RadioGroup, Stack, Radio } from '@chakra-ui/react'
import { POOL_TYPES, SupportedPoolTypes } from '@repo/lib/modules/pool/actions/create/constants'

export function ChoosePoolType({ control }: { control: Control<PoolCreationConfig> }) {
  const poolTypesKeys = Object.keys(POOL_TYPES) as SupportedPoolTypes[]

  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose a pool type</Text>
      <Controller
        control={control}
        name="poolType"
        render={({ field }) => (
          <RadioGroup onChange={field.onChange} value={field.value}>
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
