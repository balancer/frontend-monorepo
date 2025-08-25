import { VStack, HStack, Text, RadioGroup, Radio, Stack, InputGroup } from '@chakra-ui/react'
import { BalPopover } from '@repo/lib/shared/components/popover/BalPopover'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { Controller } from 'react-hook-form'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { NumberInput } from '@repo/lib/shared/components/inputs/NumberInput'
import { PoolSettingsOption } from './PoolSettings'

export interface PoolSettingsRadioGroupProps {
  title: string
  tooltip: string
  name:
    | 'swapFeeManager'
    | 'pauseManager'
    | 'swapFeePercentage'
    | 'poolHooksContract'
    | 'amplificationParameter'
  options: PoolSettingsOption[]
  isPercentage?: boolean
  errorMsg?: string
  customInputLabel: string
  customInputType: 'number' | 'address'
  validate: (value: string) => string | true
}

export function PoolSettingsRadioGroup({
  title,
  tooltip,
  name,
  options,
  customInputType,
  errorMsg,
  customInputLabel,
  validate,
  isPercentage,
}: PoolSettingsRadioGroupProps) {
  const {
    poolConfigForm: { control, setValue, trigger },
  } = usePoolCreationForm()

  const handlePaste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue(name, clipboardText)
    trigger(name)
  }

  const radioGroupOptions = [...options, { label: 'Custom', value: '' }]

  return (
    <VStack align="start" spacing="md" w="full">
      <HStack>
        <Text textAlign="start" w="full">
          {title}
        </Text>
        <BalPopover text={tooltip}>
          <InfoIcon />
        </BalPopover>
      </HStack>

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const predefinedValues = options.map(option => option.value)
          const isCustomOptionSelected = !predefinedValues.includes(field.value)
          const radioValue = isCustomOptionSelected ? '' : field.value

          return (
            <RadioGroup onChange={field.onChange} value={radioValue} w="full">
              <Stack spacing={4}>
                {radioGroupOptions.map(option => {
                  const isCustomOption = option.value === ''

                  return (
                    <VStack align="start" key={option.value} w="full">
                      <Radio
                        isDisabled={!option.value && option.value !== ''}
                        size="lg"
                        value={option.value}
                      >
                        <HStack>
                          <Text
                            color="font.primary"
                            {...(isCustomOption && {
                              textDecoration: 'underline',
                              textDecorationStyle: 'dotted',
                              textDecorationThickness: '1px',
                              textUnderlineOffset: '3px',
                            })}
                          >
                            {option.label}
                          </Text>
                          {option.detail && option.detail}
                        </HStack>
                      </Radio>
                      {isCustomOption &&
                        isCustomOptionSelected &&
                        (customInputType === 'address' ? (
                          <VStack align="start" spacing="sm" w="full">
                            <InputGroup>
                              <Controller
                                control={control}
                                name={name}
                                render={({ field }) => (
                                  <InputWithError
                                    error={errorMsg}
                                    isInvalid={!!errorMsg}
                                    label={customInputLabel}
                                    onChange={e => field.onChange(e.target.value)}
                                    pasteFn={handlePaste}
                                    placeholder="0xba100000625a3754423978a60c9317c58a424e3D"
                                    tooltip="TODO"
                                    value={field.value}
                                  />
                                )}
                                rules={{ validate }}
                              />
                            </InputGroup>
                          </VStack>
                        ) : (
                          <NumberInput
                            control={control}
                            isDisabled={false}
                            isInvalid={false}
                            isPercentage={!!isPercentage}
                            label={customInputLabel}
                            name={name}
                            validate={value => validate(value.toString())}
                            width="32"
                          />
                        ))}
                    </VStack>
                  )
                })}
              </Stack>
            </RadioGroup>
          )
        }}
      />
    </VStack>
  )
}
