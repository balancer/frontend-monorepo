import { VStack, Heading, Text, HStack } from '@chakra-ui/react'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { Controller } from 'react-hook-form'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { MAX_POOL_NAME_LENGTH, MAX_POOL_SYMBOL_LENGTH } from '../../constants'

export function PoolDetails() {
  const { poolTokens } = usePoolCreationForm()

  const tokenSymbols = poolTokens.map(token => {
    const { data, weight } = token
    if (!data) return ''
    if (weight) return weight + '% ' + data.symbol
    return data.symbol
  })

  const suggestedPoolName = tokenSymbols.join(' / ')
  const suggestedPoolSymbol = tokenSymbols.join('-').replace(/% /g, '-')

  return (
    <VStack align="start" spacing="xl" w="full">
      <Heading color="font.maxContrast" size="md">
        Pool details
      </Heading>

      <InputWithSuggestion
        label="Pool name"
        maxLength={MAX_POOL_NAME_LENGTH}
        name="name"
        placeholder="Enter pool name"
        suggestedValue={suggestedPoolName}
        tooltip="The name for the pool token"
      />

      <InputWithSuggestion
        label="Pool symbol"
        maxLength={MAX_POOL_SYMBOL_LENGTH}
        name="symbol"
        placeholder="Enter pool symbol"
        suggestedValue={suggestedPoolSymbol}
        tooltip="The symbol for the pool token"
      />
    </VStack>
  )
}

interface InputWithSuggestionProps {
  label: string
  name: 'name' | 'symbol'
  placeholder: string
  tooltip: string
  suggestedValue: string
  maxLength: number
  validate?: (value: string) => string | true
}

function InputWithSuggestion({
  label,
  name,
  placeholder,
  tooltip,
  suggestedValue,
  maxLength,
}: InputWithSuggestionProps) {
  const {
    poolConfigForm: { control, setValue, trigger },
  } = usePoolCreationForm()

  return (
    <VStack align="start" spacing="sm" w="full">
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState: { error } }) => (
          <InputWithError
            error={error?.message}
            label={label}
            onChange={e => field.onChange(e.target.value)}
            placeholder={placeholder}
            tooltip={tooltip}
            value={field.value}
          />
        )}
        rules={{
          required: `${label} is required`,
          validate: value => {
            if (value.length < 4) return `${label} must be 4 characters or more`
            if (value.length > maxLength) return `${label} must be ${maxLength} characters or less`
            return true
          },
        }}
      />
      <HStack spacing="xs">
        <Text color="font.secondary" fontSize="sm">
          Suggestion:
        </Text>
        <Text
          color="font.link"
          cursor="pointer"
          fontSize="sm"
          onClick={() => {
            setValue(name, suggestedValue)
            trigger(name)
          }}
          textDecoration="underline"
          textDecorationStyle="dotted"
          textDecorationThickness="1px"
          textUnderlineOffset="3px"
        >
          {suggestedValue}
        </Text>
      </HStack>
    </VStack>
  )
}
