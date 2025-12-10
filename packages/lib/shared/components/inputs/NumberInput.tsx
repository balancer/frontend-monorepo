import {
  Text,
  Box,
  VStack,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  HStack,
} from '@chakra-ui/react'
import { Controller, Control } from 'react-hook-form'

interface NumberInputProps {
  name: string
  control: Control<any>
  isDisabled?: boolean
  isInvalid?: boolean
  label: string
  isPercentage?: boolean
  validate: (value: number) => string | boolean
  width?: string
  error?: string
  percentageLabel?: string
  placeholder?: string
  attribution?: React.ReactNode
}

export function NumberInput({
  placeholder,
  isInvalid,
  isDisabled,
  control,
  label,
  isPercentage,
  percentageLabel,
  validate,
  name,
  width = '20',
  error,
  attribution,
}: NumberInputProps) {
  return (
    <VStack align="start" spacing="sm" w="full">
      <HStack justify="space-between" w="full">
        <Text fontWeight="bold">{label}</Text>
        {percentageLabel && (
          <Text
            color="font.secondary"
            fontSize="sm"
            opacity={Number(percentageLabel) === 0 ? 0.5 : 1}
          >
            {`${Number(percentageLabel) >= 0 ? '+' : ''}${percentageLabel}%`}
          </Text>
        )}
        {attribution && attribution}
      </HStack>

      <Box position="relative" w={width}>
        <Controller
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <>
              <ChakraNumberInput
                {...field}
                isDisabled={isDisabled}
                isInvalid={isInvalid || !!fieldState.error}
                keepWithinRange={true}
                onChange={field.onChange}
                value={field.value}
              >
                <NumberInputField max={99} min={1} placeholder={placeholder} />
              </ChakraNumberInput>
              {isPercentage && (
                <Text
                  color="font.secondary"
                  opacity={isDisabled ? 0.3 : 1}
                  position="absolute"
                  right="3"
                  top="2.5"
                  zIndex={1}
                >
                  %
                </Text>
              )}
            </>
          )}
          rules={{ validate }}
        />
      </Box>

      {error && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full">
          {error}
        </Text>
      )}
    </VStack>
  )
}
