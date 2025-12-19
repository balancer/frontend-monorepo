import {
  Text,
  Box,
  VStack,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  HStack,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { Controller, Control } from 'react-hook-form'
import { BalPopover } from '../popover/BalPopover'
import { InfoIcon } from '../icons/InfoIcon'

interface NumberInputProps {
  name: string
  control: Control<any>
  isDisabled?: boolean
  isInvalid?: boolean
  label: string
  isPercentage?: boolean
  validate: (value: number) => string | boolean
  width?: string
  percentageLabel?: string
  placeholder?: string
  attribution?: React.ReactNode
  suggestedValue?: number
  onClickSuggestion?: () => void
  tooltip?: string
  isFiatPrice?: boolean
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
  attribution,
  suggestedValue,
  onClickSuggestion,
  tooltip,
  isFiatPrice,
}: NumberInputProps) {
  return (
    <VStack align="start" spacing="sm" w="full">
      <HStack justify="space-between" w="full">
        <HStack spacing="xs">
          <Text fontWeight="bold">{label}</Text>
          {tooltip && (
            <BalPopover text={tooltip}>
              <Box
                _hover={{ opacity: 1 }}
                as="span"
                cursor="pointer"
                display="inline-flex"
                ml="1"
                opacity="0.5"
                transition="opacity 0.2s var(--ease-out-cubic)"
                verticalAlign="middle"
              >
                <InfoIcon as="span" />
              </Box>
            </BalPopover>
          )}
        </HStack>

        {percentageLabel && (
          <Text
            color="font.secondary"
            fontSize="sm"
            opacity={Number(percentageLabel) === 0 ? 0.5 : 1}
          >
            {`${Number(percentageLabel) >= 0 ? '+' : ''}${percentageLabel}%`}
          </Text>
        )}
      </HStack>

      <Box position="relative" w={width}>
        <Controller
          control={control}
          name={name}
          render={({ field, fieldState }) => {
            const isSuggestionApplied = Number(field.value) === suggestedValue
            const errorMessage = fieldState.error?.message
            return (
              <>
                <InputGroup width={width}>
                  {isFiatPrice && (
                    <InputLeftElement pointerEvents="none">
                      <Text>$</Text>
                    </InputLeftElement>
                  )}
                  <ChakraNumberInput
                    {...field}
                    isDisabled={isDisabled}
                    isInvalid={isInvalid || !!fieldState.error}
                    keepWithinRange={true}
                    onChange={field.onChange}
                    value={field.value}
                    w="full"
                  >
                    <NumberInputField
                      max={99}
                      min={1}
                      pl={isFiatPrice ? '8' : undefined}
                      placeholder={placeholder}
                    />
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
                </InputGroup>

                {errorMessage && (
                  <Text color="font.error" fontSize="sm" textAlign="start" w="full">
                    {errorMessage}
                  </Text>
                )}

                {suggestedValue && (
                  <HStack justify="space-between" mt="xs" w="full">
                    <HStack spacing="xs">
                      <Text color="font.secondary" fontSize="sm">
                        Suggested:
                      </Text>
                      <Text
                        color={isSuggestionApplied ? 'font.secondary' : 'font.link'}
                        cursor={isSuggestionApplied ? 'default' : 'pointer'}
                        fontSize="sm"
                        onClick={isSuggestionApplied ? undefined : onClickSuggestion}
                        textDecoration={isSuggestionApplied ? 'none' : 'underline dotted 1px'}
                        textUnderlineOffset="3px"
                      >
                        {isFiatPrice && '$'}
                        {suggestedValue}
                      </Text>
                    </HStack>
                    {attribution && attribution}
                  </HStack>
                )}
              </>
            )
          }}
          rules={{ validate }}
        />
      </Box>
    </VStack>
  )
}
