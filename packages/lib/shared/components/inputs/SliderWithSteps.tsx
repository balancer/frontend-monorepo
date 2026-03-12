import { Slider, SliderMarker, SliderThumb, SliderTrack, useToken } from '@chakra-ui/react'
import { Tooltip } from '../../../shared/components/tooltips/Tooltip'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface SliderWithStepsProps {
  steps: number[]
  minValue?: number
  variant?: string
  value?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
  [key: string]: any
}

export function SliderWithSteps({
  steps,
  minValue,
  variant: _variant,
  ...props
}: SliderWithStepsProps) {
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

  const slider = useRef<HTMLDivElement>(null)
  const filledTrack = useRef<HTMLDivElement>(null)
  const [disabledTooltip, setDisabledTooltip] = useState(false)
  const [filledTrackFocused, setFilledTrackFocused] = useState(false)
  useEffect(() => {
    const sliderRef = slider.current
    const filledTrackRef = filledTrack.current
    if (sliderRef && filledTrackRef) {
      const sliderWidthInPixels =
        sliderRef.getBoundingClientRect().right - sliderRef.getBoundingClientRect().left
      const minPercentage = (minValue || 0) / ((props.max || 0) - (props.min || 0))
      const minInPixels =
        sliderRef.getBoundingClientRect().left +
        window.pageXOffset +
        sliderWidthInPixels * minPercentage

      const onMoveHandler = (event: MouseEvent) => setDisabledTooltip(event.pageX > minInPixels)
      filledTrackRef.addEventListener('mousemove', onMoveHandler)

      return () => {
        filledTrackRef.removeEventListener('mousemove', onMoveHandler)
      }
    }
  }, [minValue, props.max, props.min])

  return (
    <Slider.Root {...props} onValueChange={onChange} value={String(value)}>
      {steps &&
        steps.map(step => (
          <SliderMarker
            bg={getSliderMarkColor(step)}
            border="1px solid"
            borderColor={step <= value ? 'background.base' : 'transparent'}
            borderRadius="full"
            height="8px"
            key={step}
            top="3px"
            value={String(step)}
            width="8px"
            zIndex="1"
          />
        ))}
      <SliderTrack ref={slider}>
        <Tooltip
          content="You have an existing lock and can't reduce the lock period. You can only slide right to extend the lock period"
          open={filledTrackFocused && !disabledTooltip}
          positioning={{
            placement: 'top-start',
          }}
          showArrow
        >
          <Slider.Range
            background={filledTrackBackground}
            cursor={filledTrackFocused && !disabledTooltip ? 'not-allowed' : 'pointer'}
            onMouseEnter={() => setFilledTrackFocused(true)}
            onMouseOut={() => setFilledTrackFocused(false)}
            ref={filledTrack}
          />
        </Tooltip>
      </SliderTrack>
      <SliderThumb index={0} />
    </Slider.Root>
  )
}
