'use client'

import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { blockInvalidNumberInput } from '@repo/lib/shared/utils/numbers'
import {
  Box,
  BoxProps,
  HStack,
  NumberInput,
  Slider,
  SliderThumb,
  SliderTrack,
  VStack,
  useChakraContext,
} from '@chakra-ui/react'
import { useState, forwardRef } from 'react'
import { resolveChakraToken } from '@repo/lib/shared/services/chakra/theme-helpers'

type Props = {
  value?: string
  boxProps?: BoxProps
  onPercentChanged: (percent: number) => void
  isNumberInputDisabled?: boolean
  isWarning?: boolean
  children?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

export const InputWithSlider = forwardRef(
  (
    {
      value,
      boxProps,
      onPercentChanged,
      children,
      isNumberInputDisabled,
      isWarning,
      ...numberInputProps
    }: Props,
    ref
  ) => {
    const [sliderPercent, setSliderPercent] = useState<number>(100)
    const { toCurrency } = useCurrency()
    const system = useChakraContext()

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

    const boxShadowColor = resolveChakraToken(system, 'colors', 'font.warning')

    const boxShadow = isWarning ? `0 0 0 1px ${boxShadowColor}` : undefined

    return (
      <VStack gap="sm" w="full">
        {children && (
          <HStack justifyContent="space-between" w="full">
            {children}
          </HStack>
        )}
        <Box
          bg="background.level2"
          border="white"
          borderRadius="md"
          boxShadow={boxShadow}
          px="md"
          py="sm"
          ref={ref}
          shadow="md"
          w="full"
          {...boxProps}
        >
          <HStack align="start" gap="md">
            <NumberInput.Root
              autoComplete="off"
              autoCorrect="off"
              bg="transparent"
              border="transparent"
              disabled={isNumberInputDisabled}
              fontSize="xl"
              fontWeight="medium"
              min={0}
              onKeyDown={blockInvalidNumberInput}
              onValueChange={handleInputChange}
              p="0"
              placeholder="0.00"
              shadow="none"
              value={String(toCurrency(value || 0))}
              w="50%"
              {...numberInputProps}
            >
              <NumberInput.Input
                _disabled={{
                  opacity: 1,
                  textColor: 'input.fontDefault',
                }}
                _focusVisible={{
                  borderColor: 'transparent',
                  boxShadow: 'none',
                  shadow: 'none',
                }}
                _hover={{
                  borderColor: 'transparent',
                  boxShadow: 'none',
                }}
                aria-valuenow={sliderPercent}
                boxShadow="none"
                fontSize="2xl"
                fontWeight="medium"
                pl="0"
                shadow="none"
              />
            </NumberInput.Root>
            <Box alignSelf="center" pr="sm" w="50%">
              <Slider.Root
                aria-label="slider"
                defaultValue="100"
                focusThumbOnChange={false} // this is so the NumberInput won't lose focus after input
                onValueChange={handleSliderChange}
                value={String(sliderPercent)}
              >
                <SliderTrack
                  bg="background.level0"
                  borderBottom="1px solid"
                  borderColor="background.level4"
                  height="6px"
                  shadow="innerBase"
                >
                  <Slider.Range />
                </SliderTrack>
                <SliderThumb />
              </Slider.Root>
            </Box>
          </HStack>
        </Box>
      </VStack>
    )
  }
)
