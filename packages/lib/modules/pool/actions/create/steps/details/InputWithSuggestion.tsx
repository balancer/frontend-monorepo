import { VStack, Text, HStack } from '@chakra-ui/react'
import { Controller, Control } from 'react-hook-form'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'

interface InputWithSuggestionProps {
  control: Control<any>
  label: string
  name: string
  onClickSuggestion?: () => void
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
        render={({ field, fieldState: { error } }) => {
          const isSuggestionApplied = field.value === suggestedValue

          return (
            <>
              <InputWithError
                error={error?.message}
                isFiatPrice={isFiatPrice}
                label={label}
                onChange={e => field.onChange(e.target.value)}
                placeholder={placeholder}
                tooltip={tooltip}
                value={field.value}
              />
              {suggestedValue && (
                <HStack justify="space-between" w="full">
                  <HStack spacing="xs">
                    <Text color="font.secondary" fontSize="sm">
                      {suggestionLabel}:
                    </Text>
                    <Text
                      color={isSuggestionApplied ? 'font.secondary' : 'font.link'}
                      cursor={isSuggestionApplied ? 'default' : 'pointer'}
                      fontSize="sm"
                      onClick={isSuggestionApplied ? undefined : onClickSuggestion}
                      textDecoration={isSuggestionApplied ? 'none' : 'underline dotted 1px'}
                      textUnderlineOffset="3px"
                    >
                      {suggestedValue}
                    </Text>
                  </HStack>
                  {attribution && attribution}
                </HStack>
              )}
            </>
          )
        }}
        rules={{
          required: `${label} is required`,
          validate,
        }}
      />
    </VStack>
  )
}
