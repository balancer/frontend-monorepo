import { VStack, Heading, Text, HStack } from '@chakra-ui/react'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { Controller } from 'react-hook-form'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'

export function PoolDetails() {
  const { poolTokens } = usePoolCreationForm()

  const tokenSymbols = poolTokens.map(token => {
    const { data, weight } = token
    if (!data) return ''
    if (weight) return weight + '% ' + data.symbol
    return data.symbol
  })

  const suggestedPoolName = tokenSymbols.join(' / ') + ' – Balancer v3'
  const suggestedPoolSymbol = 'B3-' + tokenSymbols.join('-').replace(/% /g, '-')

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
      />

      <InputWithSuggestion
        label="Pool symbol"
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
}

function InputWithSuggestion({
  label,
  name,
  placeholder,
  tooltip,
  suggestedValue,
}: InputWithSuggestionProps) {
  const {
    poolConfigForm: { control, setValue, trigger },
  } = usePoolCreationForm()

  return (
    <VStack align="start" spacing="sm" w="full">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <InputWithError
            label={label}
            onChange={e => field.onChange(e.target.value)}
            placeholder={placeholder}
            tooltip={tooltip}
            value={field.value}
          />
        )}
        rules={{
          required: `${label} is required`,
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
