import {
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  SliderProps,
  useToken,
} from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'

export interface SliderWithStepsProps extends SliderProps {
  steps: number[]
  minValue?: number
}

export function SliderWithSteps({ steps, minValue, ...props }: SliderWithStepsProps) {
  const [bgSecondary, bgHighlight] = useToken('colors', ['font.secondary', 'background.highlight'])

  const value = useMemo(() => {
    if (typeof minValue === 'undefined' || typeof props.value === 'undefined') {
      return props.value ?? 0
    }
    return props.value >= minValue ? props.value : minValue
  }, [minValue, props.value])

  const onChange = (value: number) => {
    if (typeof minValue === 'undefined') {
      props.onChange?.(value)
      return
    }
    props.onChange?.(value >= minValue ? value : minValue)
  }

  const filledTrackBackground = useMemo(() => {
    if (typeof minValue === 'undefined') {
      return undefined
    }
    const min = props.min ?? 0
    const fixedValue = min + Math.sign(min || 1) * value
    const percentage = 100 - (100 * (fixedValue - minValue)) / fixedValue
    return `linear-gradient(to right, ${bgSecondary} ${percentage}%, ${bgHighlight} ${percentage}%)`
  }, [minValue, bgSecondary, bgHighlight, value, props.min])

  const getSliderMarkColor = useCallback(
    (step: number) => {
      const defaultMarkColor = step <= value ? 'background.highlight' : 'background.level2'
      if (typeof minValue === 'undefined') {
        return defaultMarkColor
      }
      return step < minValue ? 'font.secondary' : defaultMarkColor
    },
    [value, minValue]
  )

  return (
    <Slider {...props} value={value} onChange={onChange}>
      {steps &&
        steps.map(step => (
          <SliderMark
            key={step}
            value={step}
            width="8px"
            height="8px"
            bg={getSliderMarkColor(step)}
            borderRadius="full"
            border="1px solid"
            borderColor={step <= value ? 'background.base' : 'transparent'}
            zIndex="1"
            top="4px"
          />
        ))}
      <SliderTrack>
        <SliderFilledTrack background={filledTrackBackground} />
      </SliderTrack>
      <SliderThumb />
    </Slider>
  )
}
