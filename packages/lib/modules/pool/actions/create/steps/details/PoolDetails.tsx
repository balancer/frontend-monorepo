import { VStack, Heading, Text, HStack } from '@chakra-ui/react'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { Controller } from 'react-hook-form'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { validatePoolDetails } from '../../validatePoolCreationForm'

export function PoolDetails() {
  const { poolTokens } = usePoolCreationForm()

  const tokenSymbols = poolTokens.map(token => {
    const { data, weight } = token
    if (!data) return ''
    if (!weight) return data.symbol
    return weight + '% ' + data.symbol
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
        name="name"
        placeholder="Enter pool name"
        suggestedValue={suggestedPoolName}
        tooltip="The name for the pool token"
        validate={validatePoolDetails.name}
      />

      <InputWithSuggestion
        label="Pool symbol"
        name="symbol"
        placeholder="Enter pool symbol"
        suggestedValue={suggestedPoolSymbol}
        tooltip="The symbol for the pool token"
        validate={validatePoolDetails.symbol}
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
  validate: (value: string) => string | true
}

function InputWithSuggestion({
  label,
  name,
  placeholder,
  tooltip,
  suggestedValue,
  validate,
}: InputWithSuggestionProps) {
  const { poolCreationForm } = usePoolCreationForm()

  return (
    <VStack align="start" spacing="sm" w="full">
      <Controller
        control={poolCreationForm.control}
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
          validate,
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
            poolCreationForm.setValue(name, suggestedValue)
            poolCreationForm.trigger(name)
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
