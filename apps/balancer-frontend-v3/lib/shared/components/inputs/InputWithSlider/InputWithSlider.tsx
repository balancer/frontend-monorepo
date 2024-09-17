'use client'

import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { blockInvalidNumberInput } from '@/lib/shared/utils/numbers'
import {
  Box,
  BoxProps,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputProps,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  VStack,
  forwardRef,
} from '@chakra-ui/react'
import { useState } from 'react'

type Props = {
  value?: string
  boxProps?: BoxProps
  onPercentChanged: (percent: number) => void
  isNumberInputDisabled?: boolean
}

export const InputWithSlider = forwardRef(
  (
    {
      value,
      boxProps,
      onPercentChanged,
      children,
      isNumberInputDisabled,
      ...numberInputProps
    }: NumberInputProps & Props,
    ref
  ) => {
    const [sliderPercent, setSliderPercent] = useState<number>(100)
    const { toCurrency } = useCurrency()

    function handleSliderChange(percent: number) {
      setSliderPercent(percent)
      onPercentChanged(percent)
    }

    function handleInputChange(value: string) {
      if (!value || Number(value) === 0) {
        setSliderPercent(0)
        onPercentChanged(0)
      }
      // TODO: Calculate new percent based on new user input
      // const newPercent = calculateNewPercent(value)
      // onPercentChanged(newPercent)
      // setSliderPercent(newPercent)
    }

    return (
      <VStack w="full" spacing="xs">
        {children && (
          <HStack w="full" justifyContent="space-between">
            {children}
          </HStack>
        )}
        <Box
          borderRadius="md"
          py="sm"
          px="md"
          shadow="innerBase"
          bg="background.level1"
          border="white"
          w="full"
          ref={ref}
          {...boxProps}
        >
          <HStack align="start" spacing="md">
            <NumberInput
              placeholder="0.00"
              autoComplete="off"
              autoCorrect="off"
              min={0}
              border="transparent"
              bg="transparent"
              shadow="none"
              p="0"
              fontSize="xl"
              fontWeight="medium"
              value={toCurrency(value || 0)}
              onKeyDown={blockInvalidNumberInput}
              onChange={handleInputChange}
              w="50%"
              isDisabled={isNumberInputDisabled}
              {...numberInputProps}
            >
              <NumberInputField
                aria-valuenow={sliderPercent}
                pl="0"
                fontSize="2xl"
                fontWeight="medium"
                _focusVisible={{
                  borderColor: 'transparent',
                  boxShadow: 'none',
                }}
                _hover={{
                  borderColor: 'transparent',
                  boxShadow: 'none',
                }}
                _disabled={{
                  opacity: 1,
                  textColor: 'input.fontDefault',
                }}
              />
            </NumberInput>
            <Box w="50%" pr="sm" alignSelf="center">
              <Slider
                aria-label="slider"
                defaultValue={100}
                onChange={handleSliderChange}
                value={sliderPercent}
                focusThumbOnChange={false} // this is so the NumberInput won't lose focus after input
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </HStack>
        </Box>
      </VStack>
    )
  }
)
