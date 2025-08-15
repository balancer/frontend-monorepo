import { type Control, Controller } from 'react-hook-form'
import { PoolConfig } from '../../PoolCreationFormProvider'
import { VStack, Text, RadioGroup, Stack, Radio } from '@chakra-ui/react'
import { POOL_TYPES } from '@repo/lib/modules/pool/actions/create/constants'

export function ChoosePoolType({ control }: { control: Control<PoolConfig> }) {
  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose a pool type</Text>
      <Controller
        control={control}
        name="poolType"
        render={({ field }) => (
          <RadioGroup onChange={field.onChange} value={field.value}>
            <Stack spacing={3}>
              {POOL_TYPES.map(poolType => (
                <Radio key={poolType.value} size="lg" value={poolType.value}>
                  <Text
                    color="font.primary"
                    textDecoration="underline"
                    textDecorationStyle="dotted"
                    textDecorationThickness="1px"
                    textUnderlineOffset="3px"
                  >
                    {poolType.label}
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
