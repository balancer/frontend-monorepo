import { VStack, Text, HStack } from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { Control } from 'react-hook-form'

interface InputWithSuggestionProps {
  control: Control<any>
  label: string
  name: string
  onClickSuggestion: () => void
  placeholder: string
  suggestionLabel?: string
  suggestedValue?: string
  tooltip: string
  validate: (value: string) => string | true
  attribution?: React.ReactNode
  isFiatPrice?: boolean
}

export function InputWithSuggestion({
  control,
  label,
  name,
  placeholder,
  suggestionLabel = 'Suggested',
  suggestedValue,
  tooltip,
  onClickSuggestion,
  validate,
  attribution,
  isFiatPrice,
}: InputWithSuggestionProps) {
  return (
    <VStack align="start" spacing="sm" w="full">
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState: { error } }) => (
          <InputWithError
            error={error?.message}
            isFiatPrice={isFiatPrice}
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
      {suggestedValue && (
        <HStack justify="space-between" w="full">
          <HStack spacing="xs">
            <Text color="font.secondary" fontSize="sm">
              {suggestionLabel}:
            </Text>
            <Text
              color="font.link"
              cursor="pointer"
              fontSize="sm"
              onClick={onClickSuggestion}
              textDecoration="underline"
              textDecorationStyle="dotted"
              textDecorationThickness="1px"
              textUnderlineOffset="3px"
            >
              {suggestedValue}
            </Text>
          </HStack>
          {attribution && attribution}
        </HStack>
      )}
    </VStack>
  )
}
