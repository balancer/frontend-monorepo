import { Control, Controller, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { SaleStructureForm } from '../lbp.types'
import { Box, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { ArrowRight } from 'react-feather'
import { SelectInput } from '@repo/lib/shared/components/inputs/SelectInput'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { SliderWithSteps } from '@repo/lib/shared/components/inputs/SliderWithSteps'

export function WeightAdjustmentTypeInput({
  control,
  launchTokenSymbol,
  collateralTokenSymbol,
  watch,
  setValue,
}: {
  control: Control<SaleStructureForm>
  launchTokenSymbol: string
  collateralTokenSymbol: string
  watch: UseFormWatch<SaleStructureForm>
  setValue: UseFormSetValue<SaleStructureForm>
}) {
  const options = [
    {
      label: (
        <HStack justify="space-between" w="full">
          <Text>Standard Linear LBP</Text>
          <HStack color="font.secondary">
            <Text color="font.secondary" fontSize="sm">
              {launchTokenSymbol} 90%
            </Text>
            <ArrowRight size={12} />
            <Text color="font.secondary" fontSize="sm">
              10%
            </Text>
          </HStack>
        </HStack>
      ),
      value: 'linear_90_10',
    },
    {
      label: (
        <HStack justify="space-between" w="full">
          <Text>Linear LBP to 50/50 pool</Text>
          <HStack color="font.secondary">
            <Text color="font.secondary" fontSize="sm">
              {launchTokenSymbol} 90%
            </Text>
            <ArrowRight size={12} />
            <Text color="font.secondary" fontSize="sm">
              50%
            </Text>
          </HStack>
        </HStack>
      ),
      value: 'linear_90_50',
    },
    {
      label: (
        <HStack justify="space-between" w="full">
          <Text>Custom sale</Text>
        </HStack>
      ),
      value: 'custom',
    },
  ]

  const weightAdjustment = watch('weightAdjustmentType')
  const customStartWeight = watch('customStartWeight')
  const customEndWeight = watch('customEndWeight')

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Dynamic token weight adjustments</Text>
      <Controller
        control={control}
        name="weightAdjustmentType"
        render={({ field }) => (
          <SelectInput
            defaultValue={options[0].value}
            id="weight-adjustment-type"
            onChange={newValue => {
              field.onChange(newValue as GqlChain)
            }}
            options={options}
            value={field.value}
          />
        )}
      />

      {weightAdjustment === 'custom' && (
        <Stack w="full" mt="md">
          <WeightSlider
            name="customStartWeight"
            title="Starting weights"
            launchTokenSymbol={launchTokenSymbol}
            collateralTokenSymbol={collateralTokenSymbol}
            customWeight={customStartWeight}
            setValue={setValue}
          />
          <WeightSlider
            name="customEndWeight"
            title="Ending weights"
            launchTokenSymbol={launchTokenSymbol}
            collateralTokenSymbol={collateralTokenSymbol}
            customWeight={customEndWeight}
            setValue={setValue}
          />
        </Stack>
      )}
    </VStack>
  )
}

function WeightSlider({
  name,
  title,
  launchTokenSymbol,
  collateralTokenSymbol,
  customWeight,
  setValue,
}: {
  name: keyof SaleStructureForm
  title: string
  launchTokenSymbol: string
  collateralTokenSymbol: string
  customWeight: number
  setValue: UseFormSetValue<SaleStructureForm>
}) {
  return (
    <VStack align="start" w="full">
      <Text color="font.primary">{title}</Text>
      <Box
        bg="background.level0"
        border="white"
        borderRadius="md"
        shadow="innerBase"
        sx={{ paddingX: 'md', paddingY: 'lg' }}
        w="full"
      >
        <HStack justifyContent="space-between" spacing="md" w="full">
          <Text>{`${launchTokenSymbol}: ${customWeight}`}</Text>
          <Box textAlign="right" w="100px">
            <Text
              fontSize="sm"
              textColor="font.secondary"
            >{`${collateralTokenSymbol}: ${100 - customWeight}%`}</Text>
          </Box>
        </HStack>
        <SliderWithSteps
          aria-label="weights-slider"
          onChange={value => setValue(name, value)}
          steps={[10, 20, 30, 40, 50, 60, 70, 80, 90]}
          value={customWeight}
          variant="lock"
          min={1}
          max={99}
        />
      </Box>
    </VStack>
  )
}
