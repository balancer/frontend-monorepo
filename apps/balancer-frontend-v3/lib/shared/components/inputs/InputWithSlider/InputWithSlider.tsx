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
      <VStack spacing="xs" w="full">
        {children ? (
          <HStack justifyContent="space-between" w="full">
            {children}
          </HStack>
        ) : null}
        <Box
          bg="background.level1"
          border="white"
          borderRadius="md"
          px="md"
          py="sm"
          ref={ref}
          shadow="innerBase"
          w="full"
          {...boxProps}
        >
          <HStack align="start" spacing="md">
            <NumberInput
              autoComplete="off"
              autoCorrect="off"
              bg="transparent"
              border="transparent"
              fontSize="xl"
              fontWeight="medium"
              isDisabled={isNumberInputDisabled}
              min={0}
              onChange={handleInputChange}
              onKeyDown={blockInvalidNumberInput}
              p="0"
              placeholder="0.00"
              shadow="none"
              value={toCurrency(value || 0)}
              w="50%"
              {...numberInputProps}
            >
              <NumberInputField
                _disabled={{
                  opacity: 1,
                  textColor: 'input.fontDefault',
                }}
                _focusVisible={{
                  borderColor: 'transparent',
                  boxShadow: 'none',
                }}
                _hover={{
                  borderColor: 'transparent',
                  boxShadow: 'none',
                }}
                aria-valuenow={sliderPercent}
                fontSize="2xl"
                fontWeight="medium"
                pl="0"
              />
            </NumberInput>
            <Box alignSelf="center" pr="sm" w="50%">
              <Slider
                aria-label="slider"
                defaultValue={100}
                focusThumbOnChange={false} // this is so the NumberInput won't lose focus after input
                onChange={handleSliderChange}
                value={sliderPercent}
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
