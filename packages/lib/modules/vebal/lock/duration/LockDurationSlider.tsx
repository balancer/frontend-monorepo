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
      borderRadius="md"
      sx={{ paddingX: 'md', paddingY: 'lg' }}
      shadow="innerBase"
      bg="background.level0"
      border="white"
      w="full"
      {...boxProps}
    >
      <SliderWithSteps
        aria-label="slider-lock-duration"
        onChange={onChange}
        value={value}
        min={min}
        max={max}
        step={step}
        steps={steps}
        minValue={minValue}
      />
    </Box>
  )
}
