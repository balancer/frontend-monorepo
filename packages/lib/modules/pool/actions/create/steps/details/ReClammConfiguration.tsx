import { Heading, VStack, Text, HStack, Radio, SimpleGrid, useRadioGroup } from '@chakra-ui/react'
import { InfoIconPopover } from '../../InfoIconPopover'
import {
  useReClammConfigurationOptions,
  ReClammConfigOptionsGroup,
} from './useReClammConfigurationOptions'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { NumberInput } from '@repo/lib/shared/components/inputs/NumberInput'
import { bn } from '@repo/lib/shared/utils/numbers'
import { getPercentFromPrice } from '../../helpers'
import { formatNumber } from '../../helpers'
import { RadioCard } from '@repo/lib/shared/components/inputs/RadioCardGroup'
import { useFormState, useWatch } from 'react-hook-form'

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
          tooltip={option.tooltip}
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
  tooltip,
}: ReClammConfigOptionsGroup) {
  const { reClammConfigForm } = usePoolCreationForm()
  const [initialMinPrice, initialTargetPrice, initialMaxPrice] = useWatch({
    control: reClammConfigForm.control,
    name: ['initialMinPrice', 'initialTargetPrice', 'initialMaxPrice'],
  })
  const formState = useFormState({ control: reClammConfigForm.control })
  const formValue = useWatch({ control: reClammConfigForm.control, name })
  const normalizedFormValue = formValue?.toString?.() ?? ''
  const matchedOption = options.find(option => {
    if (option.rawValue === normalizedFormValue) return true
    if (option.rawValue === '' || normalizedFormValue === '') return false

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
  const cardOptions = options.filter(option => option.rawValue !== '')
  const customOption = options.find(option => option.rawValue === '')
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    value: selectedValue,
    onChange: (value: string) => updateFn(value),
  })
  const radioGroupProps = getRootProps()
  const cardContainerProps = {
    alignItems: 'center',
    bg: 'background.level2',
    borderColor: 'transparent',
    borderRadius: 'lg',
    borderWidth: '1px',
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
  } as const

  return (
    <VStack align="start" spacing="md" w="full">
      <HStack>
        <Text textAlign="start" w="full">
          {label}
        </Text>
        <InfoIconPopover message={tooltip} />
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="md" w="full" {...radioGroupProps}>
        {cardOptions.map((option, idx) => {
          const radio = getRadioProps({ value: option.rawValue })
          const key = `${label.replace(/\s+/g, '-')}-${idx}`

          return (
            <RadioCard key={key} {...radio} containerProps={cardContainerProps}>
              <VStack align="center" h="full" justify="center" spacing="1" textAlign="center">
                {option.svg && <option.svg height="100%" width="100%" />}
                <Text color="inherit" fontSize="sm">
                  {option.label}
                </Text>
                <Text color="inherit" fontWeight="bold">
                  {option.displayValue}
                </Text>
              </VStack>
            </RadioCard>
          )
        })}
      </SimpleGrid>
      {customOption ? (
        <Radio
          isChecked={selectedValue === customOption.rawValue}
          mt="2"
          name={name}
          onChange={() => updateFn(customOption.rawValue)}
          value={customOption.rawValue}
        >
          <Text color="font.secondary" fontSize="sm">
            {customOption.label}
          </Text>
        </Radio>
      ) : null}
      {isCustomPriceRange ? (
        <VStack align="start" spacing="md" w="full">
          <NumberInput
            control={reClammConfigForm.control}
            error={formState.errors['initialMinPrice']?.message}
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
            error={formState.errors['initialMaxPrice']?.message}
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
          error={formState.errors[name]?.message}
          isPercentage={isPercentage}
          label={customInputLabel}
          name={name}
          percentageLabel={
            isCustomTargetPrice ? getPercentFromPrice(formValue, options[1].rawValue) : ''
          }
          placeholder={options[1].displayValue.replace('%', '')}
          validate={value => validateFn(Number.isNaN(value) ? '' : value.toString())}
          width="full"
        />
      ) : null}
    </VStack>
  )
}
