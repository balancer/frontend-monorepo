import { type Control, Controller } from 'react-hook-form'
import { PoolCreationForm, SupportedPoolTypes } from '../../types'
import { VStack, Text, RadioGroup, Stack, Radio, HStack } from '@chakra-ui/react'
import { POOL_TYPES } from '../../constants'
import { getSwapFeePercentageOptions } from '../../helpers'
import { InfoIconPopover } from '../../InfoIconPopover'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'

export function ChoosePoolType({ control }: { control: Control<PoolCreationForm> }) {
  const poolTypesKeys = Object.keys(POOL_TYPES) as SupportedPoolTypes[]
  const {
    poolCreationForm: { setValue },
  } = usePoolCreationForm()

  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary" fontWeight="bold">
        Choose a pool type
      </Text>
      <Controller
        control={control}
        name="poolType"
        render={({ field }) => (
          <RadioGroup
            onChange={(value: SupportedPoolTypes) => {
              setValue('swapFeePercentage', getSwapFeePercentageOptions(value)[0].value)
              field.onChange(value)
            }}
            value={field.value}
          >
            <Stack spacing={3}>
              {poolTypesKeys.map(poolTypeKey => (
                <HStack key={poolTypeKey}>
                  <Radio size="lg" value={poolTypeKey}>
                    <Text color="font.primary">{POOL_TYPES[poolTypeKey].label}</Text>
                  </Radio>
                  <InfoIconPopover message={POOL_TYPES[poolTypeKey].description} />
                </HStack>
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
