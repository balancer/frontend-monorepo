import { VStack, HStack, Text, RadioGroup, Radio, Stack, InputGroup } from '@chakra-ui/react'
import { BalPopover } from '@repo/lib/shared/components/popover/BalPopover'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { Controller } from 'react-hook-form'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { NumberInput } from '@repo/lib/shared/components/inputs/NumberInput'

export interface PoolSettingsRadioGroupProps {
  title: string
  tooltip: string
  name:
    | 'swapFeeManager'
    | 'pauseManager'
    | 'swapFeePercentage'
    | 'poolHooksContract'
    | 'amplificationParameter'
  options: { label: string; value: string | undefined; reccomendation?: string }[]
  isCustom: boolean
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
  isCustom,
  customInputType = 'address',
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
          const predefinedValues = options.slice(0, -1).map(option => option.value)
          const isCustomValue = !predefinedValues.includes(field.value)
          const radioValue = isCustomValue ? options[options.length - 1].value : field.value

          return (
            <RadioGroup onChange={field.onChange} value={radioValue}>
              <Stack spacing={4}>
                {options.map((option, index) => {
                  return (
                    <Radio key={option.value} size="lg" value={option.value}>
                      <HStack>
                        <Text
                          color="font.primary"
                          {...(index === options.length - 1 && {
                            textDecoration: 'underline',
                            textDecorationStyle: 'dotted',
                            textDecorationThickness: '1px',
                            textUnderlineOffset: '3px',
                          })}
                        >
                          {option.label}
                        </Text>
                        {option.reccomendation && (
                          <Text color="font.secondary" fontSize="sm">
                            {option.reccomendation}
                          </Text>
                        )}
                      </HStack>
                    </Radio>
                  )
                })}
              </Stack>
            </RadioGroup>
          )
        }}
      />
      {isCustom &&
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
}
