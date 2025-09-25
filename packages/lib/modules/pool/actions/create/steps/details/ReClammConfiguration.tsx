import { Heading, VStack, Text, HStack } from '@chakra-ui/react'
import { BalPopover } from '@repo/lib/shared/components/popover/BalPopover'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import {
  useReClammConfigurationOptions,
  ReClammConfigOptionsGroup,
} from './useReClammConfigurationOptions'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { NumberInput } from '@repo/lib/shared/components/inputs/NumberInput'
import { bn } from '@repo/lib/shared/utils/numbers'
import { getPercentFromPrice } from '../../helpers'
import { formatNumber } from '../../helpers'
import { PoolCreationCheckbox } from '../../PoolCreationCheckbox'
import { RadioCardGroup } from '@repo/lib/shared/components/inputs/RadioCardGroup'

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
  const normalizedFormValue = formValue?.toString?.() ?? ''
  const matchedOption = options.find(option => {
    if (option.rawValue === normalizedFormValue) return true

    const optionNumber = Number(option.rawValue)
    const formValueNumber = Number(normalizedFormValue)

    if (Number.isNaN(optionNumber) || Number.isNaN(formValueNumber)) return false

    return optionNumber === formValueNumber
  })

  const isCustom = matchedOption ? matchedOption.rawValue === '' : normalizedFormValue !== ''
  const selectedValue = isCustom ? '' : (matchedOption?.rawValue ?? '')
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
      <RadioCardGroup
        layoutProps={{ columns: { base: 1, md: 3 }, spacing: 'md', w: 'full' }}
        name={name}
        onChange={value => updateFn(value)}
        options={options.map(option => ({
          value: option.rawValue,
          label: (
            <VStack align="center" h="full" justify="center" spacing="1" textAlign="center">
              <option.svg height="100%" width="100%" />
              <Text color="inherit" fontSize="sm">
                {option.label}
              </Text>
              <Text color="inherit" fontWeight="bold">
                {option.displayValue}
              </Text>
            </VStack>
          ),
        }))}
        radioCardProps={{
          containerProps: {
            alignItems: 'center',
            bg: 'background.level2',
            borderColor: 'transparent',
            borderRadius: 'lg',
            borderWidth: '2px',
            boxShadow: 'lg',
            color: 'font.secondary',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            h: 141,
            justifyContent: 'center',
            px: 2,
            py: 3,
            textAlign: 'center',
            _checked: {
              bg: '#63F2BE0D',
              borderColor: 'green.400 !important',
              boxShadow: 'none',
              color: 'font.maxContrast',
            },
            _hover: {
              boxShadow: 'md',
            },
          },
        }}
        value={selectedValue}
      />
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
          error={reClammConfigForm.formState.errors[name]?.message}
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
