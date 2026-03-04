import { VStack, HStack, Text, RadioGroup, Stack } from '@chakra-ui/react';
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
    | 'poolCreator'
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
  isDisabled }: PoolSettingsRadioGroupProps) {
  const {
    poolCreationForm: { control, setValue, trigger, resetField, formState } } = usePoolCreationForm()

  const handlePaste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue(name, clipboardText)
    trigger(name)
  }

  const optionsPlusCustom = [...options, { label: 'Custom', value: '' }]
  const errors = formState.errors[name]

  return (
    <VStack align="start" gap="md" w="full">
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
            <RadioGroup.Root
              aria-label={title}
              onValueChange={(details: { value: string | null }) => {
                if (details.value === '') {
                  resetField(name, { defaultValue: '' })
                } else {
                  field.onChange(details.value)
                }
              }}
              value={String(selectedRadioGroupValue)}
              w="full">
              <Stack gap={4}>
                {optionsPlusCustom.map((option, idx) => {
                  const isCustomOption = option.value === ''

                  return (
                    <VStack align="start" key={idx} w="full">
                      <RadioGroup.Item disabled={isDisabled} size="lg" value={String(option.value)}>
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemIndicator />
                        <RadioGroup.ItemText>
                          <HStack>
                            <Text color="font.primary">{option.label}</Text>
                            {option.detail && option.detail}
                          </HStack>
                        </RadioGroup.ItemText>
                      </RadioGroup.Item>
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
                                content="All new hook contracts must pass a review before 'Add Liquidity' is enabled for users on the Balancer UI."
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
                  );
                })}
              </Stack>
            </RadioGroup.Root>
          );
        }}
      />
    </VStack>
  );
}
