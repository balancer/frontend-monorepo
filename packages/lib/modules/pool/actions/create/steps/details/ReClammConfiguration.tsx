import { Heading, VStack, Text, HStack, Card, SimpleGrid } from '@chakra-ui/react'
import { BalPopover } from '@repo/lib/shared/components/popover/BalPopover'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import {
  useReClammConfigurationOptions,
  ReClammConfigOptionsGroup,
} from './useReClammConfigurationOptions'
import { PoolCreationCheckbox } from '../../PoolCreationCheckbox'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { NumberInput } from '@repo/lib/shared/components/inputs/NumberInput'
import { bn } from '@repo/lib/shared/utils/numbers'
import { getPercentFromPrice } from '../../helpers'
import { formatNumber } from '../../helpers'

export function ReClammConfiguration() {
  const reClammConfigurationOptions = useReClammConfigurationOptions()

  return (
    <VStack align="start" spacing="xl" w="full">
      <Heading color="font.maxContrast" size="md">
        ReClamm configuration
      </Heading>
      {reClammConfigurationOptions.map(option => (
        <ConfigOptionsGroup
          customInputLabel={option.customInputLabel}
          key={option.label}
          label={option.label}
          name={option.name}
          options={option.options}
          updateFn={option.updateFn}
          validateFn={option.validateFn}
        />
      ))}
    </VStack>
  )
}

function ConfigOptionsGroup({
  label,
  options,
  updateFn,
  validateFn,
  name,
  customInputLabel,
}: ReClammConfigOptionsGroup) {
  const { reClammConfigForm } = usePoolCreationForm()
  const { initialMinPrice, initialTargetPrice, initialMaxPrice } = reClammConfigForm.watch()
  const formValue = reClammConfigForm.watch(name)
  const optionRawValues = options.map(option => Number(option.rawValue))
  const errors = reClammConfigForm.formState.errors[name]

  const isCustom = !optionRawValues.includes(Number(formValue))
  const isCustomTargetPrice = isCustom && name === 'initialTargetPrice'
  const ispriceRangePercentage = name === 'priceRangePercentage'
  const isCustomPriceRange = isCustom && ispriceRangePercentage
  const isPercentage = name === 'centerednessMargin' || name === 'priceShiftDailyRate'

  return (
    <VStack align="start" spacing="md" w="full">
      <HStack>
        <Text textAlign="start" w="full">
          {label}
        </Text>
        <BalPopover text="TODO">
          <InfoIcon />
        </BalPopover>
      </HStack>
      <SimpleGrid columns={3} spacing="md" w="full">
        {options.map(option => {
          const isSelected = Number(formValue) === Number(option.rawValue)
          const bg = isSelected ? '#63F2BE0D' : 'background.level2'
          const borderColor = isSelected ? '#25E2A4' : 'transparent'
          const shadow = isSelected ? 'none' : 'lg'
          const textColor = isSelected ? 'font.maxContrast' : 'font.secondary'

          return (
            <Card
              _hover={{ cursor: 'pointer', shadow: 'md' }}
              bg={bg}
              borderColor={borderColor}
              h={141}
              key={option.label}
              onClick={() => updateFn(option.rawValue)}
              shadow={shadow}
            >
              <VStack h="full" justify="center">
                <option.svg height="100%" width="100%" />
                <Text color={textColor} fontSize="sm">
                  {option.label}
                </Text>
                <Text color={textColor} fontWeight="bold">
                  {option.displayValue}
                </Text>
              </VStack>
            </Card>
          )
        })}
      </SimpleGrid>
      <PoolCreationCheckbox
        isChecked={isCustom}
        label="Or choose custom"
        labelColor="font.secondary"
        onChange={() => {
          updateFn('')
        }}
      />
      {isCustomPriceRange ? (
        <VStack align="start" spacing="md" w="full">
          <NumberInput
            control={reClammConfigForm.control}
            error={reClammConfigForm.formState.errors['initialMinPrice']?.message}
            label={'Range low price'}
            name={'initialMinPrice'}
            percentageLabel={
              initialMinPrice ? getPercentFromPrice(initialMinPrice, initialTargetPrice) : '-10.00'
            }
            placeholder={
              initialTargetPrice ? bn(initialTargetPrice).times(0.9).toString().slice(0, 7) : ''
            }
            validate={value => {
              if (Number(value) >= Number(initialTargetPrice)) {
                return 'Range low price must be less than target price'
              }
              if (Number(value) >= Number(initialMaxPrice)) {
                return 'Range low price must be less than range high price'
              }
              return true
            }}
            width="full"
          />
          <NumberInput
            control={reClammConfigForm.control}
            error={reClammConfigForm.formState.errors['initialMaxPrice']?.message}
            label={'Range high price'}
            name={'initialMaxPrice'}
            percentageLabel={
              initialMaxPrice ? getPercentFromPrice(initialMaxPrice, initialTargetPrice) : '10.00'
            }
            placeholder={
              initialTargetPrice ? formatNumber(bn(initialTargetPrice).times(1.1).toString()) : ''
            }
            validate={value => {
              if (Number(value) <= Number(initialTargetPrice)) {
                return 'Range high price must be greater than target price'
              }
              if (Number(value) <= Number(initialMinPrice)) {
                return 'Range low price must be greater than range low price'
              }
              return true
            }}
            width="full"
          />
        </VStack>
      ) : isCustom ? (
        <NumberInput
          control={reClammConfigForm.control}
          error={errors?.message}
          isPercentage={isPercentage}
          label={customInputLabel}
          name={name}
          percentageLabel={
            isCustomTargetPrice ? getPercentFromPrice(formValue, options[1].rawValue) : ''
          }
          placeholder={options[1].displayValue.replace('%', '')}
          validate={value => validateFn(value.toString())}
          width="full"
        />
      ) : null}
    </VStack>
  )
}
