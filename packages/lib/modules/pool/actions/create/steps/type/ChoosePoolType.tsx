import { type Control, Controller } from 'react-hook-form'
import { PoolCreationForm, SupportedPoolTypes } from '../../types'
import { VStack, Text, RadioGroup, Stack, Radio, HStack } from '@chakra-ui/react'
import { POOL_TYPES, INITIAL_POOL_CREATION_FORM } from '../../constants'
import { getSwapFeePercentageOptions } from '../../helpers'
import { InfoIconPopover } from '../../InfoIconPopover'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { isCowProtocol } from '../../helpers'
import { PoolType } from '@balancer/sdk'
import { useWatch } from 'react-hook-form'
import { isProd } from '@repo/lib/config/app.config'

export function ChoosePoolType({ control }: { control: Control<PoolCreationForm> }) {
  const protocol = useWatch({ control, name: 'protocol' })
  const poolTypesKeys = Object.keys(POOL_TYPES).filter(key => {
    return !isProd || key !== PoolType.ReClamm
  }) as SupportedPoolTypes[]
  const { poolCreationForm } = usePoolCreationForm()

  const [network] = useWatch({
    control,
    name: ['network'],
  })

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
              poolCreationForm.reset({
                ...INITIAL_POOL_CREATION_FORM,
                network,
                swapFeePercentage: getSwapFeePercentageOptions(value)[0].value,
                poolType: value,
              })
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
