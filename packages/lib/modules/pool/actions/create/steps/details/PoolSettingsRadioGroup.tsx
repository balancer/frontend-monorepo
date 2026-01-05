import { VStack, HStack, Text, RadioGroup, Radio, Stack } from '@chakra-ui/react'
import { InfoIconPopover } from '../../InfoIconPopover'
import { Controller } from 'react-hook-form'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { FormSubsection } from '@repo/lib/shared/components/inputs/FormSubsection'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { NumberInput } from '@repo/lib/shared/components/inputs/NumberInput'
import { PoolSettingsOption } from './PoolSettings'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

export interface PoolSettingsRadioGroupProps {
  title: string
  tooltip: string
  isDisabled?: boolean
  name:
    | 'swapFeeManager'
    | 'pauseManager'
    | 'swapFeePercentage'
    | 'poolHooksContract'
    | 'amplificationParameter'
  options: PoolSettingsOption[]
  isPercentage?: boolean
  customInputLabel: string
  customInputType: 'number' | 'address'
  validate?: (value: string) => string | boolean
  validateAsync?: (value: string) => Promise<string | boolean>
}

export function PoolSettingsRadioGroup({
  title,
  tooltip,
  name,
  options,
  customInputType,
  customInputLabel,
  validate,
  validateAsync,
  isPercentage,
  isDisabled,
}: PoolSettingsRadioGroupProps) {
  const {
    poolCreationForm: { control, setValue, trigger, resetField, formState },
  } = usePoolCreationForm()

  const handlePaste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue(name, clipboardText)
    trigger(name)
  }

  const optionsPlusCustom = [...options, { label: 'Custom', value: '' }]
  const errors = formState.errors[name]

  return (
    <VStack align="start" spacing="md" w="full">
      <HStack>
        <Text fontWeight="bold" textAlign="start" w="full">
          {title}
        </Text>

        <InfoIconPopover message={tooltip} />
      </HStack>

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const recommendedOptions = options.map(option => option.value)
          const isCustomOptionSelected = !recommendedOptions.includes(field.value)
          const selectedRadioGroupValue = isCustomOptionSelected ? '' : field.value

          return (
            <RadioGroup
              onChange={value => {
                if (value === '') {
                  resetField(name, { defaultValue: '' })
                } else {
                  field.onChange(value)
                }
              }}
              value={selectedRadioGroupValue}
              w="full"
            >
              <Stack spacing={4}>
                {optionsPlusCustom.map((option, idx) => {
                  const isCustomOption = option.value === ''

                  return (
                    <VStack align="start" key={idx} w="full">
                      <Radio isDisabled={isDisabled} size="lg" value={option.value}>
                        <HStack>
                          <Text color="font.primary">{option.label}</Text>
                          {option.detail && option.detail}
                        </HStack>
                      </Radio>
                      {isCustomOption &&
                        isCustomOptionSelected &&
                        (customInputType === 'address' ? (
                          <FormSubsection>
                            <Controller
                              control={control}
                              name={name}
                              render={({ field }) => (
                                <InputWithError
                                  error={errors?.message}
                                  isInvalid={!!errors}
                                  label={customInputLabel}
                                  onChange={e => field.onChange(e.target.value)}
                                  pasteFn={handlePaste}
                                  placeholder="0xba100000625a3754423978a60c9317c58a424e3D"
                                  tooltip="Paste any valid address"
                                  value={field.value}
                                />
                              )}
                              rules={{ validate: validateAsync ? validateAsync : validate }}
                            />
                            {name === 'poolHooksContract' && (
                              <BalAlert
                                content="All unapproved Hook contracts require review before a pool using it can be listed on the Balancer UI."
                                status="warning"
                                title="Unrecognized hooks require review"
                                w="full"
                              />
                            )}
                          </FormSubsection>
                        ) : (
                          <FormSubsection>
                            <NumberInput
                              control={control}
                              isDisabled={false}
                              isInvalid={false}
                              isPercentage={!!isPercentage}
                              label={customInputLabel}
                              name={name}
                              validate={value => (validate ? validate(value.toString()) : true)}
                              width="32"
                            />
                          </FormSubsection>
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
