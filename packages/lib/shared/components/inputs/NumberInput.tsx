import {
  Text,
  Box,
  VStack,
  NumberInput as ChakraNumberInput,
  NumberInputField,
} from '@chakra-ui/react'
import { Controller, Control } from 'react-hook-form'

interface NumberInputProps {
  name: string
  control: Control<any>
  isDisabled: boolean
  isInvalid: boolean
  label: string
  isPercentage: boolean
  validate: (value: number) => string | true
}

export function NumberInput({
  isInvalid,
  isDisabled,
  control,
  label,
  isPercentage,
  validate,
  name,
}: NumberInputProps) {
  return (
    <VStack align="start" spacing="sm">
      <Text>{label}</Text>
      <Box position="relative" w="20">
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
                <NumberInputField max={99} min={1} placeholder="0" />
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
    </VStack>
  )
}
