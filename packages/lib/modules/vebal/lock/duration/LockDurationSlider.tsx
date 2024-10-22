import { Box, BoxProps } from '@chakra-ui/react'
import {
  SliderWithSteps,
  SliderWithStepsProps,
} from '@repo/lib/shared/components/inputs/SliderWithSteps'

export interface LockDurationSliderProps {
  value: number
  onChange: SliderWithStepsProps['onChange']
  min: SliderWithStepsProps['min']
  max: SliderWithStepsProps['max']
  step: SliderWithStepsProps['step']
  boxProps?: BoxProps
  steps: number[]
  minValue?: number
}

export function LockDurationSlider({
  value,
  onChange,
  min,
  max,
  step,
  boxProps,
  steps,
  minValue,
}: LockDurationSliderProps) {
  return (
    <Box
      bg="background.level0"
      border="white"
      borderRadius="md"
      shadow="innerBase"
      sx={{ paddingX: 'md', paddingY: 'lg' }}
      w="full"
      {...boxProps}
    >
      <SliderWithSteps
        aria-label="slider-lock-duration"
        max={max}
        min={min}
        minValue={minValue}
        onChange={onChange}
        step={step}
        steps={steps}
        value={value}
      />
    </Box>
  )
}
